"use client";

import { useEffect, useState } from "react";
import styles from "./compare.module.css";
import { fetchDataset, Dataset } from "@/lib/dataset";
import { CarSpecs } from "@/utils/carScoring";
import CompareSearch from "@/components/compare/CompareSearch";
import CompareView from "@/components/compare/CompareView";

export default function ComparePage() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [car1, setCar1] = useState<CarSpecs | null>(null);
  const [car2, setCar2] = useState<CarSpecs | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    // Load dataset
    fetchDataset().then(setDataset);

    // Load from localStorage
    try {
      const saved1 = localStorage.getItem("compare_car1");
      const saved2 = localStorage.getItem("compare_car2");
      if (saved1) setCar1(JSON.parse(saved1));
      if (saved2) setCar2(JSON.parse(saved2));
    } catch (e) {
      console.error("Failed to load comparison state", e);
    }
  }, []);

  const handleSelect1 = (car: CarSpecs) => {
    setCar1(car);
    localStorage.setItem("compare_car1", JSON.stringify(car));
  };

  const handleSelect2 = (car: CarSpecs) => {
    setCar2(car);
    localStorage.setItem("compare_car2", JSON.stringify(car));
  };

  const clearSelection = (slot: 1 | 2) => {
    if (slot === 1) {
      setCar1(null);
      localStorage.removeItem("compare_car1");
    } else {
      setCar2(null);
      localStorage.removeItem("compare_car2");
    }
    setIsComparing(false);
  };

  const startComparison = () => {
    if (car1 && car2) {
      setIsComparing(true);
      // Scroll to comparison view
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
          {car1 ? (
            <div className={styles.selectedCar}>
              <img src={car1.image && !car1.image.includes("placeholder") ? car1.image : "/no-image-available.jpg"} alt={`${car1.make} ${car1.model}`} className={styles.carImage} />
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
              <img src={car2.image && !car2.image.includes("placeholder") ? car2.image : "/no-image-available.jpg"} alt={`${car2.make} ${car2.model}`} className={styles.carImage} />
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
