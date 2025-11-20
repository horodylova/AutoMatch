'use client';
import styles from "./Stats.module.css";
import { useState, type MouseEvent } from "react";

type Segment = { label: string; detail: string; percent: number; color: string; offset: number };

export default function Stats() {
  const r = 70;
  const c = 2 * Math.PI * r;
  const seg1 = 28;
  const seg2 = 55;
  const seg3 = 17;
  const l1 = (c * seg1) / 100;
  const l2 = (c * seg2) / 100;
  const l3 = (c * seg3) / 100;
  const data: Segment[] = [
    { label: "BEV", detail: "Battery Electric Vehicles", percent: seg1, color: "#C9472D", offset: 0 },
    { label: "PHEV", detail: "Plug-in Hybrid Electric Vehicles", percent: seg2, color: "rgba(230, 214, 180, 0.65)", offset: -l1 },
    { label: "HEV", detail: "Hybrid Electric Vehicles", percent: seg3, color: "rgba(230, 214, 180, 0.4)", offset: -(l1 + l2) },
  ];
  const [hover, setHover] = useState<Segment | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [active, setActive] = useState<Record<string, boolean>>({ BEV: true, PHEV: true, HEV: true });
  const visible = data.filter(d => active[d.label]);
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <h2 className={styles.title}>Designed for Humans, Backed by Intelligence</h2>
          <p className={styles.subtitle}>Our system blends behavioral psychology with real automotive data to pinpoint the cars that feel right — not just look good on paper</p>
        </div>
        <div className={styles.grid}>
          <div>
            <div className={styles.donut}
              onMouseMove={(e: MouseEvent<HTMLDivElement>) => {
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
            >
              <svg width={180} height={180} viewBox="0 0 180 180">
                <circle cx={90} cy={90} r={r} fill="none" stroke="rgba(230, 214, 180, 0.2)" strokeWidth={22} />
                {(() => {
                  let accum = 0;
                  return visible.map((d) => {
                    const len = (c * d.percent) / 100;
                    const el = (
                      <circle
                        key={d.label}
                        cx={90}
                        cy={90}
                        r={r}
                        fill="none"
                        stroke={d.color}
                        strokeWidth={22}
                        strokeDasharray={`${len} ${c - len}`}
                        strokeDashoffset={-accum}
                        transform="rotate(-90 90 90)"
                        onMouseEnter={() => setHover(d)}
                        onMouseLeave={() => setHover(null)}
                      />
                    );
                    accum += len;
                    return el;
                  });
                })()}
              </svg>
              {hover && (
                <div className={styles.tooltip} style={{ left: pos.x, top: pos.y }}>
                  <span className={styles.tooltipTitle}>{hover.percent}%</span>
                  <span className={styles.tooltipValue}>{hover.label}</span>
                </div>
              )}
            </div>
            <div className={styles.legend}>
              <div className={`${styles.legendItem} ${!active.BEV ? styles.legendItemDisabled : ""}`} onClick={() => setActive(prev => ({ ...prev, BEV: !prev.BEV }))}><span className={styles.legendSwatch} style={{ background: "#C9472D" }}></span><span>BEV (Battery Electric Vehicles)</span></div>
              <div className={`${styles.legendItem} ${!active.PHEV ? styles.legendItemDisabled : ""}`} onClick={() => setActive(prev => ({ ...prev, PHEV: !prev.PHEV }))}><span className={styles.legendSwatch} style={{ background: "rgba(230, 214, 180, 0.65)" }}></span><span>PHEV (Plug-in Hybrid Electric Vehicles)</span></div>
              <div className={`${styles.legendItem} ${!active.HEV ? styles.legendItemDisabled : ""}`} onClick={() => setActive(prev => ({ ...prev, HEV: !prev.HEV }))}><span className={styles.legendSwatch} style={{ background: "rgba(230, 214, 180, 0.4)" }}></span><span>HEV (Hybrid Electric Vehicles)</span></div>
            </div>
          </div>
          <div className={styles.metric}>
            <div className={styles.metricValue}>9,633</div>
            <div className={styles.metricLabel}>unique US trims</div>
          </div>
          <div className={styles.metric}>
            <div className={styles.metricValue}>1,359</div>
            <div className={styles.metricLabel}>individual model years covered</div>
          </div>
          <div className={styles.metric}>
            <div className={styles.metricValue}>25%</div>
            <div className={styles.metricLabel}>electrified trims</div>
          </div>
          <div className={styles.timeline}>
            <div className={styles.line}>
              <div className={styles.highlight} style={{ left: "33.333%", width: "50%" }}></div>
              <div className={styles.markerBold} style={{ left: "83.333%" }}></div>
            </div>
            <div className={styles.ticks}>
              {[2021, 2022, 2023, 2024, 2025, 2026, 2027].map((y) => (
                <div key={y} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div className={styles.tick}></div>
                  <div className={styles.label}>{y}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}