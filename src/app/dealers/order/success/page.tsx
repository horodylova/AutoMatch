"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "../../dealers.module.css";

function SuccessContent() {
  const params = useSearchParams();
  const sid = params.get("sid") || "";
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
        <div className={styles.successTitle}>Payment Successful</div>
        <div className={styles.successSubtitle}>Thank you. Your payment was processed successfully.</div>
        {sid && <div className={styles.sessionBox}>Checkout Session ID: {sid}</div>}
        <div className={styles.successActions}>
          <Link className={styles.successPrimary} href="/dealers">Back to Dealers</Link>
          <Link className={styles.successSecondary} href="/cars">Browse Cars</Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className={styles.successWrap}>
        <div className={styles.successCard}>
          <div className={styles.successTitle}>Payment Successful</div>
          <div className={styles.successSubtitle}>Thank you. Your payment was processed successfully.</div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
