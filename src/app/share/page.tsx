import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './share.module.css';
import { Metadata } from 'next';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const revalidate = 86400;

export async function generateMetadata(
  { searchParams }: Props
): Promise<Metadata> {
  const params = await searchParams;
  const make = params.make as string;
  const model = params.model as string;
  const year = params.year as string;
  
  const title = make && model ? `${year} ${make} ${model}` : 'Find Your Perfect Car Match';
  const description = 'I found my dream car on CarCupid. Take the quiz to find yours!';
  const baseUrl = 'https://carcupid.fit';

  const ogParams = new URLSearchParams();
  if (make) ogParams.set('make', make);
  if (model) ogParams.set('model', model);
  if (year) ogParams.set('year', year);

  const shareUrl = make && model ? `${baseUrl}/share?${ogParams.toString()}` : baseUrl;

  // Standard Image (FB/Threads)
  const ogImage = make && model 
    ? `${baseUrl}/api/og?${ogParams.toString()}`
    : `${baseUrl}/poster.jpg`;

  // Simple Image (Twitter/LinkedIn)
  const simpleParams = new URLSearchParams(ogParams);
  simpleParams.set('type', 'simple');
  const twitterImage = make && model 
    ? `${baseUrl}/api/og?${simpleParams.toString()}`
    : `${baseUrl}/poster.jpg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: shareUrl,
      siteName: 'CarCupid',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [twitterImage],
      creator: '@carcupid',
    }
  };
}

export default async function SharePage({ searchParams }: Props) {
  const params = await searchParams;
  const make = params.make as string;
  const model = params.model as string;
  const year = params.year as string;
  // image param is deprecated, use generated OG image instead

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

  const ogParams = new URLSearchParams();
  if (make) ogParams.set('make', make);
  if (model) ogParams.set('model', model);
  if (year) ogParams.set('year', year);
  
  const posterImage = `/api/og?${ogParams.toString()}`;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          <Image
            src={posterImage}
            alt={`${make} ${model}`}
            fill
            className={styles.image}
            unoptimized
          />
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
