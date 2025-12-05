"use client";
import { useEffect, useState } from "react";
import Filters, { FiltersData } from "@/components/cars/Filters";
import ListingList from "@/components/cars/ListingList";
import styles from "@/components/cars/cars.module.css";
import Loader from "@/components/Loader";
import { fetchDataset } from "@/lib/dataset";

export default function Page() {
  const [ready, setReady] = useState(false);
  const [filters, setFilters] = useState<FiltersData>({ makes: [], priceMin: 200000, priceMax: 350000 });
  useEffect(() => {
    let active = true;
    const run = async () => {
      await fetchDataset();
      if (active) setReady(true);
    };
    run();
    return () => { active = false; };
  }, []);
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
