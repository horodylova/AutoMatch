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
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { id } = await params;
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

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  const car = await getCarData(id);

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

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#111', 
      color: '#fff', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ color: 'rgb(230, 214, 180)', marginBottom: '1rem' }}>
          Your Perfect Match
        </h1>
        
        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', marginBottom: '2rem', borderRadius: '12px', overflow: 'hidden' }}>
          <Image 
            src={car.image} 
            alt={`${car.make} ${car.model}`}
            fill
            style={{ objectFit: 'cover' }}
            priority
            unoptimized
          />
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          {car.year} {car.make} {car.model}
        </h2>
        
        <p style={{ marginBottom: '2rem', color: '#ccc' }}>
          Want to find your own dream car?
        </p>

        <Link 
          href="/" 
          style={{ 
            display: 'inline-block',
            padding: '1rem 2rem',
            background: 'rgb(230, 214, 180)',
            color: '#000',
            fontWeight: 'bold',
            borderRadius: '50px',
            textDecoration: 'none',
            fontSize: '1.1rem'
          }}
        >
          Start Quiz
        </Link>
      </div>
    </div>
  );
}
