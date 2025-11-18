"use client";
import { useEffect, useMemo, useState, useCallback } from "react";

type Row = (string | number | boolean | null)[];

function num(x: unknown): number {
  if (x == null) return 0;
  const s = String(x).trim();
  if (!s) return 0;
  const m = s.replace(/[$,]/g, "");
  const parts = m.match(/(-?\d+(?:\.\d+)?)/g);
  if (!parts) return 0;
  const n = Number(parts[parts.length - 1]);
  if (Number.isFinite(n)) return n;
  return 0;
}

function parseCityHighway(s: string): number | null {
  const m = s.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const a = Number(m[1]);
  const b = Number(m[2]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return (a + b) / 2;
}

function clamp01(x: number): number {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

function norm(v: number, min: number, max: number): number {
  if (!Number.isFinite(v) || !Number.isFinite(min) || !Number.isFinite(max)) return 0;
  if (max <= min) return 0;
  return clamp01((v - min) / (max - min));
}

export default function Home() {
  const [rows, setRows] = useState<Row[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [weights, setWeights] = useState<{ Family: number; Sport: number; Economy: number; Premium: number; Utility: number; TechEco: number }>({ Family: 0.4, Economy: 0.3, TechEco: 0.3, Sport: 0, Premium: 0, Utility: 0 });

  useEffect(() => {
    async function load() {
      const sheetId = process.env.NEXT_PUBLIC_SHEET_ID || process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "";
      const range = process.env.NEXT_PUBLIC_SHEET_RANGE || process.env.SHEET_NAME || "DATABASE";
      const key = `sheet:${sheetId}:${range}`;
      try {
        const cached = typeof window !== "undefined" ? window.sessionStorage.getItem(key) : null;
        if (cached) {
          const values = JSON.parse(cached) as Row[];
          const hdrs = (values[1] || []).map(v => String(v ?? ""));
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
      const hdrs = (values[1] || []).map(v => String(v ?? ""));
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

  const targets = useMemo(() => new Set(["bmw|3 series", "ford|f-150", "ford|f-150 lightning", "toyota|prius", "toyota|prius plug-in"]), []);

  const filtered = useMemo(() => {
    const mkIdx = idx["make"] ?? -1;
    const mdIdx = idx["model"] ?? -1;
    const yrIdx = idx["year"] ?? -1;
    return rows.filter(r => {
      const mk = String(r[mkIdx] ?? "").trim().toLowerCase();
      const md = String(r[mdIdx] ?? "").trim().toLowerCase();
      const yr = Number(r[yrIdx] ?? "");
      return yr === 2024 && targets.has(`${mk}|${md}`);
    });
  }, [rows, idx, targets]);

  const stats = useMemo(() => {
    const hpIdx = idx["horsepower (hp)"] ?? -1;
    const msrpIdx = idx["base msrp"] ?? -1;
    const cargoIdx = idx["cargo capacity (cu ft)"] ?? -1;
    const towIdx = idx["maximum towing capacity (lbs)"] ?? -1;
    const lenIdx = idx["length (in)"] ?? -1;
    const wbIdx = idx["wheelbase (in)"] ?? -1;
    const mpgCombinedIdx = idx["epa combined mpg"] ?? -1;
    const mpgCityHighwayIdx = idx["epa city/highway mpg"] ?? -1;
    let hpMin = Infinity, hpMax = -Infinity;
    let msrpMin = Infinity, msrpMax = -Infinity;
    let cargoMin = Infinity, cargoMax = -Infinity;
    let towMin = Infinity, towMax = -Infinity;
    let lenMin = Infinity, lenMax = -Infinity;
    let wbMin = Infinity, wbMax = -Infinity;
    let mpgMin = Infinity, mpgMax = -Infinity;
    for (const r of rows) {
      const hp = num(r[hpIdx]);
      const msrp = num(r[msrpIdx]);
      const cargo = num(r[cargoIdx]);
      const tow = num(r[towIdx]);
      const len = num(r[lenIdx]);
      const wb = num(r[wbIdx]);
      let mpg: number = num(r[mpgCombinedIdx]);
      if (!mpg && typeof r[mpgCityHighwayIdx] !== "undefined") {
        const m = parseCityHighway(String(r[mpgCityHighwayIdx] ?? ""));
        mpg = m ?? 0;
      }
      if (hp) { hpMin = Math.min(hpMin, hp); hpMax = Math.max(hpMax, hp); }
      if (msrp) { msrpMin = Math.min(msrpMin, msrp); msrpMax = Math.max(msrpMax, msrp); }
      if (cargo) { cargoMin = Math.min(cargoMin, cargo); cargoMax = Math.max(cargoMax, cargo); }
      if (tow) { towMin = Math.min(towMin, tow); towMax = Math.max(towMax, tow); }
      if (len) { lenMin = Math.min(lenMin, len); lenMax = Math.max(lenMax, len); }
      if (wb) { wbMin = Math.min(wbMin, wb); wbMax = Math.max(wbMax, wb); }
      if (mpg) { mpgMin = Math.min(mpgMin, mpg); mpgMax = Math.max(mpgMax, mpg); }
    }
    return { hpMin, hpMax, msrpMin, msrpMax, cargoMin, cargoMax, towMin, towMax, lenMin, lenMax, wbMin, wbMax, mpgMin, mpgMax };
  }, [rows, idx]);

  const scoreRow = useCallback((r: Row) => {
    const mkIdx = idx["make"] ?? -1;
    const mdIdx = idx["model"] ?? -1;
    const yrIdx = idx["year"] ?? -1;
    const trimIdx = idx["trim"] ?? -1;
    const bodyIdx = idx["body type"] ?? -1;
    const fuelIdx = idx["fuel type"] ?? -1;
    const hpIdx = idx["horsepower (hp)"] ?? -1;
    const msrpIdx = idx["base msrp"] ?? -1;
    const driveIdx = idx["drive type"] ?? -1;
    const doorsIdx = idx["doors"] ?? -1;
    const seatsIdx = idx["total seating"] ?? -1;
    const cargoIdx = idx["cargo capacity (cu ft)"] ?? -1;
    const towIdx = idx["maximum towing capacity (lbs)"] ?? -1;
    const lenIdx = idx["length (in)"] ?? -1;
    const wbIdx = idx["wheelbase (in)"] ?? -1;
    const mpgCombinedIdx = idx["epa combined mpg"] ?? -1;
    const mpgCityHighwayIdx = idx["epa city/highway mpg"] ?? -1;
    const transIdx = idx["transmission"] ?? -1;
    const torqueIdx = idx["torque (ft-lbs)"] ?? -1;
    const featuresIdxs = [idx["safety features"], idx["packages"], idx["exterior options"], idx["interior options"], idx["mechanical options"]].filter(i => typeof i === "number" && i >= 0) as number[];
    let Family = 0, Sport = 0, Economy = 0, Premium = 0, Utility = 0, TechEco = 0;
    const body = String(r[bodyIdx] ?? "").toLowerCase();
    if (body.includes("sedan")) { Family += 15; Economy += 10; Premium += 5; }
    else if (body.includes("coupe") || body.includes("convertible")) { Sport += 25; Premium += 10; Family -= 10; }
    else if (body.includes("hatch")) { Economy += 20; Family += 10; }
    else if (body.includes("suv") || body.includes("crossover")) { Family += 25; Utility += 10; Premium += 5; }
    else if (body.includes("pickup") || body.includes("truck")) { Utility += 30; Family -= 10; Sport += 5; }
    else if (body.includes("minivan") || body.includes("van")) { Family += 30; Utility += 15; Sport -= 20; }
    else if (body.includes("wagon")) { Family += 20; Economy += 10; }
    const fuel = String(r[fuelIdx] ?? "").toLowerCase();
    if (fuel.includes("electric")) { TechEco += 40; Economy += 20; Premium += 10; }
    else if (fuel.includes("plug-in")) { TechEco += 35; Economy += 15; }
    else if (fuel.includes("hybrid")) { TechEco += 25; Economy += 20; }
    else if (fuel.includes("diesel")) { Utility += 10; Economy += 10; }
    const hp = num(r[hpIdx]);
    if (hp >= 0 && hp < 150) { Economy += 15; }
    else if (hp >= 150 && hp < 250) { Sport += 10; }
    else if (hp >= 250 && hp < 400) { Sport += 25; Premium += 10; }
    else if (hp >= 400) { Sport += 40; Premium += 15; Economy -= 10; }
    const msrp = num(r[msrpIdx]);
    const msrpNorm = norm(msrp, stats.msrpMin, stats.msrpMax);
    if (msrpNorm <= 0.25) { Economy += 15; }
    else if (msrpNorm <= 0.5) { Economy += 5; Premium += 10; }
    else if (msrpNorm <= 0.85) { Premium += 25; TechEco += 5; }
    else { Premium += 40; TechEco += 10; Economy -= 10; }
    const drive = String(r[driveIdx] ?? "").toLowerCase();
    if (drive.includes("front")) { Economy += 10; Family += 5; }
    else if (drive.includes("rear")) { Sport += 15; Premium += 5; }
    else if (drive.includes("all") || drive.includes("awd") || drive.includes("4wd") || drive.includes("4x4")) { Utility += 15; Family += 10; Sport += 5; }
    const doors = Number(r[doorsIdx] ?? "");
    if (doors === 2) { Sport += 10; Family -= 10; }
    else if (doors === 4) { Family += 10; Economy += 5; }
    else if (doors >= 5) { Family += 15; Utility += 5; }
    const seats = Number(r[seatsIdx] ?? "");
    if (seats === 2) { Sport += 10; Family -= 20; }
    else if (seats === 4) { Sport += 5; }
    else if (seats === 5) { Family += 15; Economy += 5; }
    else if (seats >= 6) { Family += 30; Utility += 10; }
    const cargo = num(r[cargoIdx]);
    const cargoNorm = norm(cargo, stats.cargoMin, stats.cargoMax);
    Family += cargoNorm * 20;
    Utility += cargoNorm * 20;
    const torque = num(r[torqueIdx]);
    const torqueNorm = norm(torque, stats.hpMin, stats.hpMax);
    Sport += torqueNorm * 15;
    Utility += torqueNorm * 10;
    const trans = String(r[transIdx] ?? "").toLowerCase();
    if (trans.includes("manual")) { Sport += 15; Economy += 5; }
    else if (trans.includes("dual") || trans.includes("dct")) { Sport += 20; Premium += 5; }
    else if (trans.includes("cvt")) { Economy += 10; Sport -= 5; }
    else if (trans.includes("automatic")) { Family += 5; Premium += 5; }
    const tow = num(r[towIdx]);
    const towNorm = norm(tow, stats.towMin, stats.towMax);
    Utility += towNorm * 30;
    Family += towNorm * 5;
    const len = num(r[lenIdx]);
    const wb = num(r[wbIdx]);
    const lenNorm = norm(len, stats.lenMin, stats.lenMax);
    const wbNorm = norm(wb, stats.wbMin, stats.wbMax);
    const shortness = 1 - lenNorm;
    Economy += shortness * 10;
    TechEco += shortness * 5;
    Family += lenNorm * 10;
    Premium += lenNorm * 10;
    Utility += lenNorm * 5;
    Family += wbNorm * 5;
    Premium += wbNorm * 5;
    const mpgCombined = num(r[mpgCombinedIdx]);
    let mpg = mpgCombined;
    if (!mpg) {
      const m = parseCityHighway(String(r[mpgCityHighwayIdx] ?? ""));
      mpg = m ?? 0;
    }
    const mpgNorm = norm(mpg, stats.mpgMin, stats.mpgMax);
    Economy += mpgNorm * 40;
    TechEco += mpgNorm * 10;
    let featuresCount = 0;
    for (const i of featuresIdxs) {
      const val = String(r[i] ?? "");
      if (val) {
        const tokens = val.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
        featuresCount += tokens.length;
      }
    }
    const maxFeatures = 50;
    const featuresNorm = clamp01(featuresCount / maxFeatures);
    Premium += featuresNorm * 20;
    TechEco += featuresNorm * 15;
    Family += featuresNorm * 10;
    Family = Math.max(0, Math.min(100, Family));
    Sport = Math.max(0, Math.min(100, Sport));
    Economy = Math.max(0, Math.min(100, Economy));
    Premium = Math.max(0, Math.min(100, Premium));
    Utility = Math.max(0, Math.min(100, Utility));
    TechEco = Math.max(0, Math.min(100, TechEco));
    const mk = String(r[mkIdx] ?? "");
    const md = String(r[mdIdx] ?? "");
    const yr = String(r[yrIdx] ?? "");
    const tr = String(r[trimIdx] ?? "");
    const scores = { Family, Sport, Economy, Premium, Utility, TechEco };
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k).join(" + ");
    return { title: `${mk} ${md} ${yr} ${tr}`.trim(), scores, top };
  }, [idx, stats]);

  const scored = useMemo(() => filtered.map(scoreRow), [filtered, scoreRow]);

  const compatibility = useMemo(() => {
    return scored.map(s => {
      const sum = weights.Family + weights.Sport + weights.Economy + weights.Premium + weights.Utility + weights.TechEco;
      const wf = sum > 0 ? {
        Family: weights.Family / sum,
        Sport: weights.Sport / sum,
        Economy: weights.Economy / sum,
        Premium: weights.Premium / sum,
        Utility: weights.Utility / sum,
        TechEco: weights.TechEco / sum,
      } : { Family: 0, Sport: 0, Economy: 0, Premium: 0, Utility: 0, TechEco: 0 };
      const comp = (
        wf.Family * s.scores.Family +
        wf.Sport * s.scores.Sport +
        wf.Economy * s.scores.Economy +
        wf.Premium * s.scores.Premium +
        wf.Utility * s.scores.Utility +
        wf.TechEco * s.scores.TechEco
      ) / 100;
      return { title: s.title, scores: s.scores, top: s.top, compatibility: comp };
    }).sort((a, b) => b.compatibility - a.compatibility);
  }, [scored, weights]);

  function setW(k: keyof typeof weights, v: number) {
    setWeights(prev => ({ ...prev, [k]: v }));
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1>Scores</h1>
        <a href="/sheets">
          <button style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#fff" }}>Open Dataset</button>
        </a>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        <div>
          <div>Family</div>
          <input type="range" min={0} max={1} step={0.01} value={weights.Family} onChange={e => setW("Family", Number(e.target.value))} />
        </div>
        <div>
          <div>Sport</div>
          <input type="range" min={0} max={1} step={0.01} value={weights.Sport} onChange={e => setW("Sport", Number(e.target.value))} />
        </div>
        <div>
          <div>Economy</div>
          <input type="range" min={0} max={1} step={0.01} value={weights.Economy} onChange={e => setW("Economy", Number(e.target.value))} />
        </div>
        <div>
          <div>Premium</div>
          <input type="range" min={0} max={1} step={0.01} value={weights.Premium} onChange={e => setW("Premium", Number(e.target.value))} />
        </div>
        <div>
          <div>Utility</div>
          <input type="range" min={0} max={1} step={0.01} value={weights.Utility} onChange={e => setW("Utility", Number(e.target.value))} />
        </div>
        <div>
          <div>TechEco</div>
          <input type="range" min={0} max={1} step={0.01} value={weights.TechEco} onChange={e => setW("TechEco", Number(e.target.value))} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        {compatibility.map((c, i) => (
          <div key={i} style={{ border: "1px solid #ccc", borderRadius: 10, boxShadow: "0 2px 6px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: 14, background: "#f7f7f7", borderBottom: "1px solid #e5e5e5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{c.title}</div>
              <div style={{ fontSize: 14, color: "#666" }}>{c.top}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{Math.round(c.compatibility * 100)}%</div>
            </div>
            <div style={{ padding: 14 }}>
              {Object.entries(c.scores).map(([name, value]) => (
                <div key={name} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 13, marginBottom: 4 }}>{name}</div>
                  <div style={{ height: 8, background: "#eee", borderRadius: 6 }}>
                    <div style={{ width: `${Math.round(value)}%`, height: 8, background: "#4b7bec", borderRadius: 6 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
