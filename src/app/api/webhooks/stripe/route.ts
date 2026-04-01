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
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="120" valign="middle" style="padding-right:16px;">
                      <img src="https://carcupid.fit/cupids/carcupid-keys.png" alt="CarCupid" width="100" style="display:block;border:0;max-width:100%;height:auto;">
                    </td>
                    <td valign="middle">
                      <div style="font-size:22px;font-weight:800;line-height:1.2;margin:0;">Subscription Renewed</div>
                      <div style="margin-top:6px;opacity:0.9;font-size:14px;line-height:1.4;">Your monthly subscription is active.</div>
                    </td>
                  </tr>
                </table>
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
                <div style="text-align:center;margin-top:12px;font-size:13px;color:#666;">
                  Questions? Contact <a href="mailto:admin@carcupid.fit" style="color:#1A1A1A;text-decoration:underline;">admin@carcupid.fit</a>
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

export async function POST(request: Request) {
  const key = process.env.STRIPE_SECRET_KEY || "";
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  if (!key || !whSecret) {
    return NextResponse.json({ error: "missing keys" }, { status: 500 });
  }
  const stripe = new Stripe(key, {});
  const sig = request.headers.get("stripe-signature") || "";
  let event: Stripe.Event;
  try {
    const raw = await request.text();
    event = stripe.webhooks.constructEvent(raw, sig, whSecret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }
  try {
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeCustomerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id || "";
      const amount = typeof invoice.amount_paid === "number" ? invoice.amount_paid : 0;
      const currency = (invoice.currency || "usd").toLowerCase();
      const email = typeof invoice.customer_email === "string" ? invoice.customer_email : "";
      const invoiceId = invoice.id;
      const hostedUrl = typeof invoice.hosted_invoice_url === "string" ? invoice.hosted_invoice_url : undefined;
      const now = new Date();
      let dealer = await prisma.dealer.findFirst({ where: { stripeCustomerId } });
      if (!dealer && email) {
        dealer = await prisma.dealer.findFirst({ where: { contactEmail: email } });
      }
      if (!dealer) {
        return NextResponse.json({ ok: true }, { status: 200 });
      }
      const anchor = dealer.termEndAt && dealer.termEndAt > now ? dealer.termEndAt : now;
      const termEnd = addMonths(anchor, 1);
      await prisma.$transaction([
        prisma.dealer.update({
          where: { id: dealer.id },
          data: { billingStatus: "active", termEndAt: termEnd },
        }),
        prisma.payment.upsert({
          where: { stripeInvoiceId: invoiceId },
          update: {},
          create: {
            dealerId: dealer.id,
            amount,
            currency,
            provider: "stripe",
            status: "succeeded",
            method: "invoice",
            stripeInvoiceId: invoiceId,
            stripeCustomerId,
            termMonths: 1,
            startDate: anchor,
            endDate: termEnd,
          },
        }),
      ]);
      const apiKey = process.env.BREVO_API_KEY || "";
      if (apiKey && email) {
        const amountUsd = (amount / 100).toFixed(2);
        const billedDate = now.toISOString().slice(0, 10);
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
    } else if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeCustomerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id || "";
      const email = typeof invoice.customer_email === "string" ? invoice.customer_email : "";
      const dealer = await prisma.dealer.findFirst({ where: { stripeCustomerId } }) || (email ? await prisma.dealer.findFirst({ where: { contactEmail: email } }) : null);
      if (dealer) {
        await prisma.dealer.update({ where: { id: dealer.id }, data: { billingStatus: "past_due" } });
        const apiKey = process.env.BREVO_API_KEY || "";
        if (apiKey && email) {
          const htmlContent = `
          <!DOCTYPE html>
          <html>
            <body style="margin:0;padding:0;background:#F5F7FB;color:#1A1A1A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
              <div style="max-width:640px;margin:20px auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.06);">
                <div style="padding:24px;">
                  <div style="font-size:22px;font-weight:800;margin-bottom:8px;">Payment Failed</div>
                  <div style="color:#666;margin-bottom:16px;">Your monthly subscription payment did not go through. Please update your payment method.</div>
                  <div style="text-align:center;margin-top:12px;">
                    <a href="https://carcupid.fit/dealers#dealerForm" style="display:inline-block;background:#1A1A1A;color:#FFFFFF;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:700;">Contact a Manager</a>
                  </div>
                </div>
              </div>
            </body>
          </html>
          `;
          const payload = {
            sender: { name: "CarCupid", email: "noreply@carcupid.fit" },
            to: [{ email }],
            subject: "Payment Failed – Action Required",
            htmlContent,
          };
          await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: { accept: "application/json", "api-key": apiKey, "content-type": "application/json" },
            body: JSON.stringify(payload),
          }).catch(() => {});
        }
      }
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
