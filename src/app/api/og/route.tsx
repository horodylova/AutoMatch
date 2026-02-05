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
            background: '#121212',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '40px',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '40%',
              paddingRight: '40px',
            }}
          >
            <div style={{ fontSize: 30, color: 'rgb(230, 214, 180)', marginBottom: '10px', textTransform: 'uppercase' }}>
              My Perfect Match
            </div>
            <div style={{ fontSize: 50, fontWeight: 'bold', color: 'white', lineHeight: 1.2, marginBottom: '20px' }}>
              {title}
            </div>
            <div
              style={{
                background: 'rgb(230, 214, 180)',
                color: '#000',
                padding: '15px 30px',
                borderRadius: '30px',
                fontSize: 24,
                fontWeight: 'bold',
                display: 'flex',
                width: 'fit-content',
              }}
            >
              Take the Quiz
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              width: '60%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '80%',
                background: 'rgba(230, 214, 180, 0.1)',
                borderRadius: '20px',
                transform: 'rotate(-3deg)',
              }}
            />
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
                borderRadius: '20px',
                color: 'rgb(230, 214, 180)',
                fontSize: 80,
                fontWeight: 'bold',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              }}
            >
              
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
