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
      const orderId = session.id ? session.id.slice(-6).toUpperCase() : "";
      let receiptUrl: string | undefined;
      try {
        if (typeof session.payment_intent !== "string" && session.payment_intent) {
          const pi = session.payment_intent as Stripe.PaymentIntent;
          if (typeof pi.latest_charge === "string") {
            const charge = await stripe.charges.retrieve(pi.latest_charge);
            if (charge && typeof charge.receipt_url === "string") {
              receiptUrl = charge.receipt_url;
            }
          }
        }
      } catch {
        receiptUrl = undefined;
      }
      let invoicePdfB64: string | undefined;
      let invoicePdfName: string | undefined;
      let hostedInvoiceUrl: string | undefined;
      try {
        if (typeof session.invoice === "string") {
          const invoice = await stripe.invoices.retrieve(session.invoice);
          hostedInvoiceUrl = invoice.hosted_invoice_url || undefined;
          if (invoice.invoice_pdf) {
            const resp = await fetch(invoice.invoice_pdf);
            if (resp.ok) {
              const arr = await resp.arrayBuffer();
              invoicePdfB64 = Buffer.from(arr).toString("base64");
              invoicePdfName = `invoice_${orderId || invoice.id}.pdf`;
            }
          }
        }
      } catch {
        invoicePdfB64 = undefined;
      }
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="x-ua-compatible" content="ie=edge">
            <title>Payment Receipt</title>
            <style>
              @media (max-width: 640px) {
                .w-640 { width: 100% !important; }
                .px-24 { padding-left: 16px !important; padding-right: 16px !important; }
              }
            </style>
          </head>
          <body style="margin:0;padding:0;background:#F5F7FB;color:#1A1A1A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F7FB;">
              <tr>
                <td align="center" style="padding:20px;">
                  <div style="max-width:640px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.06);" class="w-640">
                    <div style="background:#1F1F23;padding:28px 24px;color:#F5F5F7;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td width="120" valign="middle" style="padding-right:16px;">
                            <img src="https://carcupid.fit/cupids/carcupid-keys.png" alt="CarCupid" width="100" style="display:block;border:0;max-width:100%;height:auto;">
                          </td>
                          <td valign="middle">
                            <div style="font-size:22px;font-weight:800;line-height:1.2;margin:0;">Payment Receipt</div>
                            <div style="margin-top:6px;opacity:0.9;font-size:14px;line-height:1.4;">Thank you for your purchase.</div>
                          </td>
                        </tr>
                      </table>
                    </div>
                    <div style="padding:24px;" class="px-24">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                        <tr>
                          <td style="padding:12px 0;color:#666;">Order</td>
                          <td align="right" style="padding:12px 0;font-weight:700;color:#1A1A1A;">${orderId}</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="border-bottom:1px solid #EEE;"></td>
                        </tr>
                        <tr>
                          <td style="padding:12px 0;color:#666;">Service</td>
                          <td align="right" style="padding:12px 0;font-weight:700;color:#1A1A1A;">${serviceName}</td>
                        </tr>
                        <tr>
                          <td style="padding:12px 0;color:#666;">Amount</td>
                          <td align="right" style="padding:12px 0;font-weight:900;color:#E5483F;">$${amountUsd} USD</td>
                        </tr>
                        <tr>
                          <td style="padding:12px 0;color:#666;">Term</td>
                          <td align="right" style="padding:12px 0;font-weight:700;color:#1A1A1A;">${termMonths} month(s)</td>
                        </tr>
                        <tr>
                          <td style="padding:12px 0;color:#666;">Start</td>
                          <td align="right" style="padding:12px 0;font-weight:700;color:#1A1A1A;">${startDate.toISOString().slice(0,10)}</td>
                        </tr>
                        <tr>
                          <td style="padding:12px 0;color:#666;">End</td>
                          <td align="right" style="padding:12px 0;font-weight:700;color:#1A1A1A;">${endDate.toISOString().slice(0,10)}</td>
                        </tr>
                      </table>
                      <div style="text-align:center;margin-top:22px;">
                        <a href="https://carcupid.fit" style="display:inline-block;background:#1A1A1A;color:#FFFFFF;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:700;">Order Confirmed</a>
                      </div>
                      ${receiptUrl ? `<div style="text-align:center;margin-top:10px;">
                        <a href="${receiptUrl}" style="color:#1A1A1A;text-decoration:underline;font-weight:700;">View Stripe Receipt</a>
                      </div>` : ""}
                      ${hostedInvoiceUrl ? `<div style="text-align:center;margin-top:6px;">
                        <a href="${hostedInvoiceUrl}" style="color:#1A1A1A;text-decoration:underline;">View Invoice</a>
                      </div>` : ""}
                      <div style="text-align:center;margin-top:12px;font-size:13px;color:#666;">
                        Questions? Contact <a href="mailto:admin@carcupid.fit" style="color:#1A1A1A;text-decoration:underline;">admin@carcupid.fit</a>
                      </div>
                    </div>
                    <div style="text-align:center;padding:16px;color:#777;font-size:12px;border-top:1px solid #EEE;">
                      © ${new Date().getFullYear()} CarCupid
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;
      type BrevoAttachment = { content: string; name: string };
      type BrevoPayload = {
        sender: { name: string; email: string };
        to: Array<{ email: string }>;
        subject: string;
        htmlContent: string;
        attachment?: BrevoAttachment[];
      };
      const brevoPayload: BrevoPayload = {
        sender: { name: "CarCupid", email: "noreply@carcupid.fit" },
        to: [{ email }],
        subject: "Payment Receipt – CarCupid",
        htmlContent,
      };
      if (invoicePdfB64 && invoicePdfName) {
        brevoPayload.attachment = [{ content: invoicePdfB64, name: invoicePdfName }];
      }
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { accept: "application/json", "api-key": apiKey, "content-type": "application/json" },
        body: JSON.stringify(brevoPayload),
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
