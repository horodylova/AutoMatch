import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature") || "";
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
  if (!secret) {
    return new Response("Missing webhook secret", { status: 500 });
  }
  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }
  switch (event.type) {
    case "checkout.session.completed":
    case "payment_intent.succeeded":
    case "payment_intent.payment_failed":
    case "invoice.paid":
    case "invoice.payment_failed":
      break;
    default:
      break;
  }
  return new Response("ok", { status: 200 });
}
