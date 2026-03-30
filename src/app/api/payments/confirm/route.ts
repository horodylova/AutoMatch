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
    const piId = typeof session.payment_intent === "string" ? session.payment_intent : undefined;
    const existing =
      (piId ? await prisma.payment.findUnique({ where: { stripePaymentIntentId: piId } }).catch(() => null) : null) ||
      (await prisma.payment.findUnique({ where: { stripeSessionId: session.id } }).catch(() => null));
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
    await prisma.dealer.update({
      where: { id: dealer.id },
      data: {
        stripeCustomerId: stripeCustomerId || dealer.stripeCustomerId || null,
        billingStatus: "active",
        termStartAt: dealer.termStartAt ?? startDate,
        termEndAt: endDate,
      },
    });
    const amountSubtotal = typeof session.amount_subtotal === "number" ? session.amount_subtotal : 0;
    const amountTotal = typeof session.amount_total === "number" ? session.amount_total : amountSubtotal;
    const currency = (session.currency || "usd").toLowerCase();
    await prisma.payment.create({
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
