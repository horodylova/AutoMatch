"use client";
import { useEffect, useState } from "react";
import Filters, { FiltersData } from "@/components/cars/Filters";
import ListingList from "@/components/cars/ListingList";
import CarsMobileExperience from "@/components/cars/mobile/CarsMobileExperience";
import styles from "@/components/cars/cars.module.css";
import Loader from "@/components/Loader";

export default function Page() {
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
      <div className={styles.layout}>
        <Filters onApply={setFilters} />
        <ListingList filters={filters} />
      </div>
    </div>
  );
}
