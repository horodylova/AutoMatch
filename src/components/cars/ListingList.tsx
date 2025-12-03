"use client";
import { useEffect, useRef, useState } from "react";
import ListingItem, { ListingItemData } from "./ListingItem";
import ListingRow, { ListingRowData } from "./ListingRow";
import ResultsToolbar from "./ResultsToolbar";
import Pagination from "./Pagination";
import styles from "./cars.module.css";
import Loader from "@/components/Loader";
import { fetchDataset, getRowCount, getPriceStats } from "@/lib/dataset";

const sample: ListingItemData = {
  imageUrl: "https://www.edmunds.com/assets/m/cs/blt3beb1190f1d36abe/67cf815bff3f03baede14cdc/2025_acura_adx_front_1280.jpg",
  title: "Acura ADX 2025 Base",
  subtitle: "AWD 1.5L Turbo CVT",
  price: "$34,900",
  badges: ["New", "In stock"],
  specs: ["1.5L", "190 HP", "AWD", "30 MPG", "5 seats"],
};

export default function ListingList() {
  const [count, setCount] = useState<number>(0);
  const pageSize = 15;
  const [stats, setStats] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
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
  return (
    <div className={styles.panel}>
  
      <div className={styles.panelBody}>
        <ResultsToolbar count={count} view={view} sort={sort} onViewChange={setView} onSortChange={setSort} />
        {count === 0 ? <Loader label="Loading results" /> : null}
        {(() => {
          const fmtUSD = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
          const min = stats.min || 20000;
          const max = stats.max || 90000;
          const span = Math.max(0, max - min);
          const indices = Array.from({ length: pageSize }).map((_, i) => i);
          const ordered = sort === "priceDesc" ? [...indices].reverse() : indices;
          const prices = ordered.map((idx) => min + Math.round(span * (idx / Math.max(1, pageSize - 1))));
          return view === "grid" ? (
            <div className={styles.listGrid}>
              {prices.map((p, i) => (
                <ListingItem key={`g-${i}`} item={{ ...sample, price: fmtUSD(p) }} />
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {prices.map((p, i) => (
                <ListingRow key={`l-${i}`} item={{ ...sample, price: fmtUSD(p) } as ListingRowData} />
              ))}
            </div>
          );
        })()}
        {view === "grid" ? (
          <></>
        ) : (
          <></>
        )}
        <Pagination page={page} pageSize={pageSize} total={count} onChange={setPage} />
      </div>
    </div>
  );
}
