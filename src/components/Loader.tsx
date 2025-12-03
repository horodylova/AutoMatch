"use client";
import styles from "./cars/cars.module.css";

export default function Loader({ label = "Loading" }: { label?: string }) {
  return (
    <div className={styles.loaderWrap}>
      <div className={styles.spinner} />
      <div className={styles.loaderLabel}>{label}</div>
    </div>
  );
}
