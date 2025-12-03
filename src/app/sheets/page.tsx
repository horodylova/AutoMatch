"use client";
import Link from 'next/link'
import { useEffect, useState } from "react";
type Cell = string | number | boolean | null;
type Values = Cell[][];


export default function Page() {
  const [headers, setHeaders] = useState<string[]>([]);
  useEffect(() => {
    async function load() {
      const sheetId = process.env.NEXT_PUBLIC_SHEET_ID || process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "";
      const range = process.env.NEXT_PUBLIC_SHEET_RANGE || process.env.SHEET_NAME || "DATABASE";
      const key = `sheet:${sheetId}:${range}`;
      try {
        const cached = typeof window !== "undefined" ? window.sessionStorage.getItem(key) : null;
        if (cached) {
          const values = JSON.parse(cached) as Values;
          const hdrs = (values[1] || []).map((v: Cell) => String(v ?? "").trim()).filter(h => h.length > 0);
          setHeaders(hdrs);
          return;
        }
      } catch {}
      const res = await fetch(`/api/sheet-data?id=${encodeURIComponent(sheetId)}&range=${encodeURIComponent(range)}`);
      const data = await res.json();
      const values = (data?.data?.values || []) as Values;
      try {
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(key, JSON.stringify(values));
        }
      } catch {}
      const hdrs = (values[1] || []).map((v: Cell) => String(v ?? "").trim()).filter(h => h.length > 0);
      setHeaders(hdrs);
    }
    load();
  }, []);
  return (
    <div style={{ padding: "clamp(88px, 12vw, 160px) clamp(16px, 4vw, 32px)", background: "var(--kendo-color-app-surface)", color: "var(--kendo-color-on-app-surface)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: "clamp(22px, 3.2vw, 28px)", fontWeight: 800, letterSpacing: "0.4px" }}>Sheet preview</h1>
        <Link href="/">
          <button style={{ padding: "8px 12px", borderRadius: 999, border: "1px solid rgba(230,214,180,0.25)", background: "var(--kendo-color-primary)", color: "var(--kendo-color-on-app-surface)" }}>Go Home</button>
        </Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        <div style={{ border: "1px solid rgba(230,214,180,0.18)", borderRadius: 12, boxShadow: "0 6px 24px rgba(0,0,0,0.35)", overflow: "hidden", background: "var(--kendo-color-surface)" }}>
          <div style={{ padding: 14, background: "rgba(230,214,180,0.06)", borderBottom: "1px solid rgba(230,214,180,0.15)" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--kendo-color-on-app-surface)" }}>Columns</div>
          </div>
          <div style={{ padding: 14 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {headers.map((h) => (
                <span key={h} style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid var(--kendo-color-border)", background: "var(--kendo-color-tertiary-subtle)", color: "var(--kendo-color-on-tertiary)", fontSize: 14 }}>{h}</span>
              ))}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
