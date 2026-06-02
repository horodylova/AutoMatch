"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter, FaYoutube, FaThreads } from "react-icons/fa6";
import styles from "./Footer.module.css";
import { event } from "@/lib/pixel";
import { trackQuizStart } from "@/lib/gtag";

type ConsentChoice = "accepted" | "rejected";

export default function Footer() {
  const pathname = usePathname();
  const [consentChoice, setConsentChoice] = useState<ConsentChoice | null>(null);
  const [gpcEnabled, setGpcEnabled] = useState(false);

  const logoSrc = "/optimized/cropped-logo.webp";

  useEffect(() => {
    const gpc = typeof navigator !== "undefined" && (navigator as unknown as { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
    setGpcEnabled(gpc);

    const syncConsent = () => {
      try {
        const raw = window.localStorage.getItem("cc_consent_v1");
        if (raw === "accepted" || raw === "rejected") {
          setConsentChoice(raw);
        } else {
          setConsentChoice(null);
        }
      } catch {
        setConsentChoice(null);
      }
    };

    syncConsent();
    window.addEventListener("cc_consent_changed", syncConsent);
    window.addEventListener("storage", syncConsent);
    return () => {
      window.removeEventListener("cc_consent_changed", syncConsent);
      window.removeEventListener("storage", syncConsent);
    };
  }, []);

  if (pathname?.startsWith("/quiz")) return null;

  const year = new Date().getFullYear();

  const setConsent = (next: ConsentChoice) => {
    try {
      window.localStorage.setItem("cc_consent_v1", next);
    } catch {
    }
    try {
      window.dispatchEvent(new Event("cc_consent_changed"));
    } catch {
    }
    setConsentChoice(next);
  };

  const trackingEnabled = consentChoice === "accepted" && !gpcEnabled;

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.column}>
          <div className={styles.brandRow}>
            <Link href="/" className={styles.brandLogo}>
              <div className={styles.logoBox}>
                <Image
                  src={logoSrc}
                  alt="CarCupid"
                  fill
                  className={styles.logoImg}
                  sizes="90px"
                  quality={70}
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

        <div className={styles.column}>
          <div className={styles.navTitle}>Discover</div>
          <Link href="/quiz" className={styles.navLink} onClick={() => {
            trackQuizStart();
            event("StartQuiz");
          }}>Take the Quiz</Link>
          <Link href="/cars" className={styles.navLink}>Browse Cars</Link>
          <Link href="/compare" className={styles.navLink}>Compare</Link>
          <Link href="/journal" className={styles.navLink}>Journal</Link>
        </div>

        <div className={styles.column}>
          <div className={styles.navTitle}>Partners</div>
          <Link href="/dealers" className={styles.navLink}>For Dealers</Link>
        </div>

        <div className={styles.column}>
          <div className={styles.navTitle}>Legal</div>
          <Link href="/terms" className={styles.navLink}>Terms of Service</Link>
          <Link href="/privacy" className={styles.navLink}>Privacy Policy</Link>
          <div className={styles.doNotSell}>
            <Link href="/privacy#do-not-sell-or-share" className={styles.navLink} id="do-not-sell-or-share">
              Do Not Sell or Share My Personal Information
            </Link>
            <div className={styles.toggle} role="group" aria-label="Non-essential tracking">
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setConsent("rejected")}
                aria-pressed={!trackingEnabled}
              >
                Disable
              </button>
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => {
                  if (gpcEnabled) return;
                  setConsent("accepted");
                }}
                aria-pressed={trackingEnabled}
                disabled={gpcEnabled}
              >
                Enable
              </button>
            </div>
            {gpcEnabled && <div className={styles.toggleNote}>GPC enabled</div>}
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.bottom}>
        <span>&copy; {year} CarCupid. All rights reserved.</span>
      </div>
    </footer>
  );
}
