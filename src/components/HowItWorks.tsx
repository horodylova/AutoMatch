import styles from "./HowItWorks.module.css";
import Image from "next/image";
import k9Image from "../../public/dog in the car.jpg";

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
            Found your perfect car?<br />Now find your perfect dog
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
            <Image
              src={k9Image}
              alt="Dog in a car"
              fill
              className={styles.k9Img}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 420px, 560px"
              placeholder="blur"
            />
            <div className={styles.k9ImgFade} />
          </div>
        </div>
      </div>
    </section>
  );
}
