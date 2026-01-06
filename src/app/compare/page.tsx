"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./compare.module.css";
import { fetchDataset, Dataset } from "@/lib/dataset";
import { CarSpecs, parseCarData } from "@/utils/carScoring";
import CompareSearch from "@/components/compare/CompareSearch";
import CompareView from "@/components/compare/CompareView";

export default function ComparePage() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [car1, setCar1] = useState<CarSpecs | null>(null);
  const [car2, setCar2] = useState<CarSpecs | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isLoadingSharedCar, setIsLoadingSharedCar] = useState(false);

  useEffect(() => {
   
    let hasSharedCar = false;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("car1")) {
        hasSharedCar = true;
        setIsLoadingSharedCar(true);
      }
    }
    
    fetchDataset().then((ds) => {
      setDataset(ds);
      
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const car1Id = params.get("car1");
        
        if (car1Id && ds) {
          const idIdx = ds.idx["id"] ?? -1;
          const foundRow = ds.rows.find(r => String(r[idIdx] ?? "") === car1Id);
          
          if (foundRow) {
            const car = parseCarData(foundRow, ds.idx);
            setCar1(car);
          }
        }
        
        if (hasSharedCar) {
          setIsLoadingSharedCar(false);
        }
      }
    });
  }, []);

  const handleSelect1 = (car: CarSpecs) => {
    setCar1(car);
  };

  const handleSelect2 = (car: CarSpecs) => {
    setCar2(car);
  };

  const clearSelection = (slot: 1 | 2) => {
    if (slot === 1) {
      setCar1(null);
    } else {
      setCar2(null);
    }
    setIsComparing(false);
  };

  const startComparison = () => {
    if (car1 && car2) {
      setIsComparing(true);
    
      setTimeout(() => {
        document.getElementById("comparison-result")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Compare Cars</h1>
      <p className={styles.subtitle}>
        Find your perfect match by comparing specs side-by-side. 
        Select two vehicles to see how they stack up against each other.
      </p>

      <div className={styles.selectionGrid}>
        {/* Slot 1 */}
        <div className={styles.selectionCard}>
          <div className={styles.cardTitle}>First Vehicle</div>
          {isLoadingSharedCar ? (
            <div className={styles.loadingPlaceholder}>
              <div className={styles.loadingImage}>
                <svg className={styles.loadingIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className={styles.loadingLine}></div>
              <div className={`${styles.loadingLine} ${styles.short}`}></div>
            </div>
          ) : car1 ? (
            <div className={styles.selectedCar}>
              <div className={styles.imageWrapper}>
                <Image 
                  src={car1.image && !car1.image.includes("placeholder") ? car1.image : "/no-image-available.jpg"} 
                  alt={`${car1.make} ${car1.model}`} 
                  fill
                  className={styles.carImage}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className={styles.carName}>{car1.year} {car1.make} {car1.model}</div>
              <div className={styles.carTrim}>{car1.trim}</div>
              <button className={styles.changeButton} onClick={() => clearSelection(1)}>
                Change Vehicle
              </button>
            </div>
          ) : (
            <CompareSearch 
              dataset={dataset} 
              onSelect={handleSelect1} 
              placeholder="Search first car..."
            />
          )}
        </div>

        <div className={styles.vsBadge}>VS</div>

        {/* Slot 2 */}
        <div className={styles.selectionCard}>
          <div className={styles.cardTitle}>Second Vehicle</div>
          {car2 ? (
            <div className={styles.selectedCar}>
              <div className={styles.imageWrapper}>
                <Image 
                  src={car2.image && !car2.image.includes("placeholder") ? car2.image : "/no-image-available.jpg"} 
                  alt={`${car2.make} ${car2.model}`} 
                  fill
                  className={styles.carImage}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className={styles.carName}>{car2.year} {car2.make} {car2.model}</div>
              <div className={styles.carTrim}>{car2.trim}</div>
              <button className={styles.changeButton} onClick={() => clearSelection(2)}>
                Change Vehicle
              </button>
            </div>
          ) : (
            <CompareSearch 
              dataset={dataset} 
              onSelect={handleSelect2} 
              placeholder="Search second car..."
            />
          )}
        </div>
      </div>

      <div className={styles.actionArea}>
        <button 
          className={styles.compareButton} 
          disabled={!car1 || !car2}
          onClick={startComparison}
        >
          Start Comparison
        </button>
      </div>

      {isComparing && car1 && car2 && (
        <div id="comparison-result">
           <CompareView car1={car1} car2={car2} />
        </div>
      )}
    </div>
  );
}
