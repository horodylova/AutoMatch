"use client";
import React, { useState } from 'react';
import Image from 'next/image';

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
    
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    
    const params = new URLSearchParams();
    params.set('title', `${car.year} ${car.make} ${car.model}`);
    
    const sharePageUrl = `${origin}/share/${car.id}?${params.toString()}`;
    const encodedUrl = encodeURIComponent(sharePageUrl);
    const shareText = "I built my dream garage on CarCupid! Check out my lineup.";
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
    
    setTimeout(() => {
      if (targetUrl) {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
      onClose();
    }, 1500);
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      zIndex: 2000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      backdropFilter: "blur(4px)"
    }}>
      <div style={{
        background: "var(--kendo-color-surface)",
        borderRadius: "24px",
        padding: "32px",
        maxWidth: "500px",
        width: "100%",
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        border: "1px solid var(--kendo-color-border-alt)",
        animation: "fadeIn 0.2s ease-out",
        position: "relative"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            border: "none",
            color: "var(--kendo-color-on-app-surface)",
            opacity: 0.6,
            cursor: "pointer",
            fontSize: "24px",
            lineHeight: 1
          }}
        >
          &times;
        </button>

        <div style={{ marginBottom: "24px" }}>
          <h3 style={{
            fontSize: "24px",
            fontWeight: 800,
            marginBottom: "8px",
            color: "var(--kendo-color-on-app-surface)"
          }}>
            {step === 'select' ? 'Choose Your Hero Car' : 'Preparing Share...'}
          </h3>
          <p style={{
            fontSize: "15px",
            lineHeight: 1.5,
            color: "var(--kendo-color-subtle)",
            marginBottom: "0"
          }}>
            {step === 'select' 
              ? `Select the car you want to feature in your ${getNetworkName(network)} post`
              : `Redirecting to ${getNetworkName(network)}...`
            }
          </p>
        </div>
        
        {step === 'select' ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "16px",
            marginBottom: "24px"
          }}>
            {results.map((car) => (
              <button
                key={car.id}
                onClick={() => handleCarSelect(car)}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  textAlign: "left",
                  borderRadius: "12px",
                  overflow: "hidden",
                  transition: "transform 0.1s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ position: "relative", width: "100%", aspectRatio: "16/10" }}>
                  <Image
                    src={car.image || "/no-image-available.jpg"}
                    alt={`${car.year} ${car.make} ${car.model}`}
                    fill
                    unoptimized
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div style={{ padding: "12px" }}>
                  <div style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "var(--kendo-color-on-app-surface)",
                    marginBottom: "4px"
                  }}>
                    {car.year} {car.make}
                  </div>
                  <div style={{
                    fontSize: "13px",
                    color: "var(--kendo-color-subtle)"
                  }}>
                    {car.model}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: "center",
            padding: "32px 0",
            marginBottom: "24px"
          }}>
            <div style={{
              width: "60px",
              height: "60px",
              margin: "0 auto 20px",
              border: "3px solid var(--kendo-color-border-alt)",
              borderTopColor: "var(--kendo-color-primary)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }} />
            <p style={{
              fontSize: "16px",
              color: "var(--kendo-color-on-app-surface)",
              marginBottom: "8px"
            }}>
              Getting ready to share your garage...
            </p>
            {selectedCar && (
              <p style={{
                fontSize: "14px",
                color: "var(--kendo-color-subtle)"
              }}>
                Featuring: {selectedCar.year} {selectedCar.make} {selectedCar.model}
              </p>
            )}
          </div>
        )}

        <div style={{ textAlign: "center" }}>
          <button
            onClick={onClose}
            style={{
              padding: "12px 24px",
              borderRadius: "99px",
              background: "transparent",
              color: "var(--kendo-color-on-app-surface)",
              border: "1px solid var(--kendo-color-border-alt)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.1s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--kendo-color-surface-alt)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            Cancel
          </button>
        </div>

        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}