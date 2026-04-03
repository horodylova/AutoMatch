"use client";
import { useMemo, useState, useEffect } from "react";
import stylesCars from "../cars/cars.module.css";
import headerStyles from "./InterimCandidates.module.css";
import ListingItem from "../cars/ListingItem";
import { Row } from "@/utils/carScoring";
import { buildInitialCandidates, BudgetBand } from "@/utils/initialCandidates";
import { setPreliminaryCandidates, setPreliminarySnapshot } from "@/utils/storage";

function toItem(c: { id: string; image: string; make: string; model: string; trim: string; year: number; baseMsrp: number }) {
  const title = [c.make, c.model, c.trim, String(c.year)].filter(Boolean).join(" ");
  const price = c.baseMsrp > 0 ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(c.baseMsrp) : "";
  return {
    id: c.id,
    imageUrl: c.image || "/no-image-available.jpg",
    title,
    subtitle: "",
    price,
    badges: [],
    specs: []
  };
}

export default function InterimCandidates({
  rows,
  idx,
  budget,
  includeUpcoming,
  onContinue
}: {
  rows: Row[];
  idx: Record<string, number>;
  budget: BudgetBand;
  includeUpcoming: boolean;
  onContinue?: () => void;
}) {
  const candidates = useMemo(() => buildInitialCandidates(rows, idx, budget, includeUpcoming, 1000), [rows, idx, budget, includeUpcoming]);
  const pageSize = 24;
  const [page, setPage] = useState(1);
  const total = candidates.length;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const pageCars = candidates.slice(start, start + pageSize);
  
  useEffect(() => {
    if (candidates.length > 0) {
      const ids = candidates.map(c => c.id);
      setPreliminaryCandidates(ids);
      const snap = candidates.map(c => {
        const title = [c.make, c.model, c.trim, String(c.year)].filter(Boolean).join(" ");
        const price = c.baseMsrp > 0 ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(c.baseMsrp) : "";
        return { id: c.id, title, image: c.image || "/no-image-available.jpg", price };
      });
      setPreliminarySnapshot(snap);
    }
  }, [candidates]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className={headerStyles.header}>
        <div className={stylesCars.sectionTitle}>Preliminary Matches</div>
        <p className={headerStyles.lead}>We built an initial list based on your Part 1 answers. Open any car in a new tab to explore details, then return to continue the quiz.</p>
        {onContinue ? (
          <button className={headerStyles.continueLink} onClick={onContinue}>
            Continue the quiz to refine and personalize your top matches.
          </button>
        ) : (
          <p className={headerStyles.hint}>Continue the quiz to refine and personalize your top matches.</p>
        )}
      </div>
      <div className={stylesCars.listGrid}>
        {pageCars.map(c => <ListingItem key={c.id} item={toItem(c)} openInNewTab />)}
      </div>
      <div className={stylesCars.pager}>
        <button className={stylesCars.pagerBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
        <div className={stylesCars.pagerNums}>
          <button className={page === 1 ? stylesCars.pagerBtnActive : stylesCars.pagerBtn} onClick={() => setPage(1)}>1</button>
          {maxPage >= 2 && <button className={page === 2 ? stylesCars.pagerBtnActive : stylesCars.pagerBtn} onClick={() => setPage(2)}>2</button>}
          {maxPage >= 3 && <button className={page === 3 ? stylesCars.pagerBtnActive : stylesCars.pagerBtn} onClick={() => setPage(3)}>3</button>}
          {maxPage > 3 && <span className={stylesCars.pagerBtn}>…</span>}
          {maxPage > 3 && <button className={page === maxPage ? stylesCars.pagerBtnActive : stylesCars.pagerBtn} onClick={() => setPage(maxPage)}>{maxPage}</button>}
        </div>
        <button className={stylesCars.pagerBtn} onClick={() => setPage(p => Math.min(maxPage, p + 1))} disabled={page >= maxPage}>Next</button>
      </div>
    </div>
  );
}
