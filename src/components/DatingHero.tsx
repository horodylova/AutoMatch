'use client';
import Image from 'next/image';
import Link from 'next/link';
import styles from './DatingHero.module.css';
import { trackQuizStart } from '@/lib/gtag';
import { event } from '@/lib/pixel';
import { useEffect, useState } from 'react';

const HERO_IMAGE_SRC = "/photos-cars/amir-riazipour-TeYK3zOIkUk-unsplash.jpg";

export default function DatingHero() {
  const [showHeroImage, setShowHeroImage] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 993px)");
    const update = () => setShowHeroImage(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <>
      <section className={styles.section}>
        <div className={styles.banner}>
          {showHeroImage && (
            <>
              <Image
                src={HERO_IMAGE_SRC}
                alt="car"
                fill
                className={styles.heroImg}
                priority
                fetchPriority="high"
                loading="eager"
                sizes="100vw"
              />
              <div className={styles.heroOverlay} />
            </>
          )}
          <div className={styles.introBox}>
            <h3 className={styles.introTitle}>CarCupid learns who you are</h3>
            <p className={styles.introText}>This isn’t a quick quiz. It’s a personality match built with depth, intuition, and real automotive intelligence</p>
            <Link href="/quiz" className={styles.introCta} onClick={() => {
              trackQuizStart();
              event("StartQuizBottom");
              event("StartQuiz");
            }}>Start Quiz</Link>
          </div>
        </div>
      </section>
      <section className={styles.introSection}>
        <div className={styles.container}>
          <div className={styles.lead}>
            <p className={styles.leadText}>Answer thoughtful, intuitive questions — our system builds your driver profile and matches you with cars that match your psychology, not just your specs</p>
          </div>
          <div className={styles.features}>
            <div className={styles.featureBox}>
              <div className={styles.featureHeader}>
                <div className={styles.featureIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M12 21s-7-4.438-7-9.5A4.5 4.5 0 0 1 9.5 7c1.5 0 2.5.75 2.5.75S13.5 7 15 7a4.5 4.5 0 0 1 4.5 4.5C19.5 16.562 12 21 12 21z" fill="var(--kendo-color-on-app-surface)"/>
                  </svg>
                </div>
                <h5 className={styles.featureTitle}>Human‑Centric</h5>
              </div>
              <p className={styles.featureDesc}>We begin with you — your instincts, routines, values.
CarCupid maps your emotional and lifestyle patterns to interpret what kind of car truly fits you</p>
            </div>
            <div className={styles.featureBox}>
              <div className={styles.featureHeader}>
                <div className={styles.featureIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="var(--kendo-color-on-app-surface)" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="5" stroke="var(--kendo-color-on-app-surface)" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="2" fill="var(--kendo-color-on-app-surface)"/>
                  </svg>
                </div>
                <h5 className={styles.featureTitle}>Smart Matching</h5>
              </div>
              <p className={styles.featureDesc}>Powered by behavioral psychology and verified automotive data,
              CarCupid identifies compatibility the way long-term relationship platforms do — but for cars</p>
            </div>
            <div className={styles.featureBox}>
              <div className={styles.featureHeader}>
                <div className={styles.featureIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="var(--kendo-color-on-app-surface)" strokeWidth="2"/>
                    <path d="M9.5 12.5l2 2 4-4" stroke="var(--kendo-color-on-app-surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h5 className={styles.featureTitle}>Clear Results</h5>
              </div>
              <p className={styles.featureDesc}>No noise. No overwhelm.
Just a curated shortlist of cars that mirror your personality, your energy, and your life</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
