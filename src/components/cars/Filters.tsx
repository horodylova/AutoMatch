"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import FilterSection from "./FilterSection";
import styles from "./cars.module.css";
import { fetchDataset, getMakes, getPriceStats, getBodyTypes, getFuelTypes, getDriveTypes, getTransmissionTypes, getCylinderCounts, getEfficiencyStats, Row } from "@/lib/dataset";

export type FiltersData = {
  makes: string[];
  priceMin?: number;
  priceMax?: number;
  priceRanges?: { min?: number; max?: number }[];
  body?: string[];
  fuel?: string[];
  drive?: string[];
  transmission?: string[];
  cylinders?: string[];
  efficiencyUnit?: "mpg" | "mpge";
  efficiencyRanges?: { min?: number; max?: number }[];
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
  const [selectedDrive, setSelectedDrive] = useState<string[]>([]);
  const [driveTypes, setDriveTypes] = useState<string[]>([]);
  const [selectedTransmission, setSelectedTransmission] = useState<string[]>([]);
  const [transmissionTypes, setTransmissionTypes] = useState<string[]>([]);
  const [selectedCylinders, setSelectedCylinders] = useState<string[]>([]);
  const [cylinderCounts, setCylinderCounts] = useState<string[]>([]);
  const [effStats, setEffStats] = useState<{ mpg: { min: number; max: number }; mpge: { min: number; max: number } }>({ mpg: { min: 0, max: 0 }, mpge: { min: 0, max: 0 } });
  const [selectedEffLabels, setSelectedEffLabels] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [idx, setIdx] = useState<Record<string, number>>({});
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(true);
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    const run = async () => {
      const ds = await fetchDataset();
      setMakes(getMakes(ds));
      setBodyTypes(getBodyTypes(ds));
      setFuelTypes(getFuelTypes(ds));
      setDriveTypes(getDriveTypes(ds));
      setTransmissionTypes(getTransmissionTypes(ds));
      setCylinderCounts(getCylinderCounts(ds));
      const stats = getPriceStats(ds);
      setPriceMin(stats.min);
      setPriceMax(stats.max);
      setRangeMin(stats.min);
      setRangeMax(stats.max);
      setRows(ds.rows);
      setIdx(ds.idx);
      setEffStats(getEfficiencyStats(ds));
    };
    run();
  }, []);

  useEffect(() => {
    const check = () => {
      if (typeof window === "undefined") return;
      const mobile = window.innerWidth <= 700;
      setIsMobile(mobile);
      setShowFilters(mobile ? false : true);
    };
    check();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", check, { passive: true } as any);
      return () => window.removeEventListener("resize", check);
    }
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
  const effUnit = (() => {
    if (selectedFuel.length === 0) return undefined;
    const labels = selectedFuel.map(s => s.toLowerCase());
    const mpg = labels.some(l => l === "gasoline" || l === "diesel" || l === "flex-fuel");
    const mpge = labels.some(l => l === "electric" || l === "hydrogen");
    if (mpg && mpge) return undefined;
    if (mpg) return "mpg" as const;
    if (mpge) return "mpge" as const;
    return undefined;
  })();
  const effGroups = (() => {
    const unit = effUnit;
    if (!unit) return [] as { label: string; min?: number; max?: number }[];
    const fIdx = idx["fuel type"] ?? -1;
    const vIdx = unit === "mpg" ? (idx["epa combined mpg"] ?? -1) : (idx["epa combined mpge"] ?? -1);
    if (fIdx < 0 || vIdx < 0) return [] as { label: string; min?: number; max?: number }[];
    const labels = selectedFuel.map(s => s.toLowerCase());
    const matchFuelRow = (fuelRaw: string): boolean => {
      if (labels.length === 0) return true;
      const fuel = fuelRaw.toLowerCase();
      return labels.some(l => {
        if (l === "electric") return fuel.includes("electric") || fuel.includes("bev");
        if (l === "hydrogen") return fuel.includes("hydrogen");
        if (l === "diesel") return fuel.includes("diesel");
        if (l === "hybrid") return fuel.includes("hybrid") || fuel.includes("plug-in") || fuel.includes("phev");
        if (l === "flex-fuel") return fuel.includes("flex") || fuel.includes("e85");
        if (l === "gasoline") {
          const isGas = fuel.includes("gasoline") || fuel.includes("petrol") || fuel.includes("unleaded");
          const isHybrid = fuel.includes("hybrid") || fuel.includes("plug-in") || fuel.includes("phev");
          const isFlex = fuel.includes("flex") || fuel.includes("e85");
          return isGas && !isHybrid && !isFlex;
        }
        return fuel.includes(l);
      });
    };
    const vals: number[] = [];
    for (const r of rows) {
      const fuelRaw = String(r[fIdx] ?? "").trim();
      if (!matchFuelRow(fuelRaw)) continue;
      const raw = String(r[vIdx] ?? "").trim();
      const n = Number(raw.replace(/[^0-9.]/g, ""));
      if (Number.isFinite(n) && n > 0) vals.push(n);
    }
    vals.sort((a, b) => a - b);
    if (vals.length === 0) return [] as { label: string; min?: number; max?: number }[];
    const buckets = Math.min(5, Math.max(1, Math.floor(Math.sqrt(vals.length))));
    const edges: number[] = [];
    for (let i = 0; i < buckets; i++) {
      const idxQ = Math.min(vals.length - 1, Math.round((i / buckets) * (vals.length - 1)));
      edges.push(vals[idxQ]);
    }
    edges.push(vals[vals.length - 1]);
    const g: { label: string; min?: number; max?: number }[] = [];
    for (let i = 0; i < buckets; i++) {
      const a = Math.round(edges[i]);
      const b = Math.round(i < buckets - 1 ? edges[i + 1] : edges[edges.length - 1]);
      if (i < buckets - 1) g.push({ label: `${a}–${b} ${unit.toUpperCase()}`, min: a, max: b });
      else g.push({ label: `${a}+ ${unit.toUpperCase()}`, min: a, max: undefined });
    }
    const uniq: { label: string; min?: number; max?: number }[] = [];
    const seen = new Set<string>();
    for (const it of g) {
      if (seen.has(it.label)) continue;
      seen.add(it.label);
      uniq.push(it);
    }
    return uniq;
  })();
  
  return (
    <div className={`${styles.panel} ${styles.filtersPanel}`}>
      {isMobile && (
        <div className={styles.filtersToggleBar}>
          <button className={styles.filtersToggleBtn} onClick={() => setShowFilters(s => !s)}>
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      )}

      {(!isMobile || showFilters) && (
      <div className={`${styles.panelBody} ${styles.filtersBody}`}>
        <FilterSection title="Search" active={Boolean(search)}>
          <div className={styles.searchWrap}>
            <div className={styles.searchBar}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23C15.99 6.01 13.98 4 11.5 4S7.01 6.01 7.01 9.5 9.02 15 11.5 15c1.61 0 3.06-.59 4.23-1.57l.27.28v.79l4.25 4.25 1.49-1.49L15.5 14zm-4 0C9.01 14 7 11.99 7 9.5S9.01 5 11.5 5 16 7.01 16 9.5 13.99 14 11.5 14z" fill="currentColor"/>
              </svg>
              <input
                className={styles.searchField}
                placeholder="Search make, model, trim"
                value={search}
                onChange={(e) => { const v = (e.target as HTMLInputElement).value; setSearch(String(v || "")); setShowSuggest(true); }}
                onFocus={() => setShowSuggest(true)}
                onKeyDown={(e) => { if (e.key === "Enter") { const ranges = selectedPriceLabels.map(lbl => { const g = priceGroups.find(pg => pg.label === lbl); return { min: g?.min, max: g?.max }; }).filter(r => typeof r.min !== "undefined" || typeof r.max !== "undefined"); onApply?.({ makes: selectedMakes, priceMin: typeof rangeMin === "number" ? rangeMin : undefined, priceMax: typeof rangeMax === "number" ? rangeMax : undefined, priceRanges: ranges, body: selectedBody, fuel: selectedFuel, drive: selectedDrive, transmission: selectedTransmission, query: (search || "").trim() || undefined }); setShowSuggest(false); } }}
              />
            </div>
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
                    <button key={lbl} className={styles.suggestItem} onClick={() => { const ranges = selectedPriceLabels.map(slbl => { const g = priceGroups.find(pg => pg.label === slbl); return { min: g?.min, max: g?.max }; }).filter(r => typeof r.min !== "undefined" || typeof r.max !== "undefined"); setSearch(lbl); setShowSuggest(false); onApply?.({ makes: selectedMakes, priceMin: typeof rangeMin === "number" ? rangeMin : undefined, priceMax: typeof rangeMax === "number" ? rangeMax : undefined, priceRanges: ranges, body: selectedBody, fuel: selectedFuel, drive: selectedDrive, transmission: selectedTransmission, query: lbl }); }}>
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
                  setSelectedEffLabels([]);
                }}
              >
                {ft}
              </button>
            ))}
          </div>
        </FilterSection>
        {effUnit ? (
          <FilterSection title="Fuel Efficiency (MPG / MPGe)" active={selectedEffLabels.length > 0}>
            <div className={styles.tagCloud}>
              {effGroups.map(g => (
                <button
                  key={g.label}
                  className={`${styles.pill} ${selectedEffLabels.includes(g.label) ? styles.pillActive : ""}`}
                  onClick={() => {
                    setSelectedEffLabels(prev => prev.includes(g.label) ? prev.filter(x => x !== g.label) : [...prev, g.label]);
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </FilterSection>
        ) : null}
        <FilterSection title="Drive type" active={selectedDrive.length > 0}>
          <div className={styles.tagCloud}>
            {driveTypes.map(dt => (
              <button
                key={dt}
                className={`${styles.pill} ${selectedDrive.includes(dt) ? styles.pillActive : ""}`}
                onClick={() => {
                  setSelectedDrive(prev => prev.includes(dt) ? prev.filter(x => x !== dt) : [...prev, dt]);
                }}
              >
                {dt}
              </button>
            ))}
          </div>
        </FilterSection>
        <FilterSection title="Transmission" active={selectedTransmission.length > 0}>
          <div className={styles.tagCloud}>
            {transmissionTypes.map(tt => (
              <button
                key={tt}
                className={`${styles.pill} ${selectedTransmission.includes(tt) ? styles.pillActive : ""}`}
                onClick={() => {
                  setSelectedTransmission(prev => prev.includes(tt) ? prev.filter(x => x !== tt) : [...prev, tt]);
                }}
              >
                {tt}
              </button>
            ))}
          </div>
        </FilterSection>
        <FilterSection title="Cylinders" active={selectedCylinders.length > 0}>
          <div className={styles.tagCloud}>
            {cylinderCounts.map(cc => (
              <button
                key={cc}
                className={`${styles.pill} ${selectedCylinders.includes(cc) ? styles.pillActive : ""}`}
                onClick={() => {
                  setSelectedCylinders(prev => prev.includes(cc) ? prev.filter(x => x !== cc) : [...prev, cc]);
                }}
              >
                {cc}
              </button>
            ))}
          </div>
        </FilterSection>
        <div className={styles.actionRow}>
          <Button className={`${styles.actionBtn} ${styles.actionSecondary}`} fillMode="solid" themeColor="base" onClick={() => { setSelectedMakes([]); setSelectedBody([]); setSelectedFuel([]); setSelectedDrive([]); setSelectedTransmission([]); setSelectedCylinders([]); setSelectedPriceLabels([]); setSelectedEffLabels([]); setSearch(""); setShowSuggest(false); setRangeMin(priceMin); setRangeMax(priceMax); onApply?.({ makes: [], priceMin: priceMin, priceMax: priceMax, priceRanges: [], body: [], fuel: [], drive: [], transmission: [], cylinders: [], query: undefined }); }}>Reset</Button>
          <Button className={`${styles.actionBtn} ${styles.actionPrimary}`} fillMode="solid" themeColor="primary" onClick={() => {
            const ranges = selectedPriceLabels.map(lbl => {
              const g = priceGroups.find(pg => pg.label === lbl);
              return { min: g?.min, max: g?.max };
            }).filter(r => typeof r.min !== "undefined" || typeof r.max !== "undefined");
            const effSelected = selectedEffLabels.map(lbl => {
              const g = effGroups.find(x => x.label === lbl);
              return { min: g?.min, max: g?.max };
            }).filter(r => typeof r.min !== "undefined" || typeof r.max !== "undefined");
            const effRanges = (effGroups.length > 0 && selectedEffLabels.length >= effGroups.length) ? [] : effSelected;
            onApply?.({ makes: selectedMakes, priceMin: typeof rangeMin === "number" ? rangeMin : undefined, priceMax: typeof rangeMax === "number" ? rangeMax : undefined, priceRanges: ranges, body: selectedBody, fuel: selectedFuel, drive: selectedDrive, transmission: selectedTransmission, cylinders: selectedCylinders, efficiencyUnit: effUnit, efficiencyRanges: effRanges, query: search.trim() || undefined });
          }}>Apply</Button>
        </div>
      </div>
      )}
    </div>
  );
}
