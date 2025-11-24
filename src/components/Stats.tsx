'use client';
import styles from "./Stats.module.css";
import { useState, type MouseEvent } from "react";

type Segment = { label: string; detail: string; percent: number; color: string; offset: number };

export default function Stats() {
  const r = 70;
  const c = 2 * Math.PI * r;
  const data: Segment[] = [
    { label: "Sedans", detail: "", percent: 40, color: "#C9472D", offset: 0 },
    { label: "SUVs / Crossovers", detail: "", percent: 28, color: "rgba(230, 214, 180, 0.75)", offset: 0 },
    { label: "Pickup Trucks", detail: "", percent: 12, color: "rgba(230, 214, 180, 0.55)", offset: 0 },
    { label: "Coupes / Performance", detail: "", percent: 10, color: "rgba(230, 214, 180, 0.35)", offset: 0 },
    { label: "Hatchbacks / Compacts", detail: "", percent: 10, color: "rgba(230, 214, 180, 0.2)", offset: 0 },
  ];
  const [hover, setHover] = useState<Segment | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [active, setActive] = useState<Record<string, boolean>>(() => Object.fromEntries(data.map(d => [d.label, true])) as Record<string, boolean>);
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
              {data.map((d) => (
                <div
                  key={d.label}
                  className={`${styles.legendItem} ${!active[d.label] ? styles.legendItemDisabled : ""}`}
                  onClick={() => setActive(prev => ({ ...prev, [d.label]: !prev[d.label] }))}
                >
                  <span className={styles.legendSwatch} style={{ background: d.color }}></span>
                  <span>{`${d.percent}% — ${d.label}`}</span>
                </div>
              ))}
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