import { Metadata } from 'next';
import { getSheetData } from '@/lib/googleSheets';
import ClientRedirect from './ClientRedirect';

// Replicating logic from dataset.ts to ensure consistency without importing client-side code
async function getCarData(id: string) {
  const sheetId = process.env.NEXT_PUBLIC_SHEET_ID || process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "";
  const range = process.env.NEXT_PUBLIC_SHEET_RANGE || process.env.SHEET_NAME || "DATABASE";

  if (!sheetId) return null;

  try {
    const values = await getSheetData(sheetId, range);
    if (!values || values.length < 5) return null;

    const headers = (values[1] || []).map(v => String(v ?? "").trim().toLowerCase());
    const idIdx = headers.indexOf("id");
    const makeIdx = headers.indexOf("make");
    const modelIdx = headers.indexOf("model");
    const yearIdx = headers.indexOf("year");
    const imageIdx = headers.indexOf("primary image");

    if (idIdx === -1 || imageIdx === -1) return null;

    const rows = values.slice(4);
    const row = rows.find(r => String(r[idIdx] ?? "").trim() === id);

    if (!row) return null;

    return {
      id: String(row[idIdx] ?? ""),
      make: String(row[makeIdx] ?? ""),
      model: String(row[modelIdx] ?? ""),
      year: String(row[yearIdx] ?? ""),
      image: String(row[imageIdx] ?? ""),
    };
  } catch (error) {
    console.error("Error fetching car data for share:", error);
    return null;
  }
}

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(
  { params, searchParams }: Props
): Promise<Metadata> {
  const { id } = await params;
  const { title: paramTitle } = await searchParams;

  // Optimized: If title is in URL params, use it directly (Stateless Mode)
  if (typeof paramTitle === 'string') {
    const title = `I matched with ${paramTitle}!`;
    const description = "Take the AutoMatch quiz to find your perfect car.";

    // Construct the OG image URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://carcupid.fit';
    // Use static poster image as requested by user
    const posterImage = `${baseUrl}/poster.jpg`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: posterImage,
            width: 1200,
            height: 630,
            alt: title,
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [posterImage],
      },
    };
  }

  // Fallback: If no params (legacy link), fetch from DB
  const car = await getCarData(id);

  if (!car) {
    return {
      title: 'CarCupid',
      description: 'Find your perfect car match!',
    };
  }

  const title = `I matched with ${car.year} ${car.make} ${car.model}!`;
  const description = "Take the AutoMatch quiz to find your perfect car.";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://carcupid.fit';
  const posterImage = `${baseUrl}/poster.jpg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: posterImage,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [posterImage],
    },
  };
}

export default function SharePage() {
  // We use a client component to redirect users to the quiz start page
  // while allowing bots/scrapers to see the metadata generated above.
  return <ClientRedirect />;
}
