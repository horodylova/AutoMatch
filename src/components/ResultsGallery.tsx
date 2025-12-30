import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ResultsGallery.module.css';
import { saveResults } from '../utils/storage';
import EmailModal from './quiz/modals/EmailModal';

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
  const [shareUrl, setShareUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.origin);
    }
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cards = Array.from(container.children) as HTMLElement[];
      if (cards.length === 0) return;

      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;
      
      let closestIndex = 0;
      let minDiff = Infinity;

      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const diff = Math.abs(containerCenter - cardCenter);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = index;
        }
      });

      if (closestIndex !== activeIndex) {
        setActiveIndex(closestIndex);
      }
    }
  };

  const handleSaveResults = () => {
    if (typeof window !== 'undefined') {
      saveResults(results);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const shareText = "I found my perfect car match on CarCupid! Find yours now.";
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cards = Array.from(container.children) as HTMLElement[];
      if (cards.length === 0) return;

      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;
      
      let closestCard = cards[0];
      let minDiff = Infinity;

      cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const diff = Math.abs(containerCenter - cardCenter);
        if (diff < minDiff) {
          minDiff = diff;
          closestCard = card;
        }
      });

      const currentIndex = cards.indexOf(closestCard);
      let targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0) targetIndex = 0;
      if (targetIndex >= cards.length) targetIndex = cards.length - 1;

      const targetCard = cards[targetIndex];
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  return (
    <>
      <div className={styles.sectionFirst}>
        <div className={styles.wrapping}>
          <div className={`${styles.container} ${styles.containerSlim}`}>
            <div>
              <h1 className={styles.title}>Your Matches Are Ready</h1>
              <p className={`${styles.description} ${styles.mobileTextHidden}`}>
                We found cars that match your lifestyle. Browse your matches and tap for details.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.shareSection}>
        <div className={styles.wrapping}>
          <div className={`${styles.container} ${styles.containerSlim}`}>
            <h3 className={styles.shareTitle}>Found your perfect match? Tell the world!</h3>
            <div className={styles.socialIcons}>
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon} 
                aria-label="Share on Facebook"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                </svg>
              </a>
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon} 
                aria-label="Share on LinkedIn"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                </svg>
              </a>
              <a 
                href={`https://www.threads.net/intent/post?text=${encodedText}%20${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon} 
                aria-label="Share on Threads"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/>
                </svg>
              </a>
              <a 
                href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon} 
                aria-label="Share on X"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/>
                </svg>
              </a>
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
            <>
              <div className={styles.mobileHeader}>
                <div className={styles.staticCarName}>
                  {results[activeIndex]?.year} {results[activeIndex]?.make}
                </div>
                <div className={styles.staticCarModel}>
                  {results[activeIndex]?.model}
                </div>
              </div>

              <div className={styles.galleryWrapper}>
                <button 
                  className={`${styles.navButton} ${styles.navButtonLeft}`}
                  onClick={() => scroll('left')}
                  aria-label="Scroll left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>

                <div 
                  className={styles.galleryContainer} 
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                >
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
                  className={`${styles.navButton} ${styles.navButtonRight}`}
                  onClick={() => scroll('right')}
                  aria-label="Scroll right"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>

              <div className={styles.mobileFooter}>
                <Link 
                  href={`/cars/${results[activeIndex]?.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.staticDetailsButton}
                >
                  View Details
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={styles.actionsSection}>
        <div className={styles.wrapping}>
          <div className={styles.desktopActions}>
            <div className={styles.desktopGrid}>
              <div className={styles.desktopColumn}>
                <h2 className={styles.desktopTitle}>Explore More Options</h2>
                <p className={styles.desktopDescription}>
                  We&apos;ve filtered these results based on your answers. 
                  Want to see everything? Browse our full catalog.
                </p>
                <button className={styles.desktopPrimaryButton} onClick={onSaveProgress}>
                  Full Car Listing
                </button>
              </div>

              <div className={styles.desktopColumn}>
                <h2 className={styles.desktopTitle}>Save Your Results</h2>
                <p className={styles.desktopDescription}>
                  Don&apos;t lose your perfect match! Save your results for 24 hours 
                  or email them to yourself.
                </p>
                <div className={styles.desktopButtonsRow}>
                  <button 
                    className={styles.desktopSecondaryButton} 
                    onClick={handleSaveResults}
                    disabled={isSaved}
                  >
                    {isSaved ? 'Saved!' : 'Save Results'}
                  </button>
                  
                  <button 
                    className={styles.desktopSecondaryButton}
                    onClick={() => setIsEmailModalOpen(true)}
                  >
                    Email Results
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.mobileActions}>
            <button 
              className={styles.actionButton} 
              onClick={handleSaveResults}
              disabled={isSaved}
            >
              {isSaved ? 'Saved!' : 'Save (24h)'}
            </button>
            
            <button 
              className={styles.actionButton}
              onClick={() => setIsEmailModalOpen(true)}
            >
              Email
            </button>

            <button 
              className={styles.actionButton} 
              onClick={onSaveProgress}
            >
              Full List
            </button>
          </div>
        </div>
      </div>

      {isEmailModalOpen && (
        <EmailModal 
          onClose={() => setIsEmailModalOpen(false)} 
          results={results} 
        />
      )}
    </>
  );
}
