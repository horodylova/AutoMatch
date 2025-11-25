"use client";
import { useState } from "react";
import QuizProgress from "../../components/QuizProgress";

export default function Page() {
  const [total, setTotal] = useState<number>(10);
  const [current, setCurrent] = useState<number>(0);
  return (
    <div style={{ padding: "clamp(88px, 12vw, 160px) clamp(16px, 4vw, 32px)", minHeight: "100vh", background: "var(--kendo-color-app-surface)", color: "var(--kendo-color-on-app-surface)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <QuizProgress current={current} total={total} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
          <button
            onClick={() => setCurrent(v => Math.min(total, v + 1))}
            style={{ padding: "8px 12px", borderRadius: 999, border: "1px solid rgba(230,214,180,0.25)", background: "var(--kendo-color-primary)", color: "var(--kendo-color-on-app-surface)", cursor: "pointer" }}
          >
            +1
          </button>
          <button
            onClick={() => { setCurrent(0); setTotal(10); }}
            style={{ padding: "8px 12px", borderRadius: 999, border: "1px solid rgba(230,214,180,0.25)", background: "var(--kendo-color-secondary)", color: "var(--kendo-color-on-app-surface)", cursor: "pointer" }}
          >
            Reset
          </button>
          <div style={{ fontSize: 14, color: "rgba(230,214,180,0.8)" }}>{current} / {total}</div>
        </div>
      </div>
    </div>
  );
}
