"use client";
import styles from "./cars.module.css";

export default function DetailsReview({ paragraphs }: { paragraphs: string[] }) {
  if (paragraphs.length === 0) return null;
  return (
    <div className={styles.detailsSection}>
      <div className={styles.reviewText}>
        {paragraphs.map((p, i) => (<p key={i}>{p}</p>))}
      </div>
    </div>
  );
}

