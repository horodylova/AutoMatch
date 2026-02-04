import { ImageResponse } from 'next/og';

export const alt = 'My Perfect Car Match';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const { make, model, year, image } = params;

  // Default if no data
  if (!make || !model) {
    return new ImageResponse(
      (
        <div
          style={{
            background: '#121212',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <div style={{ fontSize: 60, fontWeight: 'bold', color: 'rgb(230, 214, 180)' }}>CarCupid</div>
          <div style={{ fontSize: 40, marginTop: 20 }}>Find Your Perfect Match</div>
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: '#121212',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '40px',
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
          <div style={{ fontSize: 30, color: 'rgb(230, 214, 180)', marginBottom: '10px' }}>
            MY PERFECT MATCH
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
          
          {/* Main Image */}
          {image ? (
            <img
              src={image as string}
              alt={`${make} ${model}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              }}
            />
          ) : null}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
