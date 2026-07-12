import Link from "next/link";
import styles from "./DreamGarageListingBanner.module.css";

type Props = {
  href?: string;
};

export default function DreamGarageListingBanner({
  href = "/dream-garage",
}: Props) {
  return (
    <Link href={href} className={styles.banner} aria-label="Open Dream Garage">
      <div className={styles.rail} aria-hidden="true">
        <span className={styles.seg} data-tone="0" />
        <span className={styles.seg} data-tone="1" />
        <span className={styles.seg} data-tone="2" />
      </div>

      <div className={styles.copy}>
        <span className={styles.badge}>Dream Garage</span>
        <h3 className={styles.title}>Shopping for more than one?</h3>
        <div className={styles.sub}>
          Set a budget, give each slot a job, and we&apos;ll match a real car to every one.
        </div>
      </div>

      <span className={styles.cta}>
        Open Dream Garage
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 12h14M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}
