import Image from "next/image";
import { SvgIcon } from "@progress/kendo-react-common";
import { checkIcon } from "@progress/kendo-svg-icons";
import styles from "./AdviceBanner.module.css";

const points = [
  "Get a clear picture of what you truly need in a car — before you start shopping",
  "Avoid financial mistakes by matching with models that fit your budget and long-term goals",
  "Save hours of research and dealership visits with a personalized shortlist made just for you",
 
];

export default function AdviceBanner() {
  return (
    <section id="before-you-buy" className={styles.section}>
      <div className={styles.image}>
        <Image src="/banner.jpg" alt="Lifestyle" fill priority sizes="(max-width: 992px) 100vw, 90vw" className={styles.img} unoptimized />
        <div className={styles.imgFilter}></div>
        <div className={styles.overlay}>
          <h3 className={styles.title}>Make smarter, <br/>confident car decisions</h3>
          <div className={styles.list}>
            {points.map((t, i) => (
              <div key={i} className={styles.item}>
                <span className={styles.check}><SvgIcon icon={checkIcon} /></span>
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
              <span className={styles.check}><SvgIcon icon={checkIcon} /></span>
              <div className={styles.text}>{t}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
