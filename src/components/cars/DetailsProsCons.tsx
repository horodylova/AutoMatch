"use client";
import styles from "./cars.module.css";

export default function DetailsProsCons({ pros, cons }: { pros: string[]; cons: string[] }) {
  const showPros = Array.isArray(pros) && pros.length > 0;
  const showCons = Array.isArray(cons) && cons.length > 0;
  if (!showPros && !showCons) return null;
  return (
    <>
      {showPros ? (
        <div className={styles.detailsSection}>
          <div className={styles.sectionTitle}>Pros</div>
          <div className={styles.tagCloud}>
            {pros.map(p => (
              <span key={p} className={styles.badge}>{p}</span>
            ))}
          </div>
        </div>
      ) : null}
      {showCons ? (
        <div className={styles.detailsSection}>
          <div className={styles.sectionTitle}>Cons</div>
          <div className={styles.tagCloud}>
            {cons.map(c => (
              <span key={c} className={styles.badge}>{c}</span>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
