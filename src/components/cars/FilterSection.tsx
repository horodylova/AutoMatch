"use client";
import { ReactNode } from "react";
import styles from "./cars.module.css";

type Props = { title: string; children: ReactNode };

export default function FilterSection({ title, children }: Props) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{title}</div>
      <div className={styles.inputs}>{children}</div>
    </div>
  );
}
