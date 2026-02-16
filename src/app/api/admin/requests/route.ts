import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth";

type DealerContactRequestDelegate = {
  create?: (args: Record<string, unknown>) => Promise<unknown>;
  findMany: (args?: Record<string, unknown>) => Promise<unknown[]>;
  delete: (args: Record<string, unknown>) => Promise<unknown>;
};

interface ExtendedPrismaClient extends PrismaClient {
  dealerContactRequest: DealerContactRequestDelegate;
}

const prisma: ExtendedPrismaClient = new PrismaClient() as ExtendedPrismaClient;

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await prisma.dealerContactRequest.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Fetch partnership requests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await prisma.dealerContactRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete partnership request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
