type Cell = string | number | boolean | null;
export type Row = Cell[];
export type Dataset = { headers: string[]; rows: Row[]; idx: Record<string, number> };

let datasetPromise: Promise<Dataset> | null = null;

export async function fetchDataset(): Promise<Dataset> {
  const sheetId = process.env.NEXT_PUBLIC_SHEET_ID || process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "";
  const range = process.env.NEXT_PUBLIC_SHEET_RANGE || process.env.SHEET_NAME || "DATABASE";
  const cacheKey = `dataset:${sheetId}:${range}`;
  try {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { data: Dataset; expiresAt: number };
        if (parsed && typeof parsed.expiresAt === "number" && Date.now() < parsed.expiresAt) {
          return parsed.data as Dataset;
        }
        window.localStorage.removeItem(cacheKey);
      }
    }
  } catch {}
  if (datasetPromise) return datasetPromise;
  datasetPromise = (async () => {
    const res = await fetch(`/api/sheet-data?id=${encodeURIComponent(sheetId)}&range=${encodeURIComponent(range)}`);
    const data = await res.json();
    const values = ((data?.data?.values || []) as Cell[][]);
    const headers = (values[1] || []).map(v => String(v ?? "").trim());
    const idx: Record<string, number> = {};
    headers.forEach((h, i) => { idx[h.toLowerCase()] = i; });
    const rows = values.slice(4);
    const out: Dataset = { headers, rows, idx };
    try {
      if (typeof window !== "undefined") {
        const ttl = 3 * 60 * 60 * 1000;
        const payload = { data: out, expiresAt: Date.now() + ttl };
        window.localStorage.setItem(cacheKey, JSON.stringify(payload));
      }
    } catch {}
    return out;
  })();
  return datasetPromise;
}

export function getMakes(ds: Dataset): string[] {
  const mkIdx = ds.idx["make"] ?? -1;
  if (mkIdx < 0) return [];
  const set = new Set<string>();
  for (const r of ds.rows) {
    const mk = String(r[mkIdx] ?? "").trim();
    if (mk) set.add(mk);
  }
  return Array.from(set.values()).sort((a, b) => a.localeCompare(b));
}

export function getRowCount(ds: Dataset): number {
  return ds.rows.length;
}

export function getPriceStats(ds: Dataset): { min: number; max: number } {
  const priceIdx = ds.idx["base msrp"] ?? -1;
  if (priceIdx < 0) return { min: 0, max: 0 };
  let min = Number.POSITIVE_INFINITY;
  let max = 0;
  for (const r of ds.rows) {
    const raw = String(r[priceIdx] ?? "").trim();
    if (!raw) continue;
    const cleaned = raw.replace(/[^0-9.]/g, "");
    const num = Number(cleaned);
    if (!Number.isFinite(num) || num <= 0) continue;
    if (num < min) min = num;
    if (num > max) max = num;
  }
  if (!Number.isFinite(min)) min = 0;
  return { min, max };
}

export function getBodyTypes(ds: Dataset): string[] {
  const idxBT = ds.idx["body type"] ?? -1;
  if (idxBT < 0) return [];
  const set = new Set<string>();
  for (const r of ds.rows) {
    const bt = String(r[idxBT] ?? "").trim();
    if (bt) set.add(bt);
  }
  return Array.from(set.values()).sort((a, b) => a.localeCompare(b));
}

export function getFuelTypes(ds: Dataset): string[] {
  const idxFT = ds.idx["fuel type"] ?? -1;
  if (idxFT < 0) return [];
  const set = new Set<string>();
  for (const r of ds.rows) {
    const raw = String(r[idxFT] ?? "").trim().toLowerCase();
    if (!raw) continue;
    const isElectric = raw.includes("electric") || raw.includes("bev");
    const isHydrogen = raw.includes("hydrogen");
    const isDiesel = raw.includes("diesel");
    const isHybrid = raw.includes("hybrid") || raw.includes("plug-in") || raw.includes("phev");
    const isFlex = raw.includes("flex") || raw.includes("e85");
    const isGasoline = raw.includes("gasoline") || raw.includes("petrol") || raw.includes("unleaded");
    if (isElectric) set.add("Electric");
    if (isHydrogen) set.add("Hydrogen");
    if (isDiesel) set.add("Diesel");
    if (isHybrid) set.add("Hybrid");
    if (isFlex) set.add("Flex-fuel");
    if (isGasoline && !isHybrid && !isFlex) set.add("Gasoline");
  }
  return Array.from(set.values()).sort((a, b) => a.localeCompare(b));
}

export function getDriveTypes(ds: Dataset): string[] {
  const idxDT = ds.idx["drive type"] ?? -1;
  if (idxDT < 0) return [];
  const set = new Set<string>();
  for (const r of ds.rows) {
    const dt = String(r[idxDT] ?? "").trim();
    if (dt) set.add(dt);
  }
  return Array.from(set.values()).sort((a, b) => a.localeCompare(b));
}

export function getTransmissionTypes(ds: Dataset): string[] {
  const idxT = ds.idx["transmission"] ?? -1;
  if (idxT < 0) return [];
  const set = new Set<string>();
  for (const r of ds.rows) {
    const raw = String(r[idxT] ?? "").trim().toLowerCase();
    if (!raw) continue;
    const cleaned = raw.replace(/\b\d+\s*-?\s*speed\s*/g, "").trim();
    const a = cleaned.includes("automatic") || cleaned.includes("direct drive") || cleaned.includes("cvt");
    const m = cleaned.includes("manual");
    const mix = cleaned.includes("automated") || cleaned.includes("dual") || cleaned.includes("semi") || cleaned.includes("sequential") || (a && m);
    let label = "Automatic";
    if (mix) label = "Mixed";
    else if (m && !mix && !a) label = "Manual";
    set.add(label);
  }
  return Array.from(set.values()).sort((a, b) => a.localeCompare(b));
}

export function parseCylinderCount(raw: string): number | null {
  const s = String(raw || "").trim().toLowerCase();
  if (!s) return null;
  let m: RegExpMatchArray | null = null;
  m = s.match(/\b(\d{1,2})\s*(?:cyl(?:inder)?s?)\b/);
  if (m) {
    const n = Number(m[1]);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  m = s.match(/\b(?:v|w|i|inline|flat|boxer)\s*-?\s*(\d{1,2})\b/);
  if (m) {
    const n = Number(m[1]);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  m = s.match(/\b(\d{1,2})\s*-\s*cyl/);
  if (m) {
    const n = Number(m[1]);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  m = s.match(/\b(\d{1,2})\b/);
  if (m) {
    const n = Number(m[1]);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  return null;
}

export function getCylinderCounts(ds: Dataset): string[] {
  const cIdx = ds.idx["cylinders"] ?? -1;
  if (cIdx < 0) return [];
  const set = new Set<string>();
  for (const r of ds.rows) {
    const raw = String(r[cIdx] ?? "").trim();
    if (!raw) continue;
    set.add(raw);
  }
  return Array.from(set.values()).sort((a, b) => a.localeCompare(b));
}
