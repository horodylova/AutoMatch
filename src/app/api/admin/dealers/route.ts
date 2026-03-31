import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';
import { syncDealerInventory } from '@/lib/dealers-sync';

const prisma = new PrismaClient();

// GET /api/admin/dealers - List all dealers
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dealers = await prisma.dealer.findMany({
      include: {
        _count: { select: { cars: true } },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            method: true,
            termMonths: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    type DealerRecord = (typeof dealers)[number];
    type DealerPayload = DealerRecord & { contactName: string | null; contactPhone: string | null; website: string | null };
    const emails = dealers.map(d => d.contactEmail).filter((e): e is string => typeof e === 'string' && e.length > 0);
    const contactByEmail: Record<string, { contactName?: string; phone?: string; website?: string }> = {};
    if (emails.length > 0) {
      const requests = await prisma.dealerContactRequest.findMany({
        where: { email: { in: emails } },
        orderBy: { createdAt: 'desc' },
      });
      for (const r of requests) {
        if (!contactByEmail[r.email]) {
          let website: string | undefined;
          if (typeof r.interest === 'string' && r.interest.startsWith('website:')) {
            website = r.interest.slice('website:'.length);
          }
          contactByEmail[r.email] = { contactName: r.contactName || undefined, phone: r.phone || undefined, website };
        }
      }
    }
    const enriched: DealerPayload[] = dealers.map(d => {
      const base = d as unknown as Partial<{ contactName: string | null; contactPhone: string | null; website: string | null }>;
      const derived = d.contactEmail ? contactByEmail[d.contactEmail] : undefined;
      return {
        ...d,
        contactName: base.contactName ?? derived?.contactName ?? null,
        contactPhone: base.contactPhone ?? derived?.phone ?? null,
        website: base.website ?? derived?.website ?? null,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('Fetch dealers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/dealers - Create a new dealer
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, feedUrl, contactName, contactEmail, contactPhone, website } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existingDealer = await prisma.dealer.findUnique({
      where: { slug },
    });

    if (existingDealer) {
      return NextResponse.json({ error: 'Dealer with this name already exists' }, { status: 400 });
    }

    const dealer = await prisma.dealer.create({
      data: {
        name,
        slug,
        feedUrl,
        contactEmail: contactEmail || undefined,
      },
    });

    // Store contact info for admin visibility
    if (contactEmail || contactName || contactPhone || website) {
      try {
        await prisma.dealerContactRequest.create({
          data: {
            dealershipName: name,
            contactName: contactName || name,
            email: contactEmail || '',
            phone: contactPhone || undefined,
            interest: website ? `website:${website}` : undefined,
            status: "new",
          },
        });
      } catch {}
    }

    // Immediately trigger sync if feedUrl is provided
    if (feedUrl) {
      try {
        console.log(`Triggering immediate sync for new dealer: ${dealer.name}`);
        await syncDealerInventory(dealer.id);
        console.log(`Immediate sync completed for dealer: ${dealer.name}`);
      } catch (syncError) {
        console.error(`Immediate sync failed for dealer ${dealer.name}:`, syncError);
        // We don't fail the request here, as the dealer was created successfully.
        // The user will see 0 cars and can check logs or wait for cron.
      }
    }

    return NextResponse.json(dealer);
  } catch (error) {
    console.error('Create dealer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
