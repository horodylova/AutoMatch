"use client";
import styles from "./cars.module.css";

export default function DetailsProsCons({ pros, cons }: { pros: string[]; cons: string[] }) {
  return (
    <>
      <div className={styles.detailsSection}>
        <div className={styles.sectionTitle}>Pros</div>
        <div className={styles.tagCloud}>
          {(pros.length > 0 ? pros : ["None"]).map(p => (
            <span key={p} className={styles.badge}>{p}</span>
          ))}
        </div>
      </div>
      <div className={styles.detailsSection}>
        <div className={styles.sectionTitle}>Cons</div>
        <div className={styles.tagCloud}>
          {(cons.length > 0 ? cons : ["None"]).map(c => (
            <span key={c} className={styles.badge}>{c}</span>
          ))}
        </div>
      </div>
    </>
  );
}

