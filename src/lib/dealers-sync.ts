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
  [key: string]: string | undefined; 
}

export async function syncDealerInventory(dealerId: string) {
  const dealer = await prisma.dealer.findUnique({
    where: { id: dealerId },
  });

  if (!dealer || !dealer.feedUrl) {
    throw new Error(`Dealer ${dealerId} not found or has no feed URL`);
  }

  console.log(`Starting sync for dealer: ${dealer.name} (${dealer.feedUrl})`);

 
  const response = await fetch(dealer.feedUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.statusText}`);
  }
  const csvText = await response.text();

 
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


  const validVins = new Set<string>();
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
  
    const getVal = (key: string) => {
        const foundKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
        return foundKey ? row[foundKey]?.trim() : undefined;
    };

    const vin = getVal('VIN');
    const make = getVal('Make');
    const model = getVal('Model');
    const yearStr = getVal('Year');
    const priceStr = getVal('Price');
    

    if (!vin || !make || !model || !yearStr || !priceStr) {
      console.warn(`Skipping invalid row (missing required fields):`, row);
      skipped++;
      continue;
    }

    const year = parseInt(yearStr, 10);
    const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')); 
    const mileageStr = getVal('Mileage');
    const mileage = mileageStr ? parseInt(mileageStr.replace(/[^0-9]/g, ''), 10) : null;
    const imageUrl = getVal('ImageURL') || getVal('Image') || null;
    
   
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
          features: features, 
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
    
      updated++; 
    } catch (err) {
      console.error(`Failed to upsert car ${vin}:`, err);
      skipped++;
    }
  }


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
    processed: updated, 
    deleted,
    skipped,
  };
}
