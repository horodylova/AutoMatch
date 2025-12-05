"use client";
import { useEffect, useRef, useState } from "react";
import ListingItem, { ListingItemData } from "./ListingItem";
import ListingRow, { ListingRowData } from "./ListingRow";
import ResultsToolbar from "./ResultsToolbar";
import Pagination from "./Pagination";
import styles from "./cars.module.css";
import Loader from "@/components/Loader";
import { fetchDataset, getRowCount, getPriceStats, Row } from "@/lib/dataset";
import { FiltersData } from "./Filters";

function num(v: unknown): number {
  const raw = String(v ?? "").trim();
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function fmtUSD(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function ListingList({ filters }: { filters?: FiltersData }) {
  const [count, setCount] = useState<number>(0);
  const pageSize = 15;
  const [stats, setStats] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [rows, setRows] = useState<Row[]>([]);
  const [idx, setIdx] = useState<Record<string, number>>({});
  const [view, setView] = useState<"grid" | "list">(() => {
    try {
      if (typeof window !== "undefined") {
        const v = window.sessionStorage.getItem("cars:view");
        if (v === "list" || v === "grid") return v;
      }
    } catch {}
    return "grid";
  });
  const didCount = useRef(false);
  useEffect(() => {
    if (didCount.current) return;
    didCount.current = true;
    const run = async () => {
      const ds = await fetchDataset();
      setCount(getRowCount(ds));
      const ps = getPriceStats(ds);
      setStats({ min: ps.min, max: ps.max });
      setRows(ds.rows);
      setIdx(ds.idx);
    };
    run();
  }, []);
  const [sort, setSort] = useState<"none" | "new" | "priceAsc" | "priceDesc">("none");
  const [page, setPage] = useState<number>(() => {
    try {
      if (typeof window !== "undefined") {
        const p = Number(window.sessionStorage.getItem("cars:page") || "1");
        if (p >= 1) return p;
      }
    } catch {}
    return 1;
  });
  useEffect(() => {
    try { if (typeof window !== "undefined") window.sessionStorage.setItem("cars:view", view); } catch {}
  }, [view]);
  
  useEffect(() => {
    try { if (typeof window !== "undefined") window.sessionStorage.setItem("cars:page", String(page)); } catch {}
  }, [page]);

  const toItem = (r: Row): ListingItemData => {
    const get = (key: string): string => {
      const i = idx[key.toLowerCase()] ?? -1;
      if (i < 0) return "";
      return String(r[i] ?? "").trim();
    };
    const id = get("id");
    const make = get("make");
    const model = get("model");
    const trim = get("trim");
    const year = get("year");
    const msrp = num(get("base msrp"));
    const price = msrp > 0 ? fmtUSD(msrp) : "";
    const eng = get("engine size (l)");
    const hp = get("horsepower (hp)");
    const desc = get("trim (description)");
    const doors = get("doors");
    const imgStr = get("image url");
    const img = imgStr.split(";").map(s => s.trim()).filter(Boolean)[0] || "/no-image-available.jpg";
    const title = [make, model, trim, year].filter(Boolean).join(" ");
    const specs = [eng ? `${eng}L` : "", hp ? `${hp} HP` : "", doors ? `${doors} seats` : ""].filter(Boolean);
    return { id, imageUrl: img, title, subtitle: desc, price, badges: [], specs };
  };

  const sortedRows = (() => {
    const msrpIdx = idx["base msrp"] ?? -1;
    const yearIdx = idx["year"] ?? -1;
    const arr = [...rows];
    if (sort === "priceAsc" && msrpIdx >= 0) arr.sort((a, b) => num(a[msrpIdx]) - num(b[msrpIdx]));
    else if (sort === "priceDesc" && msrpIdx >= 0) arr.sort((a, b) => num(b[msrpIdx]) - num(a[msrpIdx]));
    else if (sort === "new" && yearIdx >= 0) arr.sort((a, b) => num(b[yearIdx]) - num(a[yearIdx]));
    return arr;
  })();

  const hasImage = (r: Row): boolean => {
    const i = idx["image url"] ?? -1;
    if (i < 0) return false;
    const s = String(r[i] ?? "").trim();
    const first = s.split(";").map(x => x.trim()).filter(Boolean)[0] || "";
    return !!first;
  };
  const maxYear = (() => {
    return 0;
  })();
  const matchesFilters = (r: Row): boolean => {
    if (filters && filters.makes && filters.makes.length > 0) {
      const mkIdx = idx["make"] ?? -1;
      const mk = mkIdx >= 0 ? String(r[mkIdx] ?? "").trim().toLowerCase() : "";
      const ok = filters.makes.some(m => mk === m.toLowerCase());
      if (!ok) return false;
    }
    if (filters && (typeof filters.priceMin !== "undefined" || typeof filters.priceMax !== "undefined")) {
      const msIdx = idx["base msrp"] ?? -1;
      const val = msIdx >= 0 ? num(r[msIdx]) : 0;
      const min = typeof filters.priceMin === "number" ? filters.priceMin : undefined;
      const max = typeof filters.priceMax === "number" ? filters.priceMax : undefined;
      if (typeof min === "number" && val < min) return false;
      if (typeof max === "number" && val > max) return false;
    }
    if (filters && filters.body && filters.body.length > 0) {
      const bIdx = idx["body type"] ?? -1;
      const body = bIdx >= 0 ? String(r[bIdx] ?? "").trim().toLowerCase() : "";
      const ok = filters.body.some(lbl => body === lbl.trim().toLowerCase());
      if (!ok) return false;
    }
    if (filters && filters.fuel && filters.fuel.length > 0) {
      const fIdx = idx["fuel type"] ?? -1;
      const fuel = fIdx >= 0 ? String(r[fIdx] ?? "").trim().toLowerCase() : "";
      const matchFuel = (label: string): boolean => {
        const l = label.toLowerCase();
        if (l === "electric") return fuel.includes("electric");
        if (l === "hybrid") return fuel.includes("hybrid") || fuel.includes("plug-in");
        if (l === "diesel") return fuel.includes("diesel");
        if (l === "gasoline") return fuel.includes("gasoline") || fuel.includes("petrol") || (!fuel.includes("electric") && !fuel.includes("hybrid") && !fuel.includes("diesel"));
        return fuel.includes(l);
      };
      const ok = filters.fuel.some(matchFuel);
      if (!ok) return false;
    }
    if (filters && filters.query) {
      const q = String(filters.query || "").trim().toLowerCase();
      if (q) {
        const mk = String(r[idx["make"] ?? -1] ?? "").toLowerCase();
        const md = String(r[idx["model"] ?? -1] ?? "").toLowerCase();
        const tr = String(r[idx["trim"] ?? -1] ?? "").toLowerCase();
        const yr = String(r[idx["year"] ?? -1] ?? "").toLowerCase();
        const hay = `${mk} ${md} ${tr} ${yr}`.trim();
        const tokens = q.split(/\s+/).filter(Boolean);
        const ok = tokens.every(t => hay.includes(t));
        if (!ok) return false;
      }
    }
    return true;
  };
  const filteredRows = sortedRows.filter(matchesFilters);
  const total = filteredRows.length;
  const emptyFilters = !filters || (
    (!filters.makes || filters.makes.length === 0) &&
    (!filters.body || filters.body.length === 0) &&
    (!filters.fuel || filters.fuel.length === 0) &&
    (typeof filters.priceMin === "undefined") &&
    (typeof filters.priceMax === "undefined") &&
    (!filters.query)
  );
  const countLabel = emptyFilters ? count : total;
  const firstPageSampleRef = useRef<Row[] | null>(null);
  useEffect(() => { firstPageSampleRef.current = null; }, [rows]);
  useEffect(() => { if (sort !== "none" || !emptyFilters || page !== 1) firstPageSampleRef.current = null; }, [sort, emptyFilters, page]);
  const start = Math.max(0, (page - 1) * pageSize);
  const pageRows = (() => {
    if (emptyFilters && page === 1 && sort === "none") {
      if (!firstPageSampleRef.current) {
        if (filteredRows.length === 0) return [];
        const pool = [...filteredRows];
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const t = pool[i];
          pool[i] = pool[j];
          pool[j] = t;
        }
        firstPageSampleRef.current = pool.slice(0, Math.min(pageSize, pool.length));
      }
      return firstPageSampleRef.current as Row[];
    }
    return filteredRows.slice(start, start + pageSize);
  })();
  return (
    <div className={styles.panel}>
  
      <div className={styles.panelBody}>
        <ResultsToolbar count={countLabel} view={view} sort={sort} onViewChange={setView} onSortChange={setSort} />
        {rows.length === 0 ? <Loader label="Loading results" /> : null}
        {(() => {
          return view === "grid" ? (
            <div className={styles.listGrid}>
              {pageRows.map(r => toItem(r)).map((item, i) => {
                const key = item.id || `g-${start + i}`;
                return <ListingItem key={key} item={item} />;
              })}
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {pageRows.map(r => toItem(r)).map((item, i) => {
                const rowItem: ListingRowData = {
                  imageUrl: item.imageUrl,
                  title: item.title,
                  subtitle: item.subtitle,
                  price: item.price,
                  specs: item.specs,
                };
                const key = item.id || `l-${start + i}`;
                return <ListingRow key={key} item={rowItem} />;
              })}
            </div>
          );
        })()}
        {view === "grid" ? (
          <></>
        ) : (
          <></>
        )}
        <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
      </div>
    </div>
  );
}
