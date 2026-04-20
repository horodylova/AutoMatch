"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/components/admin/admin.module.css";
import a from "@/components/admin/quizAnalytics.module.css";

type Dist = { key: string; label: string; count: number; pct: number };
type Payload = {
  start?: string;
  end?: string;
  totalAnswers: number;
  questions: Array<{ id: string; title: string; options: Dist[] }>;
};

function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function BarRow({ label, count, pct }: { label: string; count: number; pct: number }) {
  return (
    <div className={a.row}>
      <div className={a.rowLabel}>{label}</div>
      <div className={a.barWrap} aria-label={`${label}: ${count} (${Math.round(pct * 100)}%)`}>
        <div className={a.bar} style={{ width: `${Math.max(0, Math.min(1, pct)) * 100}%` }} />
      </div>
      <div className={a.rowValue}>{count.toLocaleString()} • {Math.round(pct * 100)}%</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const today = useMemo(() => new Date(), []);
  const [start, setStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return toISODate(d);
  });
  const [end, setEnd] = useState(() => toISODate(today));
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const load = async (s: string, e: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/analytics/quiz-part1?start=${encodeURIComponent(s)}&end=${encodeURIComponent(e)}`, { cache: "no-store" });
      const j = (await res.json()) as Payload & { error?: string };
      if (!res.ok) {
        throw new Error(j.error || "Failed to load analytics");
      }
      setData(j);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(start, end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.subtitle}>Quiz Part 1 (Essentials)</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={a.filters}>
          <div className={a.filterGroup}>
            <div className={a.filterLabel}>Start date</div>
            <input className={styles.input} type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className={a.filterGroup}>
            <div className={a.filterLabel}>End date</div>
            <input className={styles.input} type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => load(start, end)}
            disabled={loading}
            type="button"
          >
            Apply
          </button>
        </div>

        {error ? (
          <div className={a.note}>{error}</div>
        ) : loading ? (
          <div className={a.note}>Loading…</div>
        ) : data ? (
          <div className={a.summary}>
            <div className={a.summaryItem}>
              <div className={a.summaryLabel}>Total answers</div>
              <div className={a.summaryValue}>{data.totalAnswers.toLocaleString()}</div>
            </div>
            <div className={a.summaryItem}>
              <div className={a.summaryLabel}>Range</div>
              <div className={a.summaryValue}>{start} → {end}</div>
            </div>
          </div>
        ) : (
          <div className={a.note}>No data</div>
        )}
      </div>

      {data?.questions?.map((q) => (
        <div className={styles.card} key={q.id}>
          <div className={a.cardTitle}>{q.title}</div>
          <div className={a.cardBody}>
            {q.options.map((o) => (
              <BarRow key={o.key} label={o.label} count={o.count} pct={o.pct} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

