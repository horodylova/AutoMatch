"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./PromoModal.module.css";

const TIMEOUT_MS = 30000;
const STORAGE_KEY = "promoBannerLastSeen";
const SHOW_AGAIN_HOURS = 24 * 7;

export default function PromoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showReplay, setShowReplay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();
    const shouldShow = !lastSeen || (now - parseInt(lastSeen) > SHOW_AGAIN_HOURS * 60 * 60 * 1000);
    
    if (shouldShow) {
      timerRef.current = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
      }, TIMEOUT_MS);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play().catch((e) => {
        console.log("Autoplay blocked or failed:", e);
        setShowReplay(true);
      });
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleVideoEnded = () => {
    setShowReplay(true);
  };

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setShowReplay(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={handleClose} aria-label="Close promo">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18"/>
            <path d="m6 6 12 12"/>
          </svg>
        </button>
        
        <div className={styles.videoContainer}>
          <video
            ref={videoRef}
            className={styles.video}
            src="/banner%20video/banner.mp4"
            playsInline
            muted={false}
            onEnded={handleVideoEnded}
          />
          
          <div className={`${styles.replayOverlay} ${showReplay ? styles.visible : ""}`}>
            <button className={styles.replayButton} onClick={handleReplay}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
              </svg>
              Watch Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
