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
      const cached = window.sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as Dataset;
        return parsed;
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
        window.sessionStorage.setItem(cacheKey, JSON.stringify(out));
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
