import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './share.module.css';
import { Metadata } from 'next';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { searchParams }: Props
): Promise<Metadata> {
  const params = await searchParams;
  const make = params.make as string;
  const model = params.model as string;
  const year = params.year as string;
  const image = params.image as string;
  
  const title = make && model ? `My Perfect Match: ${make} ${model}` : 'Find Your Perfect Car Match';
  const description = 'I found my dream car on CarCupid. Take the quiz to find yours!';

  const ogImage = make && model 
    ? `/api/og?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year || ''}&image=${encodeURIComponent(image as string || '')}`
    : '/poster.jpg';

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
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    }
  };
}

export default async function SharePage({ searchParams }: Props) {
  const params = await searchParams;
  const { make, model, year, image } = params;

  if (!make || !model) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <Image
            src="/cupids/Hugging Car.png"
            alt="CarCupid Logo"
            width={120}
            height={120}
            className={styles.logo}
          />
          <h1 className={styles.title}>Find Your Perfect Car</h1>
          <p className={styles.description}>
            Take our AI-powered quiz to discover the car that fits your lifestyle perfectly.
          </p>
          <Link href="/" className={styles.button}>
            Start Quiz
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          {image ? (
            <Image
              src={image as string}
              alt={`${make} ${model}`}
              fill
              className={styles.image}
              unoptimized // Allow external URLs
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333' }}>
              No Image Available
            </div>
          )}
        </div>
        <div className={styles.content}>
          <div className={styles.title}>My Perfect Match</div>
          <h1 className={styles.carName}>{year} {make} {model}</h1>
          <p className={styles.description}>
            I found this car using CarCupid&apos;s smart matching quiz. 
            Want to see what your perfect match is?
          </p>
          <Link href="/" className={styles.button}>
            Find My Match
          </Link>
        </div>
      </div>
    </div>
  );
}
