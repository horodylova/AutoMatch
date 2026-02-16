import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

type DealerContactRequestDelegate = {
  create: (args: Record<string, unknown>) => Promise<unknown>;
};

interface ExtendedPrismaClient extends PrismaClient {
  dealerContactRequest: DealerContactRequestDelegate;
}

const prisma: ExtendedPrismaClient = new PrismaClient() as ExtendedPrismaClient;

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

    await prisma.dealerContactRequest.create({
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
