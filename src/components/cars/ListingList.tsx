"use client";
import ListingItem, { ListingItemData } from "./ListingItem";
import styles from "./cars.module.css";

const sample: ListingItemData = {
  imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=80&auto=format&fit=crop",
  title: "Acura ADX 2025 Base",
  subtitle: "AWD 1.5L Turbo CVT",
  price: "$34,900",
  badges: ["New", "In stock"],
  specs: ["1.5L", "190 HP", "AWD", "30 MPG", "5 seats"],
};

const items: ListingItemData[] = Array.from({ length: 9 }).map(() => sample);

export default function ListingList() {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>Results</div>
      <div className={styles.panelBody}>
        <div className={styles.listGrid}>
          {items.map((it, i) => (
            <ListingItem key={i} item={it} />
          ))}
        </div>
      </div>
    </div>
  );
}
