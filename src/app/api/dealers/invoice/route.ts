import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const termMonths = Number(body?.termMonths || 1);
    const startDate = String(body?.startDate || "");
    const name = String(body?.name || "");
    const email = String(body?.email || "");
    const phone = String(body?.phone || "");
    const website = String(body?.website || "");

    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const key = process.env.STRIPE_SECRET_KEY || "";
    if (!key) {
      return new Response(JSON.stringify({ error: "Missing Stripe key" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    const stripe = new Stripe(key, {});
    const amount = (termMonths > 0 ? termMonths : 1) * 15000;

    const customer = await stripe.customers.create({
      name,
      email,
      phone,
      metadata: {
        website,
        startDate,
        termMonths: String(termMonths),
      },
    });

    await stripe.invoiceItems.create({
      customer: customer.id,
      currency: "usd",
      amount,
      description: "CarCupid Inventory Placement",
    });

    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: "send_invoice",
      days_until_due: 7,
      payment_settings: {
        payment_method_types: ["card", "us_bank_account"],
      },
      metadata: {
        startDate,
        termMonths: String(termMonths),
      },
    });

    const finalized = await stripe.invoices.finalizeInvoice(invoice.id);
    await stripe.invoices.sendInvoice(finalized.id);

    return new Response(JSON.stringify({ id: finalized.id, url: finalized.hosted_invoice_url }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
}
