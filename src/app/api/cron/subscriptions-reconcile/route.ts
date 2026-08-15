import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function addMonths(date: Date, months: number) {
  const d = new Date(date.getTime());
  d.setMonth(d.getMonth() + months);
  return d;
}

function renderRenewalEmail(amountUsd: string, billedDate: string, termEndIso: string) {
  const year = new Date().getFullYear();
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <title>Subscription Renewed</title>
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
                <div style="font-size:22px;font-weight:800;line-height:1.2;margin:0;">Subscription Renewed</div>
              </div>
              <div style="padding:24px;" class="px-24">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:12px 0;color:#666;">Service</td>
                    <td align="right" style="padding:12px 0;font-weight:700;color:#1A1A1A;">CarCupid Inventory Placement</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;color:#666;">Amount</td>
                    <td align="right" style="padding:12px 0;font-weight:900;color:#E5483F;">$${amountUsd} USD / mo</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;color:#666;">Billed on</td>
                    <td align="right" style="padding:12px 0;font-weight:700;color:#1A1A1A;">${billedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;color:#666;">Active until</td>
                    <td align="right" style="padding:12px 0;font-weight:700;color:#1A1A1A;">${termEndIso.slice(0,10)}</td>
                  </tr>
                </table>
                <div style="text-align:center;margin-top:22px;">
                  <a href="https://carcupid.fit/dealers#dealerForm" style="display:inline-block;background:#1A1A1A;color:#FFFFFF;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:700;">Contact a Manager</a>
                </div>
                <div style="text-align:center;margin-top:12px;font-size:13px;color:#666;">
                  To cancel your subscription, please contact a manager.
                </div>
              </div>
              <div style="text-align:center;padding:16px;color:#777;font-size:12px;border-top:1px solid #EEE;">
                © ${year} CarCupid
              </div>
            </div>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const secret = process.env.CRON_SECRET || "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const key = process.env.STRIPE_SECRET_KEY || "";
  if (!key) {
    return NextResponse.json({ error: "missing stripe key" }, { status: 500 });
  }
  const stripe = new Stripe(key, {});
  try {
    const now = Math.floor(Date.now() / 1000);
    const since = now - 48 * 60 * 60;
    const invoices = await stripe.invoices.list({ limit: 100, status: "paid", created: { gt: since } });
    let processed = 0;
    for (const inv of invoices.data) {
      if (inv.billing_reason !== "subscription_cycle") continue;
      const invoiceId = inv.id;
      const exists = await prisma.payment.findUnique({ where: { stripeInvoiceId: invoiceId } });
      if (exists) continue;
      const stripeCustomerId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id || "";
      const amount = typeof inv.amount_paid === "number" ? inv.amount_paid : 0;
      const currency = (inv.currency || "usd").toLowerCase();
      const email = typeof inv.customer_email === "string" ? inv.customer_email : "";
      const dealer = await prisma.dealer.findFirst({ where: { stripeCustomerId } }) || (email ? await prisma.dealer.findFirst({ where: { contactEmail: email } }) : null);
      if (!dealer) continue;
      const anchorDate = dealer.termEndAt && dealer.termEndAt > new Date() ? dealer.termEndAt : new Date();
      const termEnd = addMonths(anchorDate, 1);
      await prisma.$transaction([
        prisma.dealer.update({ where: { id: dealer.id }, data: { billingStatus: "active", termEndAt: termEnd } }),
        prisma.payment.create({
          data: {
            dealerId: dealer.id,
            amount,
            currency,
            provider: "stripe",
            status: "succeeded",
            method: "invoice",
            stripeInvoiceId: invoiceId,
            stripeCustomerId,
            termMonths: 1,
            startDate: anchorDate,
            endDate: termEnd,
          },
        }),
      ]);
      const apiKey = process.env.BREVO_API_KEY || "";
      if (apiKey && email) {
        const amountUsd = (amount / 100).toFixed(2);
        const billedDate = new Date().toISOString().slice(0, 10);
        const htmlContent = renderRenewalEmail(amountUsd, billedDate, termEnd.toISOString());
        const payload = {
          sender: { name: "CarCupid", email: "noreply@carcupid.fit" },
          to: [{ email }],
          subject: "Subscription Renewed – CarCupid",
          htmlContent,
        };
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { accept: "application/json", "api-key": apiKey, "content-type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {});
      }
      processed++;
    }
    return NextResponse.json({ ok: true, processed }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
