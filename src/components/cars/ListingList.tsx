"use client";
import { useEffect, useRef, useState } from "react";
import ListingItem, { ListingItemData } from "./ListingItem";
import ListingRow, { ListingRowData } from "./ListingRow";
import ResultsToolbar from "./ResultsToolbar";
import Pagination from "./Pagination";
import styles from "./cars.module.css";
import Loader from "@/components/Loader";
import { fetchDataset, getRowCount, getPriceStats, Row } from "@/lib/dataset";

function num(v: unknown): number {
  const raw = String(v ?? "").trim();
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function fmtUSD(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function ListingList() {
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
  const parseSort = (s: string | null): "best" | "top" | "new" | "priceAsc" | "priceDesc" => {
    if (s === "priceAsc") return "priceAsc";
    if (s === "priceDesc") return "priceDesc";
    if (s === "best") return "best";
    if (s === "top") return "top";
    if (s === "new") return "new";
    return "best";
  };
  const [sort, setSort] = useState<"best" | "top" | "new" | "priceAsc" | "priceDesc">(() => {
    try {
      if (typeof window !== "undefined") {
        const s = window.sessionStorage.getItem("cars:sort");
        return parseSort(s);
      }
    } catch {}
    return "best";
  });
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
    try { if (typeof window !== "undefined") window.sessionStorage.setItem("cars:sort", sort); } catch {}
  }, [sort]);
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
    const img = imgStr.split(";").map(s => s.trim()).filter(Boolean)[0] || "";
    const title = [make, model, trim, year].filter(Boolean).join(" ");
    const specs = [eng ? `${eng}L` : "", hp ? `${hp} HP` : "", doors ? `${doors} seats` : ""].filter(Boolean);
    return { id, imageUrl: img, title, subtitle: desc, price, badges: [], specs };
  };

  const sortedRows = (() => {
    const msrpIdx = idx["base msrp"] ?? -1;
    const yearIdx = idx["year"] ?? -1;
    const hpIdx = idx["horsepower (hp)"] ?? -1;
    const arr = [...rows];
    if (sort === "priceAsc" && msrpIdx >= 0) arr.sort((a, b) => num(a[msrpIdx]) - num(b[msrpIdx]));
    else if (sort === "priceDesc" && msrpIdx >= 0) arr.sort((a, b) => num(b[msrpIdx]) - num(a[msrpIdx]));
    else if (sort === "new" && yearIdx >= 0) arr.sort((a, b) => num(b[yearIdx]) - num(a[yearIdx]));
    else if (sort === "top" && hpIdx >= 0) arr.sort((a, b) => num(b[hpIdx]) - num(a[hpIdx]));
    return arr;
  })();

  const hasImage = (r: Row): boolean => {
    const i = idx["image url"] ?? -1;
    if (i < 0) return false;
    const s = String(r[i] ?? "").trim();
    const first = s.split(";").map(x => x.trim()).filter(Boolean)[0] || "";
    return !!first;
  };
  const filteredRows = sortedRows.filter(hasImage);
  const total = filteredRows.length;
  const start = Math.max(0, (page - 1) * pageSize);
  const pageRows = filteredRows.slice(start, start + pageSize);
  return (
    <div className={styles.panel}>
  
      <div className={styles.panelBody}>
        <ResultsToolbar count={total} view={view} sort={sort} onViewChange={setView} onSortChange={setSort} />
        {rows.length === 0 ? <Loader label="Loading results" /> : null}
        {(() => {
          return view === "grid" ? (
            <div className={styles.listGrid}>
              {pageRows.map(r => toItem(r)).filter(it => !!it.imageUrl).map((item, i) => {
                const key = item.id || `g-${start + i}`;
                return <ListingItem key={key} item={item} />;
              })}
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {pageRows.map(r => toItem(r)).filter(it => !!it.imageUrl).map((item, i) => {
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
