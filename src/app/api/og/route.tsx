import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'My Perfect Match';
  const image = searchParams.get('image');

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          position: 'relative',
        }}
      >
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt="Car"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.6,
            }}
          />
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: 900,
              color: '#E6D6B4', // Gold color from theme
              marginBottom: '20px',
              textShadow: '0 4px 10px rgba(0,0,0,0.8)',
              fontFamily: 'sans-serif',
            }}
          >
            CarCupid Match
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: 'white',
              textShadow: '0 4px 8px rgba(0,0,0,0.8)',
              fontFamily: 'sans-serif',
              maxWidth: '900px',
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: '40px',
              backgroundColor: '#E6D6B4',
              color: '#000',
              padding: '10px 30px',
              borderRadius: '50px',
              fontSize: 24,
              fontWeight: 'bold',
            }}
          >
            Find Your Match
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
