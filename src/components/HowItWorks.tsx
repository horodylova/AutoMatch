'use client';
import styles from "./HowItWorks.module.css";
import Image from "next/image";
import { useEffect, useState } from "react";

export function HowItWorksOriginal() {
  const hidden = true;
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
    <section
      id="how-it-works"
      className={hidden ? `${styles.section} ${styles.hidden}` : styles.section}
      aria-hidden={hidden}
    >
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
          <p className={styles.paragraph}>We check compatibility by spirit and feel — that intangible &quot;click&quot; when you know: this is it.</p>
          <p className={styles.paragraph}>Whether you&apos;re seeking a luxury match, an electric vehicle, or simply the best car for you — your perfect match is waiting.</p>
          <div className={styles.callout}>Ready to discover your soulmate car? Let&apos;s find it together</div>
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

export default function HowItWorks() {
  return (
    <section id="k9cupid" className={styles.k9Section}>
      <div className={styles.k9Card}>
        <div className={styles.k9Content}>
          <div className={styles.k9BrandRow}>
            <Image
              src="/cupids/k9cupid-logo-final.png"
              alt="k9Cupid"
              width={80}
              height={80}
              className={styles.k9Logo}
            />
            <div className={styles.k9BrandText}>
              <span className={styles.k9Kicker}>Partner project</span>
              <div className={styles.k9BrandNameRow}>
                <span className={styles.k9BrandName}>k9Cupid</span>
                <span className={styles.k9Badge}>New</span>
              </div>
            </div>
          </div>

          <h2 className={styles.k9Headline}>
            Your next best friend<br />is waiting
          </h2>

          <p className={styles.k9Lead}>
            We built a quiz that goes beyond breed charts — unexpected questions,
            real behavioural insight, and a match that fits your life. Because
            choosing a dog deserves exactly the same care as choosing a car.
          </p>

          <div className={styles.k9Divider} />

          <div className={styles.k9Tags}>
            <span className={styles.k9Tag}>Breed quiz</span>
            <span className={styles.k9Tag}>300+ breeds</span>
            <span className={styles.k9Tag}>Adoption guides</span>
            <span className={styles.k9Tag}>Stories &amp; blog</span>
          </div>

          <div className={styles.k9Actions}>
            <a href="https://k9cupid.fit/quiz" target="_blank" rel="noopener noreferrer" className={styles.k9Primary}>
              Find my dog match
            </a>
            <a href="https://k9cupid.fit/" target="_blank" rel="noopener noreferrer" className={styles.k9Secondary}>
              Explore k9Cupid →
            </a>
          </div>

          <p className={styles.k9Footnote}>
            From the team behind CarCupid — matching people with what matters.
          </p>
        </div>
        <div className={styles.k9ImageCol}>
          <div className={styles.k9ImageInner}>
            <picture>
              <source media="(max-width: 768px)" srcSet="/K9%20mobile.jpg" />
              <Image
                src="/dog%20in%20the%20car.jpg"
                alt="Dog in a car"
                fill
                className={styles.k9Img}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 420px, 560px"
                priority
              />
            </picture>
            <div className={styles.k9ImgFade} />
          </div>
        </div>
      </div>
    </section>
  );
}
