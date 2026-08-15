import Stripe from "stripe";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dealerName = String(body?.dealerName || "");
    const contactName = String(body?.contactName || "");
    const contactEmail = String(body?.email || "");
    const contactPhone = String(body?.phone || "");
    const website = String(body?.website || "");
    const dealerId = body?.dealerId ? String(body.dealerId) : "";
    const key = process.env.STRIPE_SECRET_KEY || "";
    if (!key) {
      return new Response(JSON.stringify({ error: "Missing Stripe key" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
    const priceId = process.env.STRIPE_PRICE_SUBSCRIPTION_MONTHLY || "";
    if (!priceId) {
      return new Response(JSON.stringify({ error: "Missing Stripe price" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
    const stripe = new Stripe(key, {});
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dealer-subscription/order/success?sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dealer-subscription/order/cancel`,
      metadata: { dealerName, contactName, email: contactEmail, phone: contactPhone, website, dealerId },
      customer_email: contactEmail || undefined,
    });
    return new Response(JSON.stringify({ id: session.id, url: session.url }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
}
