import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import { getSession } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const dealer = await prisma.dealer.findUnique({ where: { id } });
    if (!dealer) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 });
    }
    const key = process.env.STRIPE_SECRET_KEY || "";
    const apiKey = process.env.BREVO_API_KEY || "";
    if (key && dealer.stripeCustomerId) {
      try {
        const stripe = new Stripe(key, {});
        const subs = await stripe.subscriptions.list({
          customer: dealer.stripeCustomerId,
          status: "active",
          limit: 3,
        });
        for (const s of subs.data) {
          await stripe.subscriptions.cancel(s.id);
        }
      } catch {}
    }
    const now = new Date();
    await prisma.dealer.update({
      where: { id: dealer.id },
      data: { billingStatus: "expired", termEndAt: now },
    });
    if (apiKey && dealer.contactEmail) {
      const htmlContent = `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#F5F7FB;color:#1A1A1A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <div style="max-width:640px;margin:20px auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.06);">
            <div style="padding:24px;">
              <div style="font-size:22px;font-weight:800;margin-bottom:8px;">Subscription Canceled</div>
              <div style="color:#666;margin-bottom:16px;">Your CarCupid subscription has been deactivated. You will not be billed further.</div>
              <div style="font-size:13px;color:#666;">If this was a mistake or you want to reactivate, please contact our manager.</div>
              <div style="text-align:center;margin-top:16px;">
                <a href="https://carcupid.fit/dealers#dealerForm" style="display:inline-block;background:#1A1A1A;color:#FFFFFF;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:700;">Contact a Manager</a>
              </div>
            </div>
          </div>
        </body>
      </html>
      `;
      const payload = {
        sender: { name: "CarCupid", email: "noreply@carcupid.fit" },
        to: [{ email: dealer.contactEmail }],
        subject: "Subscription Canceled – CarCupid",
        htmlContent,
      };
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { accept: "application/json", "api-key": apiKey, "content-type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
