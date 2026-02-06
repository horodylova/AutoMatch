"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import styles from './ShareModal.module.css';

interface CarResult {
  id: string;
  image: string;
  make: string;
  model: string;
  year: string;
}

export type ShareNetwork = 'facebook' | 'linkedin' | 'twitter' | 'threads';

interface ShareModalProps {
  results: CarResult[];
  network: ShareNetwork;
  onClose: () => void;
}

export default function ShareModal({ results, network, onClose }: ShareModalProps) {
  const [step, setStep] = useState<'select' | 'redirect'>('select');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedCar, setSelectedCar] = useState<CarResult | null>(null);

  const getNetworkName = (n: ShareNetwork) => {
    switch (n) {
      case 'facebook': return 'Facebook';
      case 'linkedin': return 'LinkedIn';
      case 'twitter': return 'X (Twitter)';
      case 'threads': return 'Threads';
      default: return 'Social Network';
    }
  };

  const handleCarSelect = (car: CarResult) => {
    setSelectedCar(car);
    setStep('redirect');
    
    // Construct the share URL pointing to our dynamic share page with params to avoid DB lookup
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    
    // Encode parameters for the share URL
    const params = new URLSearchParams();
    // We don't need the image param anymore as we use a static poster
    // params.set('image', car.image);
    params.set('title', `${car.year} ${car.make} ${car.model}`);
    
    const sharePageUrl = `${origin}/share/${car.id}?${params.toString()}`;
    const encodedUrl = encodeURIComponent(sharePageUrl);
    const shareText = "I found my perfect car match on CarCupid! Find yours now.";
    const encodedText = encodeURIComponent(shareText);
    
    let targetUrl = '';
    
    switch (network) {
      case 'facebook':
        targetUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        targetUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'twitter':
        targetUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'threads':
        targetUrl = `https://www.threads.net/intent/post?text=${encodedText}%20${encodedUrl}`;
        break;
    }
    
    // Simulate "warming up" / delay for user experience
    setTimeout(() => {
      if (targetUrl) {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
      onClose();
    }, 1500);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {step === 'select' ? 'Choose Your Hero Car' : 'Preparing Share...'}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className={styles.modalBody}>
          {step === 'select' ? (
            <>
              <p className={styles.instruction}>
                Select the car you want to feature in your {getNetworkName(network)} post
              </p>
              <div className={styles.grid}>
                {results.map((car) => (
                  <div 
                    key={car.id} 
                    className={styles.carCard}
                    onClick={() => handleCarSelect(car)}
                  >
                    <Image
                      src={car.image}
                      alt={`${car.make} ${car.model}`}
                      fill
                      className={styles.carImage}
                      sizes="(max-width: 600px) 50vw, 200px"
                      unoptimized
                    />
                    <div className={styles.carOverlay}>
                      {car.year} {car.make}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>
                Redirecting to {getNetworkName(network)}...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
