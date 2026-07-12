import Link from "next/link";
import styles from "./DreamGarageSpotlight.module.css";

type Props = {
  href?: string;
};

const BAYS = [
  { label: "Daily Driver", tone: "0", width: "34%" },
  { label: "Family Hauler", tone: "1", width: "38%" },
  { label: "Weekend Thrill", tone: "2", width: "28%" },
] as const;

export default function DreamGarageSpotlight({
  href = "/dream-garage",
}: Props) {
  return (
    <section className={styles.band} aria-labelledby="dg-spotlight-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>New · Dream Garage</span>
          <h2 id="dg-spotlight-title" className={styles.title}>
            Don&apos;t pick one car. Build the <em>whole garage</em>.
          </h2>
          <p className={styles.text}>
            Set one budget, give each bay a job — daily, hauler, weekend toy — and we&apos;ll
            park a real car from our inventory in every slot.
          </p>
          <Link href={href} className={styles.cta}>
            Build your garage
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        <div className={styles.preview} aria-hidden="true">
          <div className={styles.previewHead}>
            <span className={styles.previewLabel}>Your budget</span>
            <span className={styles.previewValue}>$200,000</span>
          </div>
          <div className={styles.rail}>
            {BAYS.map((bay) => (
              <span
                key={bay.label}
                className={styles.seg}
                data-tone={bay.tone}
                style={{ width: bay.width }}
              />
            ))}
          </div>
          <div className={styles.tags}>
            {BAYS.map((bay) => (
              <span key={bay.label} className={styles.tag}>
                <i className={styles.dot} data-tone={bay.tone} />
                {bay.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
