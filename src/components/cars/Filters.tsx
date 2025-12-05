"use client";
import { useEffect, useRef, useState } from "react";
import { Input } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import FilterSection from "./FilterSection";
import styles from "./cars.module.css";
import { fetchDataset, getMakes, getPriceStats, getBodyTypes, getFuelTypes, Row } from "@/lib/dataset";

export type FiltersData = {
  makes: string[];
  priceMin?: number;
  priceMax?: number;
  priceRanges?: { min?: number; max?: number }[];
  body?: string[];
  fuel?: string[];
  query?: string;
};

type Props = { onApply?: (f: FiltersData) => void };

export default function Filters({ onApply }: Props) {
  const [makes, setMakes] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(0);
  const [rangeMin, setRangeMin] = useState<number>(0);
  const [rangeMax, setRangeMax] = useState<number>(0);
  const [selectedPriceLabels, setSelectedPriceLabels] = useState<string[]>([]);
  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [showSuggest, setShowSuggest] = useState<boolean>(false);
  const [selectedBody, setSelectedBody] = useState<string[]>([]);
  const [bodyTypes, setBodyTypes] = useState<string[]>([]);
  const [selectedFuel, setSelectedFuel] = useState<string[]>([]);
  const [fuelTypes, setFuelTypes] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [idx, setIdx] = useState<Record<string, number>>({});
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    const run = async () => {
      const ds = await fetchDataset();
      setMakes(getMakes(ds));
      setBodyTypes(getBodyTypes(ds));
      setFuelTypes(getFuelTypes(ds));
      const stats = getPriceStats(ds);
      setPriceMin(stats.min);
      setPriceMax(stats.max);
      setRangeMin(stats.min);
      setRangeMax(stats.max);
      setRows(ds.rows);
      setIdx(ds.idx);
    };
    run();
  }, []);

  const priceGroups = (() => {
    const clamp = (x: number) => Math.max(0, Math.min(x, priceMax || x));
    const g = [
      { label: "Under $20,000", min: 0, max: 20000 },
      { label: "$20k–$35k", min: 20000, max: 35000 },
      { label: "$35k–$50k", min: 35000, max: 50000 },
      { label: "$50k–$75k", min: 50000, max: 75000 },
      { label: "$75k–$120k", min: 75000, max: 120000 },
      { label: "$120k–$200k", min: 120000, max: 200000 },
      { label: "$200k–$350k", min: 200000, max: 350000 },
      { label: "$350k–$500k", min: 350000, max: 500000 },
      { label: "$500k+", min: 500000, max: undefined },
    ];
    return g.map(p => ({ label: p.label, min: typeof p.min === "number" ? clamp(p.min) : undefined, max: typeof p.max === "number" ? clamp(p.max) : undefined }));
  })();
  
  return (
    <div className={`${styles.panel} ${styles.filtersPanel}`}>

      <div className={`${styles.panelBody} ${styles.filtersBody}`}>
        <FilterSection title="Search" active={Boolean(search)}>
          <div className={styles.searchWrap}>
            <Input
              placeholder="Search make, model, trim"
              value={search}
              onChange={(e) => { setSearch(String(e.value || "")); setShowSuggest(true); }}
              onFocus={() => setShowSuggest(true)}
              onKeyDown={(e) => { if (e.key === "Enter") { const ranges = selectedPriceLabels.map(lbl => { const g = priceGroups.find(pg => pg.label === lbl); return { min: g?.min, max: g?.max }; }).filter(r => typeof r.min !== "undefined" || typeof r.max !== "undefined"); onApply?.({ makes: selectedMakes, priceMin: typeof rangeMin === "number" ? rangeMin : undefined, priceMax: typeof rangeMax === "number" ? rangeMax : undefined, priceRanges: ranges, body: selectedBody, fuel: selectedFuel, query: (search || "").trim() || undefined }); setShowSuggest(false); } }}
            />
            {showSuggest && search && (
              <div className={styles.suggestList}>
                {(() => {
                  const tokens = String(search || "").toLowerCase().split(/\s+/).filter(Boolean);
                  const mkIdx = idx["make"] ?? -1;
                  const mdIdx = idx["model"] ?? -1;
                  const yrIdx = idx["year"] ?? -1;
                  const trIdx = idx["trim"] ?? -1;
                  const set = new Set<string>();
                  for (const r of rows) {
                    const mk = mkIdx >= 0 ? String(r[mkIdx] ?? "").trim() : "";
                    const md = mdIdx >= 0 ? String(r[mdIdx] ?? "").trim() : "";
                    const tr = trIdx >= 0 ? String(r[trIdx] ?? "").trim() : "";
                    const yr = yrIdx >= 0 ? String(r[yrIdx] ?? "").trim() : "";
                    const hay = `${mk} ${md} ${tr} ${yr}`.toLowerCase();
                    const ok = tokens.every(t => hay.includes(t));
                    if (!ok) continue;
                    const label = [mk, md, tr, yr].filter(Boolean).join(" ");
                    if (label) set.add(label);
                    if (set.size >= 8) break;
                  }
                  const arr = Array.from(set.values());
                  if (arr.length === 0) {
                    return makes.filter(m => m.toLowerCase().includes(search.toLowerCase())).slice(0, 8).map(m => (
                      <button key={m} className={styles.suggestItem} onClick={() => { setSelectedMakes(prev => prev.includes(m) ? prev : [...prev, m]); setSearch(""); setShowSuggest(false); }}>
                        {m}
                      </button>
                    ));
                  }
                  return arr.map(lbl => (
                    <button key={lbl} className={styles.suggestItem} onClick={() => { const ranges = selectedPriceLabels.map(slbl => { const g = priceGroups.find(pg => pg.label === slbl); return { min: g?.min, max: g?.max }; }).filter(r => typeof r.min !== "undefined" || typeof r.max !== "undefined"); setSearch(lbl); setShowSuggest(false); onApply?.({ makes: selectedMakes, priceMin: typeof rangeMin === "number" ? rangeMin : undefined, priceMax: typeof rangeMax === "number" ? rangeMax : undefined, priceRanges: ranges, body: selectedBody, fuel: selectedFuel, query: lbl }); }}>
                      {lbl}
                    </button>
                  ));
                })()}
              </div>
            )}
          </div>
        </FilterSection>
        <FilterSection title="Price" active={selectedPriceLabels.length > 0}>
          <div className={styles.tagCloud}>
            {priceGroups.map(p => (
              <button
                key={p.label}
                className={`${styles.pill} ${selectedPriceLabels.includes(p.label) ? styles.pillActive : ""}`}
                onClick={() => {
                  setSelectedPriceLabels(prev => prev.includes(p.label) ? prev.filter(x => x !== p.label) : [...prev, p.label]);
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </FilterSection>
        <FilterSection title="Make" active={selectedMakes.length > 0}>
          <div className={styles.tagCloud}>
            {makes.map(m => (
              <button
                key={m}
                className={`${styles.pill} ${selectedMakes.includes(m) ? styles.pillActive : ""}`}
                onClick={() => {
                  setSelectedMakes(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </FilterSection>
        <FilterSection title="Body type" active={selectedBody.length > 0}>
          <div className={styles.tagCloud}>
            {bodyTypes.map(bt => (
              <button
                key={bt}
                className={`${styles.pill} ${selectedBody.includes(bt) ? styles.pillActive : ""}`}
                onClick={() => {
                  setSelectedBody(prev => prev.includes(bt) ? prev.filter(x => x !== bt) : [...prev, bt]);
                }}
              >
                {bt}
              </button>
            ))}
          </div>
        </FilterSection>
        <FilterSection title="Fuel" active={selectedFuel.length > 0}>
          <div className={styles.tagCloud}>
            {fuelTypes.map(ft => (
              <button
                key={ft}
                className={`${styles.pill} ${selectedFuel.includes(ft) ? styles.pillActive : ""}`}
                onClick={() => {
                  setSelectedFuel(prev => prev.includes(ft) ? prev.filter(x => x !== ft) : [...prev, ft]);
                }}
              >
                {ft}
              </button>
            ))}
          </div>
        </FilterSection>
        <div className={styles.actionRow}>
          <Button className={`${styles.actionBtn} ${styles.actionSecondary}`} fillMode="solid" themeColor="base" onClick={() => { setSelectedMakes([]); setSelectedBody([]); setSelectedFuel([]); setSelectedPriceLabels([]); setSearch(""); setShowSuggest(false); setRangeMin(priceMin); setRangeMax(priceMax); onApply?.({ makes: [], priceMin: priceMin, priceMax: priceMax, priceRanges: [], body: [], fuel: [], query: undefined }); }}>Reset</Button>
          <Button className={`${styles.actionBtn} ${styles.actionPrimary}`} fillMode="solid" themeColor="primary" onClick={() => {
            const ranges = selectedPriceLabels.map(lbl => {
              const g = priceGroups.find(pg => pg.label === lbl);
              return { min: g?.min, max: g?.max };
            }).filter(r => typeof r.min !== "undefined" || typeof r.max !== "undefined");
            onApply?.({ makes: selectedMakes, priceMin: typeof rangeMin === "number" ? rangeMin : undefined, priceMax: typeof rangeMax === "number" ? rangeMax : undefined, priceRanges: ranges, body: selectedBody, fuel: selectedFuel, query: search.trim() || undefined });
          }}>Apply</Button>
        </div>
      </div>
    </div>
  );
}
