import React from 'react';
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
}

const MOCK_RESULTS: CarResult[] = [
  {
    id: '1',
    image: '/photos-cars/amir-riazipour-TeYK3zOIkUk-unsplash.jpg',
    make: 'Porsche',
    model: '911 Carrera',
    year: '2024'
  },
  {
    id: '2',
    image: '/photos-cars/amir-riazipour-TeYK3zOIkUk-unsplash.jpg',
    make: 'Tesla',
    model: 'Model S Plaid',
    year: '2024'
  },
  {
    id: '3',
    image: '/photos-cars/amir-riazipour-TeYK3zOIkUk-unsplash.jpg',
    make: 'Mercedes-Benz',
    model: 'S-Class',
    year: '2023'
  },
  {
    id: '4',
    image: '/photos-cars/amir-riazipour-TeYK3zOIkUk-unsplash.jpg',
    make: 'BMW',
    model: 'M4 Competition',
    year: '2024'
  },
  {
    id: '5',
    image: '/photos-cars/amir-riazipour-TeYK3zOIkUk-unsplash.jpg',
    make: 'Audi',
    model: 'RS e-tron GT',
    year: '2024'
  }
];

export default function ResultsGallery({ results = MOCK_RESULTS }: ResultsGalleryProps) {
  return (
    <div className={styles.section}>
      <div className={styles.wrapping}>
        <div className={styles.container}>
          
          <div className={styles.containerSlim} style={{ margin: '0 auto' }}>
            <h1 className={styles.title}>Your Matches Are Ready</h1>
            <p className={styles.description}>
              We found cars that match your lifestyle. Scroll to explore your matches and tap for details.
            </p>
          </div>

          <div className={styles.coverFlow}>
            <div className={styles.track}>
              {results.map((car) => (
                <div key={car.id} className={styles.space}>
                  <div className={styles.card}>
                    <img 
                      src={car.image} 
                      alt={`${car.make} ${car.model}`} 
                      className={styles.image}
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
  );
}
