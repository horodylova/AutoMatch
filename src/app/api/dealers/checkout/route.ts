import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const termMonths = Number(body?.termMonths || 1);
    const startDate = String(body?.startDate || "");
    const contactName = String(body?.contactName || body?.name || "");
    const dealerName = String(body?.dealerName || body?.company || body?.dealer || "");
    const contactEmail = String(body?.email || "");
    const contactPhone = String(body?.phone || "");
    const website = String(body?.website || "");
    const dealerId = body?.dealerId ? String(body.dealerId) : "";

    const key = process.env.STRIPE_SECRET_KEY || "";
    if (!key) {
      return new Response(JSON.stringify({ error: "Missing Stripe key" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    const stripe = new Stripe(key, {});
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      payment_method_types: ["card", "us_bank_account"],
      payment_method_options: {
        us_bank_account: {
          verification_method: "automatic",
        },
      },
      payment_method_configuration: process.env.STRIPE_PMC_ID || undefined,
      customer_creation: "always",
      payment_intent_data: {
        metadata: {
          termMonths: String(termMonths),
          startDate,
          dealerName,
          contactName,
          email: contactEmail,
          phone: contactPhone,
          website,
          dealerId,
        },
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "CarCupid Inventory Placement" },
            unit_amount: 15000,
          },
          quantity: termMonths > 0 ? termMonths : 1,
        },
      ],
      success_url: `${origin}/dealers/order/success?sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dealers/order/cancel`,
      metadata: {
        termMonths: String(termMonths),
        startDate,
        dealerName,
        contactName,
        email: contactEmail,
        phone: contactPhone,
        website,
        dealerId,
      },
      customer_email: contactEmail || undefined,
    };

    const session = await stripe.checkout.sessions.create(params);

    return new Response(JSON.stringify({ id: session.id, url: session.url }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
}
