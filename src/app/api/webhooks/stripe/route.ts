import Stripe from "stripe";
import prisma from "@/lib/prisma";

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
  try {
    const paymentClient = (prisma as unknown as {
      payment: {
        findUnique: (args: unknown) => Promise<unknown>;
        create: (args: unknown) => Promise<unknown>;
      };
    }).payment;
    const dealerClient = (prisma as unknown as {
      dealer: {
        findUnique: (args: unknown) => Promise<unknown>;
        findFirst: (args: unknown) => Promise<unknown>;
        update: (args: unknown) => Promise<unknown>;
        create: (args: unknown) => Promise<unknown>;
      };
    }).dealer;
    console.log("stripe.webhook", event.type);
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const meta = pi.metadata || {};
        const stripeCustomerId = typeof pi.customer === "string" ? pi.customer : pi.customer?.id || "";
        const termMonths = Number(meta.termMonths || 1) || 1;
        const now = new Date();
        const dealer = await ensureDealer({
          dealerId: meta.dealerId || "",
          email: (meta.email as string) || "",
          name: (meta.name as string) || "",
          stripeCustomerId,
        });
        const existing = await paymentClient.findUnique({
          where: { stripePaymentIntentId: pi.id },
        }).catch(() => null);
        if (!existing) {
          const anchor = dealer.termEndAt && dealer.termEndAt > now ? dealer.termEndAt : now;
          const startDate = meta.startDate ? new Date(String(meta.startDate)) : anchor;
          const endDate = addMonths(anchor, termMonths);
          await dealerClient.update({
            where: { id: dealer.id },
            data: {
              stripeCustomerId: stripeCustomerId || dealer.stripeCustomerId || null,
              billingStatus: "active",
              termStartAt: dealer.termStartAt ?? startDate,
              termEndAt: endDate,
            },
          } as unknown);
          const method = resolveMethodFromPI(pi);
          const amount = typeof pi.amount_received === "number" ? pi.amount_received : 0;
          const currency = (pi.currency || "usd").toLowerCase();
          await paymentClient.create({
            data: {
              dealerId: dealer.id,
              amount,
              currency,
              status: "succeeded",
              method,
              provider: "stripe",
              stripePaymentIntentId: pi.id,
              stripeCustomerId,
              termMonths,
              startDate,
              endDate,
            },
          });
          console.log("payment.recorded", { dealerId: dealer.id, source: "pi" });
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const meta = invoice.metadata || {};
        const stripeCustomerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id || "";
        const termMonths = Number(meta.termMonths || 1) || 1;
        const now = new Date();
        const dealer = await ensureDealer({
          dealerId: meta.dealerId || "",
          email: (invoice.customer_email as string) || (meta.email as string) || "",
          name: (meta.name as string) || "",
          stripeCustomerId,
        });
        const existing = await paymentClient.findUnique({
          where: { stripeInvoiceId: invoice.id },
        }).catch(() => null);
        if (!existing) {
          const anchor = dealer.termEndAt && dealer.termEndAt > now ? dealer.termEndAt : now;
          const startDate = meta.startDate ? new Date(String(meta.startDate)) : anchor;
          const endDate = addMonths(anchor, termMonths);
          await dealerClient.update({
            where: { id: dealer.id },
            data: {
              stripeCustomerId: stripeCustomerId || dealer.stripeCustomerId || null,
              billingStatus: "active",
              termStartAt: dealer.termStartAt ?? startDate,
              termEndAt: endDate,
            },
          } as unknown);
          const amount = typeof invoice.total === "number" ? invoice.total : 0;
          const currency = (invoice.currency || "usd").toLowerCase();
          await paymentClient.create({
            data: {
              dealerId: dealer.id,
              amount,
              currency,
              status: "succeeded",
              method: "invoice",
              provider: "stripe",
              stripeInvoiceId: invoice.id,
              stripeCustomerId,
              termMonths,
              startDate,
              endDate,
            },
          });
          console.log("payment.recorded", { dealerId: dealer.id, source: "invoice" });
        }
        break;
      }
      case "checkout.session.completed": {
        const sessObj = event.data.object as Stripe.Checkout.Session;
        const session = await stripe.checkout.sessions.retrieve(sessObj.id, { expand: ["payment_intent"] });
        if (session.payment_status !== "paid") break;
        const meta = session.metadata || {};
        const piId = typeof session.payment_intent === "string" ? session.payment_intent : undefined;
        const already =
          (piId
            ? await paymentClient.findUnique({ where: { stripePaymentIntentId: piId } }).catch(() => null)
            : null) ||
          (await paymentClient.findUnique({ where: { stripeSessionId: session.id } }).catch(() => null));
        if (already) break;
        const stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id || "";
        const termMonths = Number(meta.termMonths || 1) || 1;
        const now = new Date();
        const dealer = await ensureDealer({
          dealerId: meta.dealerId || "",
          email: (meta.email as string) || (session.customer_email as string) || "",
          name: (meta.name as string) || "",
          stripeCustomerId,
        });
        const anchor = dealer.termEndAt && dealer.termEndAt > now ? dealer.termEndAt : now;
        const startDate = meta.startDate ? new Date(String(meta.startDate)) : anchor;
        const endDate = addMonths(anchor, termMonths);
        await dealerClient.update({
          where: { id: dealer.id },
          data: {
            stripeCustomerId: stripeCustomerId || dealer.stripeCustomerId || null,
            billingStatus: "active",
            termStartAt: dealer.termStartAt ?? startDate,
            termEndAt: endDate,
          },
        } as unknown);
        const amountSubtotal = typeof session.amount_subtotal === "number" ? session.amount_subtotal : 0;
        const amountTotal = typeof session.amount_total === "number" ? session.amount_total : amountSubtotal;
        const currency = (session.currency || "usd").toLowerCase();
        await paymentClient.create({
          data: {
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
        });
        console.log("payment.recorded", { dealerId: dealer.id, source: "session" });
        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const sessObj = event.data.object as Stripe.Checkout.Session;
        const session = await stripe.checkout.sessions.retrieve(sessObj.id, { expand: ["payment_intent"] });
        const meta = session.metadata || {};
        const piId = typeof session.payment_intent === "string" ? session.payment_intent : undefined;
        const already =
          (piId
            ? await paymentClient.findUnique({ where: { stripePaymentIntentId: piId } }).catch(() => null)
            : null) ||
          (await paymentClient.findUnique({ where: { stripeSessionId: session.id } }).catch(() => null));
        if (already) break;
        const stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id || "";
        const termMonths = Number(meta.termMonths || 1) || 1;
        const now = new Date();
        const dealer = await ensureDealer({
          dealerId: meta.dealerId || "",
          email: (meta.email as string) || (session.customer_email as string) || "",
          name: (meta.name as string) || "",
          stripeCustomerId,
        });
        const anchor = dealer.termEndAt && dealer.termEndAt > now ? dealer.termEndAt : now;
        const startDate = meta.startDate ? new Date(String(meta.startDate)) : anchor;
        const endDate = addMonths(anchor, termMonths);
        await dealerClient.update({
          where: { id: dealer.id },
          data: {
            stripeCustomerId: stripeCustomerId || dealer.stripeCustomerId || null,
            billingStatus: "active",
            termStartAt: dealer.termStartAt ?? startDate,
            termEndAt: endDate,
          },
        } as unknown);
        const amountSubtotal = typeof session.amount_subtotal === "number" ? session.amount_subtotal : 0;
        const amountTotal = typeof session.amount_total === "number" ? session.amount_total : amountSubtotal;
        const currency = (session.currency || "usd").toLowerCase();
        await paymentClient.create({
          data: {
            dealerId: dealer.id,
            amount: amountTotal,
            currency,
            status: "succeeded",
            method: "us_bank_account",
            provider: "stripe",
            stripePaymentIntentId: piId,
            stripeSessionId: session.id,
            stripeCustomerId,
            termMonths,
            startDate,
            endDate,
          },
        });
        console.log("payment.recorded", { dealerId: dealer.id, source: "async_session" });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error(err);
    return new Response("error", { status: 500 });
  }
  return new Response("ok", { status: 200 });
}

function addMonths(date: Date, months: number) {
  const d = new Date(date.getTime());
  d.setMonth(d.getMonth() + months);
  return d;
}

function resolveMethodFromPI(pi: Stripe.PaymentIntent): "card" | "us_bank_account" {
  if (pi.payment_method_types?.includes("us_bank_account")) return "us_bank_account";
  return "card";
}

function toSlugBase(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type DealerRecord = {
  id: string;
  termEndAt: Date | null;
  termStartAt: Date | null;
  stripeCustomerId: string | null;
};

async function ensureDealer(params: { dealerId?: string; email?: string; name?: string; stripeCustomerId?: string }): Promise<DealerRecord> {
  const { dealerId = "", email = "", name = "", stripeCustomerId = "" } = params;
  if (dealerId) {
    const d = (await prisma.dealer.findUnique({ where: { id: dealerId } })) as unknown as DealerRecord | null;
    if (d) return d;
  }
  if (email) {
    const d = (await prisma.dealer.findFirst({ where: { contactEmail: email } })) as unknown as DealerRecord | null;
    if (d) return d;
  }
  if (stripeCustomerId) {
    const d = (await prisma.dealer.findFirst({ where: { stripeCustomerId } })) as unknown as DealerRecord | null;
    if (d) return d;
  }
  const base = toSlugBase(name || email.split("@")[0] || "dealer");
  const slug = `${base}-${Math.random().toString(36).slice(2, 7)}`;
  const created = (await prisma.dealer.create({
    data: {
      name: name || (email ? email.split("@")[0] : "Dealer"),
      slug,
      contactEmail: email || null,
      billingStatus: "active",
    },
  })) as unknown as DealerRecord;
  return created;
}
