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
    if (sid) {
      const k = `confirm:${sid}`;
      const done = typeof window !== "undefined" ? window.sessionStorage.getItem(k) : null;
      if (!done) {
        fetch(`/api/payments/confirm?sid=${encodeURIComponent(sid)}`, { method: "POST" }).finally(() => {
          try {
            window.sessionStorage.setItem(k, "1");
          } catch {}
        });
      }
    }
    const updateLogo = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setLogoSrc(theme === "light" ? "/cropped logo.png" : "/logos/logo.svg");
    };
    updateLogo();
    const observer = new MutationObserver(updateLogo);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, [sid]);

  return (
    <div className={styles.successWrap}>
      <div className={styles.successCard}>
        <div className={styles.successLogo}>
          <Image src={logoSrc} alt="CarCupid" fill priority />
        </div>
        <div className={styles.successTitle}>Thank you</div>
        <div className={styles.successSubtitle}>Your order is confirmed. We sent a receipt and details to your email. If this is a subscription, you can contact a manager to cancel anytime.</div>
        <div className={styles.successActions}>
          <Link className={styles.successPrimary} href="/dealers">Back to Dealers</Link>
          <Link className={styles.successSecondary} href="/cars">Browse Cars</Link>
          <Link className={styles.successPrimary} href="/dealers#dealerForm">Contact a Manager</Link>
        </div>
        <div className={styles.successNote}>Please check your inbox. If you do not see the email, check the spam folder.</div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className={styles.successWrap}>
        <div className={styles.successCard}>
          <div className={styles.successTitle}>Thank you</div>
          <div className={styles.successSubtitle}>Your order is confirmed. We sent a receipt and details to your email.</div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
