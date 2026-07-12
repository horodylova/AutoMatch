import Link from "next/link";
import styles from "./DreamGarageJournalBanner.module.css";

type Props = {
  href?: string;
};

export default function DreamGarageJournalBanner({ href = "/dream-garage" }: Props) {
  return (
    <Link href={href} className={styles.banner}>
      <div className={styles.copy}>
        <span className={styles.badge}>Try the tool · Dream Garage</span>
        <h3 className={styles.title}>Reading about car costs? Plan the whole spend first.</h3>
        <p className={styles.sub}>
          Set a budget, build a garage, and see the real cars that fit — before you ever
          talk to a dealer.
        </p>
        <span className={styles.cta}>
          Build your garage
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      <div className={styles.figure} aria-hidden="true">
        <div className={styles.figHead}>
          <span>Budget</span>
          <strong>$60,000</strong>
        </div>
        <div className={styles.rail}>
          <span className={styles.seg} data-tone="0" />
          <span className={styles.seg} data-tone="1" />
        </div>
        <div className={styles.figTags}>
          <span className={styles.tag}><i data-tone="0" />Daily</span>
          <span className={styles.tag}><i data-tone="1" />Explorer</span>
        </div>
      </div>
    </Link>
  );
}
