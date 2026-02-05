import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getSheetData } from '@/lib/googleSheets';

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
  const { image: paramImage, title: paramTitle } = await searchParams;

  // Optimized: If image is in URL params, use it directly (Stateless Mode)
  // This avoids fetching from the database/sheet entirely for the preview generation
  if (paramImage && typeof paramImage === 'string') {
    const title = typeof paramTitle === 'string' 
      ? `I matched with ${paramTitle}!` 
      : `I matched with a car on CarCupid!`;
      
    const description = "Take the AutoMatch quiz to find your perfect car.";

    // Construct the OG image URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://carcupid.fit';
    const ogParams = new URLSearchParams();
    ogParams.set('image', paramImage);
    if (typeof paramTitle === 'string') {
      ogParams.set('title', paramTitle);
    }
    const ogImage = `${baseUrl}/api/og?${ogParams.toString()}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: ogImage,
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
        images: [ogImage],
      },
    };
  }

  // Fallback: If no params (legacy link), fetch from DB
  const car = await getCarData(id);

  if (!car) {
    return {
      title: 'AutoMatch',
      description: 'Find your perfect car match.',
    };
  }

  const title = `I matched with ${car.year} ${car.make} ${car.model}!`;
  const description = "Take the AutoMatch quiz to find your perfect car.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [car.image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [car.image],
    },
  };
}

export default async function SharePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { image: paramImage, title: paramTitle } = await searchParams;

  let car;

  // Optimized: Try to build car object from URL params first
  if (paramImage && typeof paramImage === 'string' && paramTitle && typeof paramTitle === 'string') {
    const titleParts = paramTitle.split(' ');
    car = {
      id,
      image: paramImage,
      year: titleParts[0] || "",
      make: titleParts.slice(1, -1).join(' ') || titleParts[1] || "",
      model: titleParts[titleParts.length - 1] || "",
    };
  } else {
    // Fallback: Fetch from DB
    car = await getCarData(id);
  }

  if (!car) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#fff', background: '#111', minHeight: '100vh' }}>
        <h1>Car not found</h1>
        <Link href="/" style={{ color: 'rgb(230, 214, 180)', textDecoration: 'underline' }}>
          Go Home
        </Link>
      </div>
    );
  }

  // Extract display title
  const displayTitle = car.make.includes(car.model) ? car.make : `${car.year} ${car.make} ${car.model}`.trim();

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#111', 
      color: '#fff', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        width: '100%', 
        background: '#1a1a1a', 
        borderRadius: '12px', 
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
      }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
          <Image 
            src={car.image} 
            alt="Matched Car"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
        
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1 style={{ marginBottom: '1rem', color: 'rgb(230, 214, 180)' }}>
            My Perfect Match: {displayTitle}
          </h1>
          <p style={{ marginBottom: '2rem', color: '#ccc', fontSize: '1.1rem' }}>
            I found my dream car using AutoMatch. Take the quiz to find yours!
          </p>
          
          <Link 
            href="/"
            style={{ 
              display: 'inline-block',
              background: 'rgb(230, 214, 180)',
              color: '#000',
              padding: '1rem 2rem',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              transition: 'transform 0.2s'
            }}
          >
            Find Your Match
          </Link>
        </div>
      </div>
    </div>
  );
}
