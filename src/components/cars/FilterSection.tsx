"use client";
import { ReactNode } from "react";
import styles from "./cars.module.css";

type Props = { title: string; children: ReactNode; active?: boolean };

export default function FilterSection({ title, children, active = false }: Props) {
  return (
    <div className={`${styles.section} ${active ? styles.sectionActive : ""}`}>
      <div className={styles.sectionHead}>
        <div className={styles.sectionAccent}></div>
        <div className={styles.sectionTitle}>{title}</div>
      </div>
      <div className={styles.inputs}>{children}</div>
    </div>
  );
}
