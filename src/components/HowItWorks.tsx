'use client';
import styles from "./HowItWorks.module.css";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function HowItWorks() {
  const [src, setSrc] = useState<string>("/ContactFormImage.png");

  useEffect(() => {
    const el = document.documentElement;
    const apply = () => {
      const t = el.getAttribute("data-theme");
      setSrc(t === "light" ? "/car-light.jpg" : "/ContactFormImage.png");
    };
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  return (
    <section id="how-it-works" className={styles.section}>
      <div className={styles.inner}>
          <div className={styles.hero}>
            <h1 className={styles.heroTitle}>How It Works</h1>
            <p className={styles.heroSubtitle}>CarCupid reveals your driver profile through unexpected questions</p>
            <div className={styles.heroWords}>
              <span className={styles.heroWord}>visual</span>
              <span className={styles.heroComma}></span>
              <span className={styles.heroWord}>emotional</span>
              <span className={styles.heroComma}></span>
              <span className={styles.heroWord}>intuitive</span>
            </div>
          </div>
          <div className={styles.content}>
            <p className={styles.paragraph}>Trust your first impulse. There are no wrong answers.</p>
            <div className={styles.divider}></div>
            <p className={styles.paragraph}>Each response paints your portrait. Then our algorithm matches it against thousands of automotive personalities in our database.</p>
            <h3 className={styles.subtitle}>Prepare to Be Surprised</h3>
            <p className={styles.paragraph}>We check compatibility by spirit and feel — that intangible “click” when you know: this is it.</p>
            <p className={styles.paragraph}>Whether you’re seeking a luxury match, an electric vehicle, or simply the best car for you — your perfect match is waiting.</p>
            <div className={styles.callout}>Ready to discover your soulmate car? Let’s find it together</div>
          </div>
          <div className={styles.mediaFrame}>
            <div className={styles.media}>
              <Image src={src} alt="Car" fill className={styles.mediaImg} sizes="(max-width: 992px) 90vw, 720px" priority />
            </div>
          </div>
      </div>
    </section>
  );
}
