import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { syncDealerInventory } from '@/lib/dealers-sync';

const prisma = new PrismaClient();

// Vercel Cron timeout is 10s for hobby, 60s for pro. 
// For long running tasks, we might need a different strategy, but for now we iterate.
export const maxDuration = 60; // Set max duration to 60 seconds (Pro plan limit usually)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // 1. Security Check
  const authHeader = request.headers.get('authorization');
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  
  // Verify against environment variable
  const validSecret = process.env.CRON_SECRET;
  
  // Allow if:
  // 1. Authorization header matches "Bearer <secret>"
  // 2. Query param "key" matches secret
  // 3. We are in development mode (optional, for easier local testing)
  const isAuthorized = 
    (validSecret && authHeader === `Bearer ${validSecret}`) ||
    (validSecret && key === validSecret) ||
    (process.env.NODE_ENV === 'development'); // Allow local testing without secret for convenience

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Find active dealers with feeds
    const dealers = await prisma.dealer.findMany({
      where: {
        feedUrl: {
          not: null,
        },
        // We can add an 'active' flag later if needed
      },
    });

    if (dealers.length === 0) {
      return NextResponse.json({ message: 'No dealers with feed URLs found' });
    }

    const results = [];

    // 3. Sync each dealer
    // Note: We do this sequentially to avoid overwhelming the DB connection pool
    for (const dealer of dealers) {
      try {
        const result = await syncDealerInventory(dealer.id);
        results.push({ success: true, ...result });
      } catch (error) {
        console.error(`Sync failed for dealer ${dealer.name}:`, error);
        results.push({ 
          success: false, 
          dealer: dealer.name, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      results 
    });

  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
