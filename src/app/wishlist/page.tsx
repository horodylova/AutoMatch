"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./wishlist.module.css";
import { FaHeart } from "react-icons/fa6";
import { getWishlist, removeWishlistItem, WISHLIST_UPDATED_EVENT, WishlistItem } from "@/utils/storage";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const sync = () => {
      const w = getWishlist();
      setItems(w?.items || []);
    };
    sync();
    window.addEventListener(WISHLIST_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(WISHLIST_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <FaHeart />
          </div>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Your Wishlist</h1>
            <p className={styles.subtitle}>Saved for 24 hours on this device.</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className={styles.emptyCard}>
            <div className={styles.accentBar} />
            <div className={styles.emptyInner}>
              <div className={styles.logoCol}>
                <div className={styles.logoBox}>
                  <Image
                    src="/logo%20for%20progress.bar.png"
                    alt="CarCupid"
                    width={220}
                    height={160}
                    priority
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>
              <div className={styles.divider} />
              <div className={styles.contentCol}>
                <div className={styles.emptyText}>
                  <div className={styles.emptyTitle}>No saved cars yet</div>
                  <div className={styles.emptySubtitle}>
                    Tap the heart icon on any car to save it here. Your shortlist awaits.
                  </div>
                </div>
                <div className={styles.actions}>
                  <Link href="/cars" className={styles.primaryBtn}>Browse Cars</Link>
                  <Link href="/quiz" className={styles.secondaryBtn}>Take the Quiz</Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.itemsSection}>
            <div className={styles.itemsGrid}>
              {items.map((it) => {
                const title = it.title || [it.year, it.make, it.model].filter(Boolean).join(" ");
                const subtitle = it.subtitle || it.trim || "";
                const img = it.image && !it.image.includes("placeholder") ? it.image : "/no-image-available.jpg";
                return (
                  <div key={it.id} className={styles.itemCard}>
                    <Link href={`/cars/${encodeURIComponent(it.id)}`} className={styles.itemLink}>
                      <div className={styles.itemImageWrap}>
                        <Image src={img} alt={title || "Car"} fill unoptimized sizes="(max-width: 700px) 100vw, 280px" className={styles.itemImage} />
                      </div>
                      <div className={styles.itemBody}>
                        <div className={styles.itemTitle}>{title}</div>
                        {subtitle ? <div className={styles.itemSubtitle}>{subtitle}</div> : null}
                      </div>
                    </Link>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removeWishlistItem(it.id)}
                      aria-label="Remove from wishlist"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
