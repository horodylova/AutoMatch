'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './QuizProgress.module.css';


type Props = { current: number; total: number; showIntro?: boolean; showHalfway?: boolean; showFinal?: boolean; introImageSrc?: string; onShowResults?: () => void };

export default function QuizProgress({ current, total, showIntro = false, showHalfway = false, showFinal = false, introImageSrc, onShowResults }: Props) {
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
    if (pRel <= eps || showIntro) {
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
  }, [pct, isMobile, showIntro]);

  if (showFinal) {
    return (
      <div className={styles.wrap}>
        <div className={styles.introWrap}>
          <div className={styles.introHead}>
            <div className={styles.introTitle}>Your Matches Are Ready</div>
          </div>
          <div className={styles.introContent} style={{ alignItems: 'start', gap: isMobile ? 16 : 18 }}>
            <div className={styles.introMedia} style={{ aspectRatio: isMobile ? '16/9' : '1/1', maxHeight: isMobile ? '200px' : 'none' }}>
              <Image src="/final.jpg" alt="Final Results" fill sizes="(max-width: 768px) 100vw, 50vw" className={styles.introImg} style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.introList}>
              <div className={styles.introItem} style={{ marginBottom: isMobile ? 16 : 32, padding: isMobile ? '12px 16px' : undefined }}>
                <span className={styles.introText} style={{ fontSize: isMobile ? 15 : 18, lineHeight: 1.5 }}>
                  {isMobile 
                    ? "We found cars that fit your vision. Chosen specifically for you."
                    : "We've analyzed your answers and found the cars that fit your vision. Some might surprise you. Some will feel exactly right."
                  }
                </span>
              </div>
              {!isMobile && (
                <div className={styles.introItem} style={{ marginBottom: 32 }}>
                  <span className={styles.introText} style={{ fontSize: 18, lineHeight: 1.5 }}>
                    We&apos;re connecting the dots between your answers — balancing what excites you, what you need daily, and what feels right. Your results aren&apos;t generic matches; they&apos;re vehicles chosen specifically for you, ranked by how well they fit your unique profile.
                  </span>
                </div>
              )}
              <button className={styles.introNext} style={{ width: '100%', marginTop: isMobile ? 0 : undefined }} onClick={() => {
                if (onShowResults) onShowResults();
              }}>
                See My Results
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <svg ref={svgRef} className={styles.svg} viewBox="0 0 800 120" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <defs>
          <filter id="innerGlowRoad" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feComposite in="blur" in2="SourceAlpha" operator="in" result="inner" />
            <feFlood floodColor="var(--road-glow-color, rgba(245,245,247,1))" floodOpacity="0.2" result="color">
              <animate attributeName="flood-opacity" values="0.12;0.28;0.12" dur="2.8s" repeatCount="indefinite" />
            </feFlood>
            <feComposite in="color" in2="inner" operator="in" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
          <filter id="innerGlowProgress" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feComposite in="blur" in2="SourceAlpha" operator="in" result="inner" />
            <feFlood floodColor="var(--progress-glow-color, rgba(229,72,63,1))" floodOpacity="0.35" result="color">
              <animate attributeName="flood-opacity" values="0.25;0.55;0.25" dur="2.2s" repeatCount="indefinite" />
            </feFlood>
            <feComposite in="color" in2="inner" operator="in" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>
        <mask id="roadMask">
          <path d={d} className={styles.maskRoadStroke} />
        </mask>
        {progressD && (
          <mask id="progressMask">
            <path d={progressD} className={styles.maskProgressStroke} />
          </mask>
        )}
        <path ref={pathRef} d={d} className={styles.road} filter="url(#innerGlowRoad)" />
        {progressD && <path d={progressD} className={styles.progress} filter="url(#innerGlowProgress)" />}
        <g mask="url(#roadMask)">
          <path d={d} className={styles.roadGlow} />
        </g>
        {progressD && (
          <g mask="url(#progressMask)">
            <path d={progressD} className={styles.progressGlow} />
          </g>
        )}
        <g className={styles.car} transform={carTransform}>
          <g transform={`scale(${carScale[0]}, ${carScale[1]})`}>
            <image className={styles.carImage} href="/logo%20for%20progress.bar.png" x={-(isMobile ? 40 : 60)} y={-(isMobile ? 30 : 45)} width={isMobile ? 80 : 120} height={isMobile ? 60 : 90} preserveAspectRatio="xMidYMid meet" />
          </g>
        </g>
      </svg>
      {showIntro && (
        <div className={styles.introWrap}>
          <div className={styles.introHead}>
            <div className={styles.introTitle}>Before We Begin</div>
            <div className={styles.introSubtitle}>A quick guide to your CarCupid Match Quiz</div>
          </div>
          <div className={styles.introContent} style={{ alignItems: 'start' }}>
            {!isMobile && (
              <div className={styles.introMedia}>
                <Image src={introImageSrc || "/before-you-begin.jpg"} alt="intro" fill sizes="(max-width: 768px) 100vw, 50vw" className={styles.introImg} style={{ objectFit: 'cover' }} />
              </div>
            )}
            <div className={styles.introList}>
              {isMobile ? (
                <>
                  <div className={styles.introItem}><span className={styles.introDot} /><span className={styles.introText}>25+ questions. Takes about 8 minutes.</span></div>
                  <div className={styles.introItem}><span className={styles.introDot} /><span className={styles.introText}>This isn’t a test — it’s a game.</span></div>
                  <div className={styles.introItem}><span className={styles.introDot} /><span className={styles.introText}>Follow your first instinct. No wrong answers—just choose what feels true.</span></div>
                  <div className={styles.introItem}><span className={styles.introDot} /><span className={styles.introText}>Pause anytime. Progress is saved for 24 hours.</span></div>
                  <div className={styles.introItem}><span className={styles.introDot} /><span className={styles.introText}>At the end, receive personalized match results.</span></div>
                </>
              ) : (
                <>
                  <div className={styles.introItem}><span className={styles.introDot} /><span className={styles.introText}>The CarCupid Match Quiz contains 25+ thoughtful questions and usually takes about 8 minutes to complete.</span></div>
                  <div className={styles.introItem}><span className={styles.introDot} /><span className={styles.introText}>This isn’t a test — it’s a game.</span></div>
                  <div className={styles.introItem}><span className={styles.introDot} /><span className={styles.introText}>Follow your first instinct. There are no right or wrong answers; just choose what feels true in the moment.</span></div>
                  <div className={styles.introItem}><span className={styles.introDot} /><span className={styles.introText}>You can pause at any time.</span></div>
                  <div className={styles.introItem}><span className={styles.introDot} /><span className={styles.introText}>Your progress will be saved for 24 hours, so you can return and continue whenever you’re ready.</span></div>
                  <div className={styles.introItem}><span className={styles.introDot} /><span className={styles.introText}>At the end, you’ll receive personalized match results you can share or email.</span></div>
                </>
              )}
            </div>
          </div>
          
        </div>
      )}
      {showHalfway && (
        <div className={styles.introWrap}>
          <div className={styles.introHead}>
            <div className={styles.introTitle}>You&apos;re Halfway There!</div>
          </div>
          <div className={styles.introContent} style={{ alignItems: 'start' }}>
            <div className={styles.introMedia}>
              <Image src="/middle.jpg" alt="halfway" fill sizes="(max-width: 768px) 100vw, 50vw" className={styles.introImg} style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.introList}>
              <div className={styles.introItem}>
                <span className={styles.introDot} />
                <span className={styles.introText}>Every answer you give helps us understand what truly matters to you. We&apos;re not just matching you with a car — we&apos;re finding the one that fits your rhythm, your roads, and your vision of the perfect drive.</span>
              </div>
              <div className={styles.introItem}>
                <span className={styles.introDot} />
                <span className={styles.introText}>The details matter. Keep going — your ideal match is taking shape.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
