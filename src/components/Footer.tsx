"use client";

import Link from "next/link";
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
        <div className={styles.links}>
          <Link href="/terms" className={styles.link}>Terms</Link>
          <span className={styles.separator}>•</span>
          <Link href="/privacy" className={styles.link}>Privacy</Link>
        </div>
      </div>
    </footer>
  );
}