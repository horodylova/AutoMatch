"use client";
import { Button } from "@progress/kendo-react-buttons";
import styles from "./cars.module.css";

export type ListingRowData = {
  imageUrl: string;
  title: string;
  subtitle: string;
  price: string;
  specs: string[];
};

export default function ListingRow({ item }: { item: ListingRowData }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowImgWrap}>
        <img src={item.imageUrl} alt={item.title} />
      </div>
      <div className={styles.rowBody}>
        <div className={styles.rowTitle}>{item.title}</div>
        <div className={styles.rowSubtitle}>{item.subtitle}</div>
        <div className={styles.rowSpecs}>
          {item.specs.map((s, i) => (
            <span key={`${s}-${i}`} className={styles.spec}>{s}</span>
          ))}
        </div>
      </div>
      <div className={styles.rowSide}>
        <div className={styles.price}>{item.price}</div>
        <Button themeColor="primary" className={styles.detailsBtn}>Details</Button>
      </div>
    </div>
  );
}
