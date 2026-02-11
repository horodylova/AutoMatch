"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter, FaYoutube } from "react-icons/fa6";
import styles from "./Footer.module.css";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/quiz")) return null;

  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.socials}>
          <a href="https://www.facebook.com/CarCupid.fit" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
            <FaFacebook />
          </a>
          <a href="https://www.instagram.com/carcupid.fit/" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
            <FaInstagram />
          </a>
          <a href="https://www.youtube.com/@CarCupid_fit" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="YouTube">
            <FaYoutube />
          </a>
          <a href="https://www.linkedin.com/company/carcupid-fit/" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="LinkedIn">
            <FaLinkedin />
          </a>
          <a href="https://x.com/CarCupid_fit" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="X (Twitter)">
            <FaXTwitter />
          </a>
        </div>
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