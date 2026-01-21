"use client";
import { Button } from "@progress/kendo-react-buttons";
import Link from "next/link";
import Image from "next/image";
import styles from "./cars.module.css";
export type ListingItemData = {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  price: string;
  badges: string[];
  specs: string[];
};

export default function ListingItem({ item }: { item: ListingItemData }) {
  return (
    <div className={styles.card} data-id={item.id}>
      <div className={styles.imgWrap}>
        <Image src={item.imageUrl} alt={item.title} fill unoptimized className={styles.cardImg} />
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
          <Link href={`/cars/${encodeURIComponent(item.id)}`}>
            <Button themeColor="primary" className={styles.detailsBtn}>Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
