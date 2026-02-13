import { PrismaClient } from '@prisma/client';
import Papa from 'papaparse';

const prisma = new PrismaClient();

interface CsvRow {
  VIN: string;
  Make: string;
  Model: string;
  Year: string;
  Price: string;
  Mileage?: string;
  ImageURL?: string;
  Features?: string;
  [key: string]: string | undefined; // Allow loose matching
}

export async function syncDealerInventory(dealerId: string) {
  const dealer = await prisma.dealer.findUnique({
    where: { id: dealerId },
  });

  if (!dealer || !dealer.feedUrl) {
    throw new Error(`Dealer ${dealerId} not found or has no feed URL`);
  }

  console.log(`Starting sync for dealer: ${dealer.name} (${dealer.feedUrl})`);

  // 1. Fetch CSV
  const response = await fetch(dealer.feedUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.statusText}`);
  }
  const csvText = await response.text();

  // 2. Parse CSV
  const parseResult = Papa.parse<CsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(), // Remove whitespace from headers
  });

  if (parseResult.errors.length > 0) {
    console.warn(`CSV Parse warnings for dealer ${dealer.name}:`, parseResult.errors);
  }

  const rows = parseResult.data;
  console.log(`Parsed ${rows.length} rows for dealer ${dealer.name}`);

  // 3. Process Rows
  const validVins = new Set<string>();
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    // Normalize keys (case-insensitive lookup helper)
    const getVal = (key: string) => {
        const foundKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
        return foundKey ? row[foundKey]?.trim() : undefined;
    };

    const vin = getVal('VIN');
    const make = getVal('Make');
    const model = getVal('Model');
    const yearStr = getVal('Year');
    const priceStr = getVal('Price');
    
    // Basic Validation
    if (!vin || !make || !model || !yearStr || !priceStr) {
      console.warn(`Skipping invalid row (missing required fields):`, row);
      skipped++;
      continue;
    }

    const year = parseInt(yearStr, 10);
    const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')); // Remove currency symbols
    const mileageStr = getVal('Mileage');
    const mileage = mileageStr ? parseInt(mileageStr.replace(/[^0-9]/g, ''), 10) : null;
    const imageUrl = getVal('ImageURL') || getVal('Image') || null;
    
    // Features parsing (pipe separated or comma separated)
    const featuresRaw = getVal('Features');
    let features: string[] = [];
    if (featuresRaw) {
        if (featuresRaw.includes('|')) {
            features = featuresRaw.split('|').map(f => f.trim()).filter(f => f);
        } else {
            features = featuresRaw.split(',').map(f => f.trim()).filter(f => f);
        }
    }

    validVins.add(vin);

    // Upsert Car
    try {
      await prisma.car.upsert({
        where: {
          dealerId_vin: {
            dealerId: dealer.id,
            vin: vin,
          },
        },
        update: {
          make,
          model,
          year,
          price,
          mileage,
          imageUrl,
          features: features, // Prisma handles string[] -> Json automatically for Json fields? No, needs literal array
          updatedAt: new Date(),
        },
        create: {
          dealerId: dealer.id,
          vin,
          make,
          model,
          year,
          price,
          mileage,
          imageUrl,
          features: features,
        },
      });
      // We can't easily know if it was create or update without checking first, 
      // but upsert is atomic and safe. We'll count them as processed.
      updated++; 
    } catch (err) {
      console.error(`Failed to upsert car ${vin}:`, err);
      skipped++;
    }
  }

  // 4. Cleanup (Delete cars not in feed)
  // Only delete if we successfully parsed at least one row to avoid wiping DB on empty/bad feed
  let deleted = 0;
  if (rows.length > 0) {
    const deleteResult = await prisma.car.deleteMany({
      where: {
        dealerId: dealer.id,
        vin: {
          notIn: Array.from(validVins),
        },
      },
    });
    deleted = deleteResult.count;
  }

  return {
    dealer: dealer.name,
    totalInFeed: rows.length,
    processed: updated, // Includes created and updated
    deleted,
    skipped,
  };
}
