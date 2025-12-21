"use client";

import { usePathname } from "next/navigation";
import styles from "./Footer.module.css";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/quiz")) return null;

  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.copy}>&copy; {year} CarCupid</span>
      </div>
    </footer>
  );
}