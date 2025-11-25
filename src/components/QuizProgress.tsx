'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './QuizProgress.module.css';

type Props = { current: number; total: number };

export default function QuizProgress({ current, total }: Props) {
  const t = total > 0 ? total : 0;
  const c = Math.max(0, Math.min(current, t));
  const pct = t > 0 ? c / t : 0;
  const pathRef = useRef<SVGPathElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [progressD, setProgressD] = useState<string>("");
  const [carTransform, setCarTransform] = useState<string>('translate(0,0)');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [carScale, setCarScale] = useState<[number, number]>([1, 1]);
  const d = useMemo(() => {
    return 'M 16 80 C 160 60 280 92 420 72 S 640 60 784 80';
  }, []);
  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth <= 768);
      const svg = svgRef.current;
      if (svg) {
        const vbw = 800;
        const vbh = 120;
        const sx = (svg.clientWidth || vbw) / vbw;
        const sy = (svg.clientHeight || vbh) / vbh;
        const ix = sx !== 0 ? 1 / sx : 1;
        const iy = sy !== 0 ? 1 / sy : 1;
        setCarScale([ix, iy]);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
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
    const tx = p2.x - p.x;
    const ty = p2.y - p.y;
    const nx0 = -ty;
    const ny0 = tx;
    const nm = Math.hypot(nx0, ny0) || 1;
    let nx = nx0 / nm;
    let ny = ny0 / nm;
    if (ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    const lift = isMobile ? 32 : 28;
    const px = p.x + nx * lift;
    const pyRaw = p.y + ny * lift;
    const py = Math.min(pyRaw, p.y - lift);
    const angle = Math.atan2(ty, tx) * (180 / Math.PI);
    setCarTransform(`translate(${px}, ${py}) rotate(${angle})`);
  }, [pct, isMobile]);
  return (
    <div className={styles.wrap}>
      <svg ref={svgRef} className={styles.svg} viewBox="0 0 800 120" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <path ref={pathRef} d={d} className={styles.road} />
        {progressD && <path d={progressD} className={styles.progress} />}
        <g className={styles.car} transform={carTransform}>
          <g transform={`scale(${carScale[0]}, ${carScale[1]})`}>
            <image href="/cupid.png" x={-(isMobile ? 40 : 60)} y={-(isMobile ? 30 : 45)} width={isMobile ? 80 : 120} height={isMobile ? 60 : 90} preserveAspectRatio="xMidYMid meet" />
          </g>
        </g>
      </svg>
    </div>
  );
}
