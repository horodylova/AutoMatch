"use client";
import { useState } from "react";
import styles from "./cars.module.css";

export default function DetailsReview({ paragraphs }: { paragraphs: string[] }) {
  const [expanded, setExpanded] = useState(false);
  if (paragraphs.length === 0) return null;
  return (
    <div className={styles.detailsSection}>
      <div className={`${styles.reviewText} ${expanded ? "" : styles.reviewClamp}`}>
        {paragraphs.map((p, i) => (<p key={i}>{p}</p>))}
      </div>
      <button className={styles.reviewToggle} onClick={() => setExpanded(v => !v)}>
        {expanded ? "Show less" : "Show more"}
      </button>
    </div>
  );
}
