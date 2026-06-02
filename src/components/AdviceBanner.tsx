"use client";

import Image from "next/image";
import styles from "./AdviceBanner.module.css";
import bannerImage from "../../public/optimized/banner.webp";

const points = [
  "Get a clear picture of what you truly need in a car — before you start shopping",
  "Avoid financial mistakes by matching with models that fit your budget and long-term goals",
  "Save hours of research and dealership visits with a personalized shortlist made just for you",
 
];

export default function AdviceBanner() {
  return (
    <section id="before-you-buy" className={styles.section}>
      <div className={styles.image}>
        <Image src={bannerImage} alt="Lifestyle" fill sizes="(max-width: 992px) 100vw, 90vw" className={styles.img} placeholder="blur" quality={70} />
        <div className={styles.imgFilter}></div>
        <div className={styles.overlay}>
          <h3 className={styles.title}>Make smarter, <br/>confident car decisions</h3>
          <div className={styles.list}>
            {points.map((t, i) => (
              <div key={i} className={styles.item}>
                <span className={styles.check}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div className={styles.text}>{t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.overlayMobile}>
        <h3 className={styles.title}>Make smarter, <br/>confident car decisions</h3>
        <div className={styles.list}>
          {points.map((t, i) => (
            <div key={i} className={styles.item}>
              <span className={styles.check}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div className={styles.text}>{t}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
