import { ImageResponse } from 'next/og';
import { getSheetData } from '@/lib/googleSheets';

// Ensure Node.js runtime for Google Sheets API compatibility
export const runtime = 'nodejs';

// Image metadata
export const alt = 'Car Match';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Replicating logic from dataset.ts to ensure consistency
async function getCarData(id: string) {
  const sheetId = process.env.NEXT_PUBLIC_SHEET_ID || process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "";
  const range = process.env.NEXT_PUBLIC_SHEET_RANGE || process.env.SHEET_NAME || "DATABASE";

  if (!sheetId) return null;

  try {
    const values = await getSheetData(sheetId, range);
    if (!values || values.length < 5) return null;

    const headers = (values[1] || []).map(v => String(v ?? "").trim().toLowerCase());
    const idIdx = headers.indexOf("id");
    const imageIdx = headers.indexOf("primary image");

    if (idIdx === -1 || imageIdx === -1) return null;

    const rows = values.slice(4);
    const row = rows.find(r => String(r[idIdx] ?? "").trim() === id);

    if (!row) return null;

    return {
      image: String(row[imageIdx] ?? ""),
    };
  } catch (error) {
    console.error("Error fetching car data for OG image:", error);
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCarData(id);

  if (!car || !car.image) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 64,
            background: '#111',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          CarCupid Match
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: '#000',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Using standard img tag as recommended for ImageResponse */}
        <img
          src={car.image}
          alt="Car Match"
          style={{
             objectFit: 'contain',
             width: '100%',
             height: '100%',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
