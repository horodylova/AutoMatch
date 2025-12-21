import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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

export default function ResultsGallery({ results = [], onSaveProgress }: ResultsGalleryProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      // Scroll by roughly one card width + gap
      const scrollAmount = Math.min(window.innerWidth * 0.8, 600) + 32;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <div className={styles.sectionFirst}>
        <div className={styles.wrapping}>
          <div className={`${styles.container} ${styles.containerSlim}`}>
            <div>
              <h1 className={styles.title}>Your Matches Are Ready</h1>
              <p className={styles.description}>
                We found cars that match your lifestyle. Browse your matches and tap for details.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.wrapping}>
          {results.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No cars found with images. Please check your data source.</p>
            </div>
          ) : (
            <div className={styles.galleryWrapper}>
              <button 
                className={styles.navButton} 
                onClick={() => scroll('left')}
                aria-label="Scroll left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              <div className={styles.galleryContainer} ref={scrollContainerRef}>
                {results.map((car, index) => (
                  <div key={car.id} className={styles.cardWrapper}>
                    <Link href={`/cars/${car.id}`} target="_blank" rel="noopener noreferrer" className={styles.cardLink}>
                      <Image 
                        src={car.image} 
                        alt={`${car.make} ${car.model}`} 
                        fill
                        sizes="(max-width: 768px) 80vw, 600px"
                        className={styles.image}
                        style={{ objectFit: 'cover' }}
                        priority={index < 2}
                      />
                      <div className={styles.overlay}>
                        <div className={styles.carName}>{car.make}</div>
                        <div className={styles.carDetails}>{car.model} • {car.year}</div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              <button 
                className={styles.navButton} 
                onClick={() => scroll('right')}
                aria-label="Scroll right"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}
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
