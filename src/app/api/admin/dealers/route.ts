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
        _count: {
          select: { cars: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(dealers);
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

    const { name, feedUrl } = await request.json();

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
      },
    });

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
