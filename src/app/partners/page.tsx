"use client";

import { useEffect } from "react";
import Image from "next/image";
import styles from "./partners.module.css";

export default function PartnersPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div className={styles.infoSection}>
          <div className={styles.headerRow}>
            <div className={styles.logoWrapper}>
              <Image 
                src="/cupids/Helmet%20and%20Keys.png"
                alt="CarCupid Partner Logo"
                fill
                className={styles.image}
                unoptimized
              />
            </div>
            
            <h1 className={styles.title}>Drive More Sales with CarCupid</h1>
          </div>
          <p className={styles.subtitle}>
            Connect your inventory with thousands of qualified buyers who are looking for their perfect match. 
            Our AI-driven matching algorithm ensures you get leads that convert.
          </p>

          <ul className={styles.featuresList}>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              High-intent buyer matching
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              Seamless inventory integration
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              Performance analytics dashboard
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              Dedicated partner support
            </li>
          </ul>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Partner Inquiry</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className={styles.formGroup}>
                <label htmlFor="company" className={styles.label}>Company / Dealership Name</label>
                <input type="text" id="company" className={styles.input} placeholder="e.g. Best Cars Ltd." />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contact" className={styles.label}>Contact Person</label>
                <input type="text" id="contact" className={styles.input} placeholder="Your Name" />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email Address</label>
                <input type="email" id="email" className={styles.input} placeholder="partner@example.com" />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.label}>Phone Number</label>
                <input type="tel" id="phone" className={styles.input} placeholder="+1 (555) 000-0000" />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>Message / Integration Needs</label>
                <textarea 
                  id="message" 
                  className={styles.textarea} 
                  placeholder="Tell us about your inventory size and current systems..."
                ></textarea>
              </div>

              <button type="submit" className={styles.submitButton}>
                Request Partnership Info
              </button>

              <p className={styles.disclaimer}>
                By submitting this form, you agree to our partner terms and privacy policy.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
