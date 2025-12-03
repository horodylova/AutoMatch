"use client";
import { useEffect, useState } from "react";
import ListingItem, { ListingItemData } from "./ListingItem";
import ListingRow, { ListingRowData } from "./ListingRow";
import ResultsToolbar from "./ResultsToolbar";
import Pagination from "./Pagination";
import styles from "./cars.module.css";

const sample: ListingItemData = {
  imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=80&auto=format&fit=crop",
  title: "Acura ADX 2025 Base",
  subtitle: "AWD 1.5L Turbo CVT",
  price: "$34,900",
  badges: ["New", "In stock"],
  specs: ["1.5L", "190 HP", "AWD", "30 MPG", "5 seats"],
};

// no dataset yet: render repeated sample item per pageSize

export default function ListingList() {
  const count = 24241;
  const pageSize = 9;
  const [view, setView] = useState<"grid" | "list">(() => {
    try {
      if (typeof window !== "undefined") {
        const v = window.sessionStorage.getItem("cars:view");
        if (v === "list" || v === "grid") return v;
      }
    } catch {}
    return "grid";
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
    try { if (typeof window !== "undefined") window.sessionStorage.setItem("cars:page", String(page)); } catch {}
  }, [page]);
  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>Results</div>
      <div className={styles.panelBody}>
        <ResultsToolbar count={count} view={view} onViewChange={setView} />
        {view === "grid" ? (
          <div className={styles.listGrid}>
            {Array.from({ length: pageSize }).map((_, i) => (
              <ListingItem key={i} item={sample} />
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {Array.from({ length: pageSize }).map((_, i) => (
              <ListingRow key={i} item={sample as ListingRowData} />
            ))}
          </div>
        )}
        <Pagination page={page} pageSize={pageSize} total={count} onChange={setPage} />
      </div>
    </div>
  );
}
