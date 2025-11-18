"use client";
import Link from 'next/link'
import { useEffect, useMemo, useState } from "react";
type Row = (string | number | boolean | null)[];


export default function Page() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    async function load() {
      const sheetId = process.env.NEXT_PUBLIC_SHEET_ID || process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "";
      const range = process.env.NEXT_PUBLIC_SHEET_RANGE || process.env.SHEET_NAME || "DATABASE";
      const key = `sheet:${sheetId}:${range}`;
      try {
        const cached = typeof window !== "undefined" ? window.sessionStorage.getItem(key) : null;
        if (cached) {
          const values = JSON.parse(cached) as Row[];
          const hdrs = (values[1] || []).map((v: unknown) => String(v ?? ""));
          setHeaders(hdrs);
          const body = values.slice(13);
          setRows(body);
          return;
        }
      } catch {}
      const res = await fetch(`/api/sheet-data?id=${encodeURIComponent(sheetId)}&range=${encodeURIComponent(range)}`);
      const data = await res.json();
      const values = (data?.data?.values || []) as Row[];
      try {
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(key, JSON.stringify(values));
        }
      } catch {}
      const hdrs = (values[1] || []).map((v: unknown) => String(v ?? ""));
      setHeaders(hdrs);
      const body = values.slice(13);
      setRows(body);
    }
    load();
  }, []);
  const idx = useMemo(() => {
    const out: Record<string, number> = {};
    headers.forEach((h, i) => { out[h.trim().toLowerCase()] = i; });
    return out;
  }, [headers]);
  const mkIdx = idx["make"] ?? -1;
  const mdIdx = idx["model"] ?? -1;
  const yrIdx = idx["year"] ?? -1;
  const trIdx = idx["trim"] ?? -1;
  const targets = useMemo(() => new Set([
    "bmw|3 series",
    "ford|f-150",
    "ford|f-150 lightning",
    "toyota|prius",
    "toyota|prius plug-in",
  ]), []);
  const filtered = useMemo(() => {
    return rows.filter(r => {
      const mk = String(r[mkIdx] ?? "").trim().toLowerCase();
      const md = String(r[mdIdx] ?? "").trim().toLowerCase();
      const yr = Number(r[yrIdx] ?? "");
      return yr === 2024 && targets.has(`${mk}|${md}`);
    });
  }, [rows, mkIdx, mdIdx, yrIdx, targets]);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h1>Sheets</h1>
        <Link href="/">
          <button style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#fff" }}>Go Home</button>
        </Link>
      </div>
      {filtered.length === 0 ? (
        <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>No data</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
          {filtered.map((row, i) => {
            const title = [String(row[mkIdx] ?? ""), String(row[mdIdx] ?? ""), String(row[yrIdx] ?? ""), String(row[trIdx] ?? "")]
              .map(v => v.trim())
              .filter(v => v.length > 0)
              .join(" ");
            return (
              <div key={i} style={{ border: "1px solid #ccc", borderRadius: 10, boxShadow: "0 2px 6px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <div style={{ padding: 14, background: "#f7f7f7", borderBottom: "1px solid #e5e5e5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{title || "Model"}</div>
                </div>
                <div style={{ padding: 14 }}>
                  <table style={{ borderCollapse: "collapse", width: "100%" }}>
                    <tbody>
                      {headers.map((h, j) => {
                        const val = row[j];
                        const text = String(val ?? "").trim();
                        if (!text) return null;
                        return (
                          <tr key={`${h}-${j}`}>
                            <td style={{ width: 280, borderBottom: "1px solid #eee", padding: 8, color: "#555" }}>{h}</td>
                            <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                              <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{text}</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
