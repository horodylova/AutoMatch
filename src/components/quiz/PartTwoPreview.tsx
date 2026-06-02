"use client";
import Image from "next/image";
import styles from "./partTwoPreview.module.css";
import previewImage from "../../../public/optimized/lamborgini.webp";

export default function PartTwoPreview() {
  return (
    <section className={styles.hero}>
      <div className={styles.media}>
        <Image
          src={previewImage}
          alt="Preview"
          fill
          priority
          fetchPriority="high"
          loading="eager"
          placeholder="blur"
          sizes="(max-width: 639px) 100vw, 50vw"
          className={styles.img}
        />
        <div className={styles.overlay} />
      </div>
      <div className={styles.content}>
        <h1 className={styles.title}>Two-Part Match Quiz</h1>
        <p className={styles.lead}>We’ve split the experience into two parts.</p>
        <div className={styles.points}>
          <p>Part 1 covers essentials: budget, timeframe, financing, trade-in, and readiness.</p>
          <p>Part 2 fine-tunes the match with your lifestyle and preferences.</p>
          <p>After Part 1, we’ll build a starting list of up to 1,000 potential matches you can revisit anytime.</p>
        </div>
      </div>
    </section>
  );
}
