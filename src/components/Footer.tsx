"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter, FaYoutube, FaThreads } from "react-icons/fa6";
import styles from "./Footer.module.css";

export default function Footer() {
  const pathname = usePathname();
  const [logoSrc, setLogoSrc] = useState<string>("/logos/logo.svg");

  useEffect(() => {
    const updateLogo = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setLogoSrc(theme === "light" ? "/cropped logo.png" : "/logos/logo.svg");
    };

    updateLogo();
    const observer = new MutationObserver(updateLogo);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  if (pathname?.startsWith("/quiz")) return null;

  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* Brand Column */}
        <div className={styles.column}>
          <div className={styles.brandRow}>
            <Link href="/" className={styles.brandLogo}>
              <div className={styles.logoBox}>
                <Image
                  src={logoSrc}
                  alt="CarCupid"
                  fill
                  className={styles.logoImg}
                />
              </div>
            </Link>
            <p className={styles.brandDesc}>
              Find your perfect car match with our unique personality insights.
            </p>
          </div>
          <div className={styles.socials}>
            <a href="https://www.facebook.com/CarCupid.fit" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="https://www.instagram.com/carcupid.fit/" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://www.threads.com/@carcupid.fit" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Threads">
              <FaThreads />
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
        </div>

        {/* Discover Column */}
        <div className={styles.column}>
          <div className={styles.navTitle}>Discover</div>
          <Link href="/quiz" className={styles.navLink}>Take the Quiz</Link>
          <Link href="/cars" className={styles.navLink}>Browse Cars</Link>
          <Link href="/compare" className={styles.navLink}>Compare</Link>
          <Link href="/journal" className={styles.navLink}>Journal</Link>
        </div>

        {/* Partners Column */}
        <div className={styles.column}>
          <div className={styles.navTitle}>Partners</div>
          <Link href="/dealers" className={styles.navLink}>For Dealers</Link>
        </div>

        {/* Legal Column */}
        <div className={styles.column}>
          <div className={styles.navTitle}>Legal</div>
          <Link href="/terms" className={styles.navLink}>Terms of Service</Link>
          <Link href="/privacy" className={styles.navLink}>Privacy Policy</Link>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.bottom}>
        <span>&copy; {year} CarCupid. All rights reserved.</span>
      </div>
    </footer>
  );
}
