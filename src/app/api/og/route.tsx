import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const year = searchParams.get('year');
    const type = searchParams.get('type');

    // Default if no data
    if (!make || !model) {
      return new ImageResponse(
        (
          <div
            style={{
              background: '#0E1B24',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontFamily: 'sans-serif',
            }}
          >
            <div style={{ fontSize: 60, fontWeight: 'bold', color: 'rgb(230, 214, 180)' }}>CarCupid</div>
            <div style={{ fontSize: 40, marginTop: 20 }}>Find Your Perfect Match</div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
          headers: {
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        }
      );
    }

    if (type === 'simple') {
      return new ImageResponse(
        (
          <div
            style={{
              background: '#0E1B24',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'sans-serif',
              padding: '40px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 30, color: 'rgb(230, 214, 180)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>
              My Perfect Match
            </div>
            <div style={{ fontSize: 80, fontWeight: 'bold', color: 'white', lineHeight: 1.1, marginBottom: '40px' }}>
              {year} {make} {model}
            </div>
            <div
              style={{
                background: 'rgb(230, 214, 180)',
                color: '#0E1B24',
                padding: '20px 40px',
                borderRadius: '50px',
                fontSize: 32,
                fontWeight: 'bold',
              }}
            >
              CarCupid.fit
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
          headers: {
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        }
      );
    }

    return new ImageResponse(
        (
          <div
            style={{
              background: '#0E1B24',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '40px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Left side: Text */}
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
            <div style={{ fontSize: 60, fontWeight: 'bold', color: 'white', lineHeight: 1.1, marginBottom: '20px' }}>
              {year} {make}
            </div>
            <div style={{ fontSize: 40, color: '#ccc', marginBottom: '40px' }}>
              {model}
            </div>
            <div
              style={{
                background: 'rgb(230, 214, 180)',
                color: '#0E1B24',
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

          {/* Right side: Image */}
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
            {/* Background decoration */}
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
            
            {/* Car Emoji Poster (Lightweight) */}
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #15202B 0%, #0E1B24 100%)',
                borderRadius: '20px',
                color: 'rgb(230, 214, 180)',
                fontSize: 48,
                fontWeight: 'bold',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                flexDirection: 'column',
                padding: '40px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 72, marginBottom: 20 }}>🚗</div>
              <div>{make}</div>
              <div style={{ fontSize: 32, color: '#999', marginTop: 10 }}>{model}</div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      }
    );
  } catch (e) {
    console.error(e);
    return new ImageResponse(
      (
        <div
          style={{
            background: '#121212',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 48,
            fontWeight: 'bold',
          }}
        >
          CarCupid: Find Your Match
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  }
}
