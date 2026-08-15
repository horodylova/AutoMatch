"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Filters, { FiltersData } from "@/components/cars/Filters";
import ListingList from "@/components/cars/ListingList";
import CarsMobileExperience from "@/components/cars/mobile/CarsMobileExperience";
import styles from "@/components/cars/cars.module.css";
import Loader from "@/components/Loader";

export default function Page() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [filters, setFilters] = useState<FiltersData>({ makes: [] });
  const [ready, setReady] = useState(false);
  const pending = useRef({ filters: false, listing: false });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  const markReady = useCallback((part: "filters" | "listing") => {
    pending.current[part] = true;
    if (pending.current.filters && pending.current.listing) {
      setReady(true);
    }
  }, []);

  const handleFiltersReady = useCallback(() => markReady("filters"), [markReady]);
  const handleListingReady = useCallback(() => markReady("listing"), [markReady]);

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
      {!ready && <Loader />}
      <div className={styles.layout} style={{ display: ready ? undefined : "none" }}>
        <Filters onApply={setFilters} onReady={handleFiltersReady} />
        <ListingList filters={filters} onReady={handleListingReady} />
      </div>
    </div>
  );
}
