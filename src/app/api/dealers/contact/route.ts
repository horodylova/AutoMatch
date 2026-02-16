import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const dealerContactRequest = (prisma as unknown as {
  dealerContactRequest: {
    create: (args: { data: unknown }) => Promise<unknown>;
  };
}).dealerContactRequest;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const dealershipName = typeof body.company === "string" ? body.company.trim() : "";
    const contactName = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const interest = typeof body.interest === "string" ? body.interest.trim() : "";

    if (!dealershipName || !contactName || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dealerContactRequest.create({
      data: {
        dealershipName,
        contactName,
        email,
        phone: phone || null,
        interest: interest || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Dealer contact save error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
