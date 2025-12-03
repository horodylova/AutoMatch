"use client";
import Filters from "@/components/cars/Filters";
import ListingList from "@/components/cars/ListingList";
import styles from "@/components/cars/cars.module.css";

export default function Page() {
  return (
    <div className={styles.page}>
      {/* <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 26, fontWeight: 800 }}>Car Listings</div>
      </div> */}
      <div className={styles.layout}>
        <Filters />
        <ListingList />
      </div>
    </div>
  );
}
