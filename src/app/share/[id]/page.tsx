import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import ClientRedirect from './ClientRedirect';

async function getCarData(id: string) {
  try {
    const car = await prisma.catalogCar.findUnique({
      where: { id },
      select: {
        id: true,
        year: true,
        imageUrl: true,
        make: { select: { name: true } },
        model: { select: { name: true } },
      },
    });

    if (!car) return null;

    return {
      id: car.id,
      make: car.make.name,
      model: car.model.name,
      year: String(car.year),
      image: car.imageUrl ?? "",
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
  const { title: paramTitle } = await searchParams;

  // Optimized: If title is in URL params, use it directly (Stateless Mode)
  if (typeof paramTitle === 'string') {
    const title = `I matched with ${paramTitle}!`;
    const description = "Take the AutoMatch quiz to find your perfect car.";

    // Construct the OG image URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://carcupid.fit';
    // Use static poster image as requested by user
    const posterImage = `${baseUrl}/poster.jpg`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: posterImage,
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
        images: [posterImage],
      },
    };
  }

  // Fallback: If no params (legacy link), fetch from DB
  const car = await getCarData(id);

  if (!car) {
    return {
      title: 'CarCupid',
      description: 'Find your perfect car match!',
    };
  }

  const title = `I matched with ${car.year} ${car.make} ${car.model}!`;
  const description = "Take the AutoMatch quiz to find your perfect car.";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://carcupid.fit';
  const posterImage = `${baseUrl}/poster.jpg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: posterImage,
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
      images: [posterImage],
    },
  };
}

export default function SharePage() {
  // We use a client component to redirect users to the quiz start page
  // while allowing bots/scrapers to see the metadata generated above.
  return <ClientRedirect />;
}
