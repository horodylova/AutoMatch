import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const homeNetDealerId = String(body?.homeNetDealerId || "");
    const termMonths = Number(body?.termMonths || 1);
    const startDate = String(body?.startDate || "");
    const contactName = String(body?.name || "");
    const contactEmail = String(body?.email || "");
    const contactPhone = String(body?.phone || "");
    const website = String(body?.website || "");
    const dealerId = body?.dealerId ? String(body.dealerId) : "";

    if (homeNetDealerId !== "00000") {
      return new Response(JSON.stringify({ error: "HomeNet onboarding required" }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

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
        homeNetDealerId,
        termMonths: String(termMonths),
        startDate,
        name: contactName,
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
