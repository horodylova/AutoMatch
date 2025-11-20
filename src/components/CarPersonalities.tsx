import Image from "next/image";
import styles from "./CarPersonalities.module.css";

const logos = [
  "/aston-martin-logo_svgstack_com_33101763636523.svg",
  "/bentley-logo_svgstack_com_33111763636429.svg",
  "/black-white-bmw-logo_svgstack_com_33121763636423.svg",
  "/chevrolet-logo_svgstack_com_33181763636482.svg",
  "/ferrari-logo_svgstack_com_33231763636518.svg",
  "/ford-logo_svgstack_com_33271763636499.svg",
  "/free-jeep-logo_svgstack_com_33331763636514.svg",
  "/black-white-honda-logo_svgstack_com_33291763636567.svg",
  "/hyundai-logo_svgstack_com_33301763636549.svg",
  "/lamborghini-logo_svgstack_com_33351763636460.svg",
  "/land-rover-logo_svgstack_com_33381763636507.svg",
  "/lexus-logo_svgstack_com_33391763636445.svg",
  "/mazda-logo_svgstack_com_33431763636466.svg",
  "/mercedes-benz-logo_svgstack_com_33461763636479.svg",
  "/mitsubishi-logo_svgstack_com_33481763636556.svg",
  "/nissan-logo_svgstack_com_33491763636493.svg",
  "/peugeot-logo_svgstack_com_33511763636560.svg",
  "/porsche-logo_svgstack_com_33531763636485.svg",
  "/rolls-royce-logo_svgstack_com_33551763636471.svg",
  "/subaru-logo_svgstack_com_33581763636490.svg",
  "/free-tesla-logo_svgstack_com_33611763636436.svg",
  "/toyota-logo_svgstack_com_33671763636476.svg",
  "/volvo-logo-icon_svgstack_com_33701763636552.svg",
];

function Row({ logos }: { logos: string[] }) {
  const sequence = [...logos, ...logos, ...logos, ...logos];
  return (
    <div className={styles.track}>
      {sequence.map((src, i) => (
        <div key={`${src}:${i}`} className={styles.logoWrap}>
          <Image src={src} alt="brand" width={160} height={56} className={styles.logoImg} />
        </div>
      ))}
    </div>
  );
}

export default function CarPersonalities() {
  return (
    <section id="car-personalities" className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>Car Personalities</h2>
        <p className={styles.subtitle}>Trusted by enthusiasts and premium brands</p>
      </div>
      <div className={styles.tracks}>
        <div className={`${styles.row} ${styles.animateScroll}`}>
          <Row logos={logos} />
        </div>
      </div>
    </section>
  );
}