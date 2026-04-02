"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../../styles";

export default function CancelPage() {
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

  return (
    <div className={styles.successWrap}>
      <div className={styles.successCard}>
        <div className={styles.successLogo}>
          <Image src={logoSrc} alt="CarCupid" fill priority />
        </div>
        <div className={styles.successTitle}>Canceled</div>
        <div className={styles.successSubtitle}>Your order was canceled. If you need help or want to cancel a subscription, contact a manager.</div>
        <div className={styles.successActions}>
          <Link className={styles.successPrimary} href="/dealers/order">Return to Order</Link>
          <Link className={styles.successSecondary} href="/dealers">Back to Dealers</Link>
          <Link className={styles.successPrimary} href="/dealers#dealerForm">Contact a Manager</Link>
        </div>
      </div>
    </div>
  );
}
