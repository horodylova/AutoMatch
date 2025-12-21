'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@progress/kendo-react-buttons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import styles from './DatingHero.module.css';

const photos = [
  '/photos-cars/amir-riazipour-TeYK3zOIkUk-unsplash.jpg',
  '/photos-cars/christian-agbede-j0SfhblI3Bk-unsplash.jpg',
  '/photos-cars/cord-allman-me93lMC4ADY-unsplash.jpg',
  '/photos-cars/dhiva-krishna-YApS6TjKJ9c-unsplash.jpg',
  '/photos-cars/dylan-posso-nqsiVHA7HFY-unsplash.jpg',
  '/photos-cars/jake-blucker-tMzCrBkM99Y-unsplash.jpg',
  // '/photos-cars/mateusz-suski-D4UZJJbRjP4-unsplash.jpg',
  '/photos-cars/nima-sarram-GynDWODbLdA-unsplash.jpg',
  '/photos-cars/remy_loz-aFsb3W6FhAA-unsplash.jpg',
  // '/photos-cars/serjan-midili-Vf7bdzmsIJc-unsplash.jpg',
  // '/photos-cars/tyler-clemmensen-4gSavS9pe1s-unsplash.jpg'
];

export default function DatingHero() {
  const seq = [...photos, ...photos, ...photos];
  const router = useRouter();
  return (
    <>
      <section className={styles.section}>
        <div className={styles.banner}>
          <Swiper
            modules={[Autoplay]}
            loop={true}
            slidesPerView={"auto"}
            spaceBetween={12}
            speed={800}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            className={styles.swiper}
          >
            {seq.map((src, i) => (
              <SwiperSlide key={`${src}:${i}`} className={styles.slide}>
                <Image src={src} alt="car" fill className={styles.slideImg} priority={i < 4} sizes="(max-width: 992px) 80vw, 24vw" />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className={styles.introBox}>
            <h3 className={styles.introTitle}>CarCupid learns who you are</h3>
            <p className={styles.introText}>This isn’t a quick quiz. It’s a personality match built with depth, intuition, and real automotive intelligence</p>
            <Button themeColor="primary" fillMode="solid" size="large" className={styles.introCta} onClick={() => router.push('/quiz')}>Start Quiz</Button>
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
                    <circle cx="12" cy="12" r="9" stroke="var(--kendo-color-on-app-surface)" stroke-width="2"/>
                    <circle cx="12" cy="12" r="5" stroke="var(--kendo-color-on-app-surface)" stroke-width="2"/>
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
                    <circle cx="12" cy="12" r="9" stroke="var(--kendo-color-on-app-surface)" stroke-width="2"/>
                    <path d="M9.5 12.5l2 2 4-4" stroke="var(--kendo-color-on-app-surface)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
