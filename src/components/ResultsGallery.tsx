import React from 'react';
import Image from 'next/image';
import styles from './ResultsGallery.module.css';

export interface CarResult {
  id: string;
  image: string;
  make: string;
  model: string;
  year: string;
  price?: string;
}

interface ResultsGalleryProps {
  results?: CarResult[];
  onBack?: () => void;
  onSaveProgress?: () => void;
}

const MOCK_RESULTS: CarResult[] = [
  {
    id: '1',
    image: '/photos-cars/mateusz-suski-D4UZJJbRjP4-unsplash.jpg',
    make: 'Porsche',
    model: '911 Carrera',
    year: '2024'
  },
  {
    id: '2',
    image: '/photos-cars/mateusz-suski-D4UZJJbRjP4-unsplash.jpg',
    make: 'Tesla',
    model: 'Model S Plaid',
    year: '2024'
  },
  {
    id: '3',
    image: '/photos-cars/mateusz-suski-D4UZJJbRjP4-unsplash.jpg',
    make: 'Mercedes-Benz',
    model: 'S-Class',
    year: '2023'
  },
  {
    id: '4',
    image: '/photos-cars/mateusz-suski-D4UZJJbRjP4-unsplash.jpg',
    make: 'BMW',
    model: 'M4 Competition',
    year: '2024'
  },
  {
    id: '5',
    image: '/photos-cars/mateusz-suski-D4UZJJbRjP4-unsplash.jpg',
    make: 'Audi',
    model: 'RS e-tron GT',
    year: '2024'
  }
];

export default function ResultsGallery({ results = MOCK_RESULTS, onSaveProgress }: ResultsGalleryProps) {
  return (
    <>
      <div className={styles.sectionFirst}>
        <div className={styles.wrapping}>
          <div className={`${styles.container} ${styles.containerSlim}`}>
            <div>
              <h1 className={styles.title}>Your Matches Are Ready</h1>
              <p className={styles.description}>
                We found cars that match your lifestyle. Scroll to explore your matches and tap for details.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.wrapping}>
          <div className={`${styles.container} ${styles.containerSlim}`}>
            <div className={styles.coverFlow}>
              <div className={styles.track}>
                {results.map((car, index) => (
                  <div key={car.id} className={styles.space}>
                    <div className={styles.cover}>
                      <Image 
                        src={car.image} 
                        alt={`${car.make} ${car.model}`} 
                        fill
                        sizes="(max-width: 768px) 90vw, 600px"
                        className={styles.image} // We need to ensure image styling is correct within .cover
                        style={{ objectFit: 'cover' }}
                        priority={index < 2}
                      />
                      <div className={styles.overlay}>
                        <div className={styles.carName}>{car.make}</div>
                        <div className={styles.carDetails}>{car.model} • {car.year}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.wrapping}>
          <div className={`${styles.container} ${styles.containerSlim}`}>
            <div>
              <h2 className={styles.title}>Explore More Options</h2>
              <p className={styles.description}>
                We&apos;ve filtered these results based on your answers to find your perfect match. 
                However, if you&apos;d like to see everything we have to offer, you can browse our full catalog.
              </p>
              <button className={styles.button} onClick={onSaveProgress}>
                View Full Car Listing
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
