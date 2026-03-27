"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./cars.module.css";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { addWishlistItem, isWishlisted, removeWishlistItem, WISHLIST_UPDATED_EVENT } from "@/utils/storage";

export type ListingRowData = {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  price: string;
  specs: string[];
};

export default function ListingRow({ item }: { item: ListingRowData }) {
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    setSaved(isWishlisted(item.id));
    const handler = () => setSaved(isWishlisted(item.id));
    window.addEventListener(WISHLIST_UPDATED_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(WISHLIST_UPDATED_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, [item.id]);

  const toggleWishlist = () => {
    if (saved) {
      removeWishlistItem(item.id);
    } else {
      addWishlistItem({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        image: item.imageUrl,
      });
    }
  };

  return (
    <div className={styles.row}>
      <div className={styles.rowImgWrap}>
        <Image src={item.imageUrl || "/no-image-available.jpg"} alt={item.title} fill sizes="(max-width: 900px) 100vw, 300px" priority unoptimized className={styles.galleryImg} />
        <button type="button" className={styles.wishBtn} aria-label="Add to wishlist" onClick={toggleWishlist}>
          {saved ? <FaHeart /> : <FaRegHeart />}
        </button>
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
