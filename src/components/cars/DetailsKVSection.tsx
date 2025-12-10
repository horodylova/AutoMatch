"use client";
import styles from "./cars.module.css";

export type KVItem = { k: string; v: string };

export default function DetailsKVSection({ title, items, hideEmpty = true }: { title: string; items: KVItem[]; hideEmpty?: boolean }) {
  const list = hideEmpty ? items.filter(x => String(x.v || "").trim()) : items;
  if (list.length === 0) return null;
  return (
    <div className={styles.detailsSection}>
      <div className={styles.sectionTitle}>{title}</div>
      <div className={styles.kvGrid}>
        {list.map(({ k, v }) => (
          <div key={k} className={styles.kvItem}><span className={styles.kvKey}>{k}</span><span className={styles.kvVal}>{String(v)}</span></div>
        ))}
      </div>
    </div>
  );
}
