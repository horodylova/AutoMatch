"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./cars.module.css";

export type ListingRowData = {
  id: string;
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
        <Image src={item.imageUrl || "/no-image-available.jpg"} alt={item.title} fill sizes="(max-width: 900px) 100vw, 300px" priority unoptimized className={styles.galleryImg} />
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
        <Link href={`/cars/${encodeURIComponent(item.id)}`} className={styles.detailsBtn}>Details</Link>
      </div>
    </div>
  );
}
