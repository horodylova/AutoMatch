"use client";

import { useState, useEffect } from "react";
import styles from "./DealerModal.module.css";
import { createPortal } from "react-dom";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (location: string) => void;
  carInfo: {
    make: string;
    model: string;
    year: string;
    trim: string;
  };
};

export default function DealerModal({ isOpen, onClose, onSearch, carInfo }: Props) {
  const [postalCode, setPostalCode] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = (location?: string) => {
    const loc = location || postalCode;
    if (!loc) {
      setError("Please enter a zip code or city");
      return;
    }

    onSearch(loc);
    onClose();
  };

  const handleUseLocation = () => {
    setIsLocating(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        // Success - we have permission, so "near me" will work well
        setIsLocating(false);
        handleSearch("Current Location");
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setError("Location permission denied. Please enter zip code.");
        } else {
          setError("Unable to retrieve location.");
        }
      }
    );
  };

  const content = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className={styles.title}>Find Dealers Nearby</h2>
          <p className={styles.subtitle}>
            Enter your location to find the best deals for <strong>{carInfo.year} {carInfo.make} {carInfo.model}</strong>
          </p>
        </div>

        <div className={styles.body}>
          <button 
            className={styles.locationBtn} 
            onClick={handleUseLocation}
            disabled={isLocating}
          >
            {isLocating ? (
              <span className={styles.spinner} />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            )}
            Use My Current Location
          </button>

          <div className={styles.divider}>
            <span>OR</span>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Enter Zip Code or City</label>
            <div className={styles.inputWrap}>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. 90210 or New York"
                value={postalCode}
                onChange={(e) => {
                  setPostalCode(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button className={styles.searchBtn} onClick={() => handleSearch()}>
                Search
              </button>
            </div>
            {error && <div className={styles.error}>{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" 
    ? createPortal(content, document.body) 
    : null;
}
