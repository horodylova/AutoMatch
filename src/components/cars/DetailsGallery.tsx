"use client";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import styles from "./cars.module.css";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { addWishlistItem, isWishlisted, removeWishlistItem, WISHLIST_UPDATED_EVENT } from "@/utils/storage";

export default function DetailsGallery({ id, images, title, compact = false }: { id?: string; images: string[]; title: string; compact?: boolean }) {
  const [readyImages, setReadyImages] = useState<string[]>([]);
  const [saved, setSaved] = useState<boolean>(false);
  useEffect(() => {
    let active = true;
    const run = async () => {
      const list = images.slice(0, 8);
      if (list.length === 0) { if (active) setReadyImages([]); return; }
      const tasks = list.map(url => new Promise<string | null>((resolve) => {
        if (typeof window === "undefined") return resolve(url);
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        const timer = setTimeout(() => resolve(null), 2500);
        img.onload = () => { clearTimeout(timer); resolve((img.naturalWidth >= 800 && img.naturalHeight >= 450) ? url : null); };
        img.onerror = () => { clearTimeout(timer); resolve(null); };
      }));
      const results = await Promise.all(tasks);
      const ok = results.filter((x): x is string => !!x);
      if (active) setReadyImages(ok);
    };
    run();
    return () => { active = false; };
  }, [images]);

  useEffect(() => {
    if (!id) return;
    setSaved(isWishlisted(id));
    const handler = () => setSaved(isWishlisted(id));
    window.addEventListener(WISHLIST_UPDATED_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(WISHLIST_UPDATED_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, [id]);

  const show = readyImages.length > 0 ? readyImages : images.slice(0, 1);
  const toggleWishlist = () => {
    if (!id) return;
    if (saved) {
      removeWishlistItem(id);
    } else {
      addWishlistItem({
        id,
        title,
        image: images[0],
      });
    }
  };

  return (
    <div className={`${styles.detailsGallery} ${compact ? styles.detailsGalleryCompact : ""}`}>
      <Swiper slidesPerView={1} spaceBetween={12} modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }}>
        {show.map((src, i) => (
          <SwiperSlide key={`${src}-${i}`}>
            <div className={styles.gallerySlide}>
              <Image src={src} alt={title || "car"} fill className={styles.galleryImg} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 820px" quality={95} priority={i === 0} unoptimized />
              <button type="button" className={styles.wishBtn} aria-label="Add to wishlist" onClick={toggleWishlist}>
                {saved ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
