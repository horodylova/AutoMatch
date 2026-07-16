"use client";
import { useEffect, useState } from "react";
import Filters, { FiltersData } from "@/components/cars/Filters";
import ListingList from "@/components/cars/ListingList";
import CarsMobileExperience from "@/components/cars/mobile/CarsMobileExperience";
import styles from "@/components/cars/cars.module.css";
import Loader from "@/components/Loader";
import { fetchDataset } from "@/lib/dataset";

export default function Page() {
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [filters, setFilters] = useState<FiltersData>({ makes: [] });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (isMobile === true) return;
    let active = true;
    const run = async () => {
      await fetchDataset();
      if (active) setReady(true);
    };
    run();
    return () => { active = false; };
  }, [isMobile]);

  if (isMobile === null) {
    return (
      <div className={styles.page}>
        <Loader />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className={styles.page}>
        <CarsMobileExperience filters={filters} onFiltersChange={setFilters} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {ready ? (
        <div className={styles.layout}>
          <Filters onApply={setFilters} />
          <ListingList filters={filters} />
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
}
