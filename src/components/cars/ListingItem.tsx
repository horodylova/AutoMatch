"use client";
import { Button } from "@progress/kendo-react-buttons";
import styles from "./cars.module.css";

export type ListingItemData = {
  imageUrl: string;
  title: string;
  subtitle: string;
  price: string;
  badges: string[];
  specs: string[];
};

export default function ListingItem({ item }: { item: ListingItemData }) {
  return (
    <div className={styles.card}>
      <div className={styles.imgWrap}>
        <img src={item.imageUrl} alt={item.title} />
        <div className={styles.badgeBar}>
          {item.badges.map((b) => (
            <span key={b} className={styles.badge}>{b}</span>
          ))}
        </div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.title}>{item.title}</div>
        <div className={styles.subtitle}>{item.subtitle}</div>
        <div className={styles.specs}>
          {item.specs.map((s, i) => (
            <span key={`${s}-${i}`} className={styles.spec}>{s}</span>
          ))}
        </div>
        <div className={styles.priceRow}>
          <div className={styles.price}>{item.price}</div>
          <Button themeColor="primary">Details</Button>
        </div>
      </div>
    </div>
  );
}
