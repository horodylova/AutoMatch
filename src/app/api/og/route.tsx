import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'My Perfect Match';

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            height: '100%',
            width: '100%',
            background: '#1F1F23',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 30, color: '#B8BCC6', marginBottom: '20px', textTransform: 'uppercase' }}>
              My Perfect Match
            </div>
            <div style={{ fontSize: 60, fontWeight: 'bold', color: 'white', lineHeight: 1.2, marginBottom: '30px' }}>
              {title}
            </div>
            <div
              style={{
                background: '#E5483F',
                color: '#F5F5F7',
                padding: '15px 40px',
                borderRadius: '40px',
                fontSize: 28,
                fontWeight: 'bold',
                display: 'flex',
                width: 'fit-content',
              }}
            >
              Take the Quiz
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=86400, immutable',
          'Content-Type': 'image/png',
        },
      }
    );
  } catch (e) {
    console.error(e);
    return new Response('Error', { status: 500 });
  }
}
