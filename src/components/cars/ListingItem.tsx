"use client";
import { useEffect, useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import Link from "next/link";
import Image from "next/image";
import styles from "./cars.module.css";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { addWishlistItem, isWishlisted, removeWishlistItem, WISHLIST_UPDATED_EVENT } from "@/utils/storage";
export type ListingItemData = {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  price: string;
  badges: string[];
  specs: string[];
};

export default function ListingItem({ item, openInNewTab }: { item: ListingItemData; openInNewTab?: boolean }) {
  const [saved, setSaved] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState<string>(item.imageUrl || "/no-image-available.jpg");

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

  useEffect(() => {
    setImgSrc(item.imageUrl || "/no-image-available.jpg");
  }, [item.imageUrl]);

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
    <div className={styles.card} data-id={item.id}>
      <div className={styles.imgWrap}>
        <Image src={imgSrc} alt={item.title} fill unoptimized className={styles.cardImg} onError={() => setImgSrc("/no-image-available.jpg")} />
        <button type="button" className={styles.wishBtn} aria-label="Add to wishlist" onClick={toggleWishlist}>
          {saved ? <FaHeart /> : <FaRegHeart />}
        </button>
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
          <Link 
            href={`/cars/${encodeURIComponent(item.id)}`} 
            target={openInNewTab ? "_blank" : undefined}
            rel={openInNewTab ? "noopener noreferrer" : undefined}
          >
            <Button themeColor="primary" className={styles.detailsBtn}>Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
