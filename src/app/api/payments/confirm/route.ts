import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const sid = url.searchParams.get("sid") || "";
    if (!sid) {
      return NextResponse.json({ error: "missing sid" }, { status: 400 });
    }
    const key = process.env.STRIPE_SECRET_KEY || "";
    if (!key) {
      return NextResponse.json({ error: "missing stripe key" }, { status: 500 });
    }
    const stripe = new Stripe(key, {});
    const session = await stripe.checkout.sessions.retrieve(sid, { expand: ["payment_intent"] });
    if (!session || session.id !== sid) {
      return NextResponse.json({ error: "session not found" }, { status: 404 });
    }
    const meta = session.metadata || {};
    let piId: string | undefined;
    if (typeof session.payment_intent === "string") {
      piId = session.payment_intent;
    } else if (session.payment_intent && typeof (session.payment_intent as Stripe.PaymentIntent).id === "string") {
      piId = (session.payment_intent as Stripe.PaymentIntent).id;
    }
    const existing = await prisma.payment
      .findFirst({
        where: {
          OR: [
            ...(piId ? [{ stripePaymentIntentId: piId }] as const : []),
            { stripeSessionId: session.id },
          ],
        },
      })
      .catch(() => null);
    if (existing) {
      return NextResponse.json({ ok: true, id: existing.id }, { status: 200 });
    }
    const stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id || "";
    const termMonths = Number(meta.termMonths || 1) || 1;
    const email = (meta.email as string) || (session.customer_email as string) || "";
    const name = (meta.name as string) || "";
    const now = new Date();
    let dealer = null as null | { id: string; termEndAt: Date | null; termStartAt: Date | null; stripeCustomerId: string | null };
    const metaDealerId = meta.dealerId ? String(meta.dealerId) : "";
    if (metaDealerId) {
      const d = await prisma.dealer.findUnique({ where: { id: metaDealerId } });
      if (d) {
        dealer = { id: d.id, termEndAt: d.termEndAt ?? null, termStartAt: d.termStartAt ?? null, stripeCustomerId: d.stripeCustomerId ?? null };
      }
    }
    if (!dealer && email) {
      const d = await prisma.dealer.findFirst({ where: { contactEmail: email } });
      if (d) {
        dealer = { id: d.id, termEndAt: d.termEndAt ?? null, termStartAt: d.termStartAt ?? null, stripeCustomerId: d.stripeCustomerId ?? null };
      }
    }
    if (!dealer && stripeCustomerId) {
      const d = await prisma.dealer.findFirst({ where: { stripeCustomerId } });
      if (d) {
        dealer = { id: d.id, termEndAt: d.termEndAt ?? null, termStartAt: d.termStartAt ?? null, stripeCustomerId: d.stripeCustomerId ?? null };
      }
    }
    if (!dealer) {
      const base = (name || email.split("@")[0] || "dealer").toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
      const slug = `${base}-${Math.random().toString(36).slice(2, 7)}`;
      const created = await prisma.dealer.create({
        data: {
          name: name || (email ? email.split("@")[0] : "Dealer"),
          slug,
          contactEmail: email || null,
          billingStatus: "active",
        },
      });
      dealer = { id: created.id, termEndAt: created.termEndAt ?? null, termStartAt: created.termStartAt ?? null, stripeCustomerId: created.stripeCustomerId ?? null };
    }
    const anchor = dealer.termEndAt && dealer.termEndAt > now ? dealer.termEndAt : now;
    const startDate = meta.startDate ? new Date(String(meta.startDate)) : anchor;
    const endDate = addMonths(anchor, termMonths);
    const amountSubtotal = typeof session.amount_subtotal === "number" ? session.amount_subtotal : 0;
    const amountTotal = typeof session.amount_total === "number" ? session.amount_total : amountSubtotal;
    const currency = (session.currency || "usd").toLowerCase();
    await prisma.$transaction([
      prisma.dealer.update({
        where: { id: dealer.id },
        data: {
          stripeCustomerId: stripeCustomerId || dealer.stripeCustomerId || null,
          billingStatus: "active",
          termStartAt: dealer.termStartAt ?? startDate,
          termEndAt: endDate,
        },
      }),
      prisma.payment.upsert({
        where: { stripeSessionId: session.id },
        update: {},
        create: {
          dealerId: dealer.id,
          amount: amountTotal,
          currency,
          status: "succeeded",
          method: "card",
          provider: "stripe",
          stripePaymentIntentId: piId,
          stripeSessionId: session.id,
          stripeCustomerId,
          termMonths,
          startDate,
          endDate,
        },
      }),
    ]);
    const apiKey = process.env.BREVO_API_KEY || "";
    if (apiKey && email) {
      const amountUsd = (amountTotal / 100).toFixed(2);
      const serviceName = "CarCupid Inventory Placement";
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { margin:0; padding:0; background:#f9f9f9; color:#1a1a1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
              .container { max-width: 640px; margin: 0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
              .header { background:#1F1F23; padding:28px 24px; color:#F5F5F7; }
              .title { margin:0; font-size:22px; font-weight:800; }
              .subtitle { margin:6px 0 0 0; opacity:0.9; }
              .content { padding:24px; }
              .row { margin-bottom:12px; display:flex; justify-content:space-between; }
              .label { color:#666; }
              .value { font-weight:700; }
              .badge { display:inline-block; background:#1a1a1a; color:#fff; padding:8px 14px; border-radius:999px; font-size:13px; font-weight:700; }
              .footer { text-align:center; padding:18px; font-size:12px; color:#777; }
            </style>
          </head>
          <body>
            <div style="padding:20px;">
              <div class="container">
                <div class="header">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="120" align="left" valign="middle">
                        <img src="https://carcupid.fit/cupids/carcupid-keys.png" alt="CarCupid" width="100" style="display:block;border:0;max-width:100px;height:auto;" />
                      </td>
                      <td align="left" valign="middle">
                        <h1 class="title">Payment Receipt</h1>
                        <p class="subtitle">Thank you for your purchase.</p>
                      </td>
                    </tr>
                  </table>
                </div>
                <div class="content">
                  <div class="row"><span class="label">Service</span><span class="value">${serviceName}</span></div>
                  <div class="row"><span class="label">Amount</span><span class="value">$${amountUsd} USD</span></div>
                  <div class="row"><span class="label">Term</span><span class="value">${termMonths} month(s)</span></div>
                  <div class="row"><span class="label">Start</span><span class="value">${startDate.toISOString().slice(0,10)}</span></div>
                  <div class="row"><span class="label">End</span><span class="value">${endDate.toISOString().slice(0,10)}</span></div>
                  <div style="margin-top:18px;">
                    <span class="badge">Order Confirmed</span>
                  </div>
                </div>
                <div class="footer">
                  <div>© ${new Date().getFullYear()} CarCupid</div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { accept: "application/json", "api-key": apiKey, "content-type": "application/json" },
        body: JSON.stringify({
          sender: { name: "CarCupid", email: "noreply@carcupid.fit" },
          to: [{ email }],
          subject: "Payment Receipt – CarCupid",
          htmlContent,
        }),
      }).catch(() => {});
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

function addMonths(date: Date, months: number) {
  const d = new Date(date.getTime());
  d.setMonth(d.getMonth() + months);
  return d;
}
