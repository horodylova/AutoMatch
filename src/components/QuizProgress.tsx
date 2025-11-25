'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './QuizProgress.module.css';

type Props = { current: number; total: number };

export default function QuizProgress({ current, total }: Props) {
  const t = total > 0 ? total : 0;
  const c = Math.max(0, Math.min(current, t));
  const pct = t > 0 ? c / t : 0;
  const pathRef = useRef<SVGPathElement | null>(null);
  const [progressD, setProgressD] = useState<string>("");
  const [carTransform, setCarTransform] = useState<string>('translate(0,0)');
  const d = useMemo(() => {
    return 'M 16 80 C 160 60 280 92 420 72 S 640 60 784 80';
  }, []);
  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    const eps = 0.0001;
    const pRel = Math.max(0, Math.min(1, pct));
    const prog = pRel * len;
    if (pRel <= eps) {
      setProgressD("");
    } else {
      const N = 120;
      const pts: string[] = [];
      for (let i = 0; i <= N; i++) {
        const l = (prog * i) / N;
        const pt = el.getPointAtLength(Math.min(len - eps, l));
        pts.push(`${pt.x} ${pt.y}`);
      }
      setProgressD(`M ${pts[0]} L ${pts.slice(1).join(" ")}`);
    }
    const p = el.getPointAtLength(Math.min(len - eps, prog));
    const p2 = el.getPointAtLength(Math.min(len - eps, prog + 1));
    const angle = Math.atan2(p2.y - p.y, p2.x - p.x) * (180 / Math.PI);
    const lift = typeof window !== 'undefined' && window.innerWidth <= 768 ? 24 : 28;
    setCarTransform(`translate(${p.x}, ${p.y - lift}) rotate(${angle})`);
  }, [pct]);
  return (
    <div className={styles.wrap}>
      <svg className={styles.svg} viewBox="0 0 800 120" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <path ref={pathRef} d={d} className={styles.road} />
        {progressD && <path d={progressD} className={styles.progress} />}
        <g className={styles.car} transform={carTransform}>
          <image href="/cupid.png" x={-60} y={-45} width={120} height={90} />
        </g>
      </svg>
    </div>
  );
}
