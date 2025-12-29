"use client";

import { useState, useEffect } from "react";
import { Dataset, Row } from "@/lib/dataset";
import { CarSpecs, parseCarData } from "@/utils/carScoring";
import styles from "../../app/compare/compare.module.css";

type Props = {
  dataset: Dataset | null;
  onSelect: (car: CarSpecs) => void;
  placeholder?: string;
};

export default function CompareSearch({ dataset, onSelect, placeholder = "Search make, model..." }: Props) {
  const [search, setSearch] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestions, setSuggestions] = useState<Row[]>([]);

  useEffect(() => {
    if (!search || !dataset) {
      setSuggestions([]);
      return;
    }

    const tokens = search.toLowerCase().split(/\s+/).filter(Boolean);
    const mkIdx = dataset.idx["make"] ?? -1;
    const mdIdx = dataset.idx["model"] ?? -1;
    const yrIdx = dataset.idx["year"] ?? -1;
    const trIdx = dataset.idx["trim"] ?? -1;

    const matches: Row[] = [];
    // Limit to 50 suggestions to include older models
    for (const r of dataset.rows) {
      if (matches.length >= 50) break;

      const mk = mkIdx >= 0 ? String(r[mkIdx] ?? "").trim() : "";
      const md = mdIdx >= 0 ? String(r[mdIdx] ?? "").trim() : "";
      const tr = trIdx >= 0 ? String(r[trIdx] ?? "").trim() : "";
      const yr = yrIdx >= 0 ? String(r[yrIdx] ?? "").trim() : "";
      
      const hay = `${mk} ${md} ${tr} ${yr}`.toLowerCase();
      const ok = tokens.every(t => hay.includes(t));
      
      if (ok) {
        matches.push(r);
      }
    }
    setSuggestions(matches);
  }, [search, dataset]);

  const handleSelect = (row: Row) => {
    if (!dataset) return;
    const car = parseCarData(row, dataset.idx);
    onSelect(car);
    setSearch("");
    setShowSuggest(false);
  };

  const getCarLabel = (r: Row) => {
    if (!dataset) return "";
    const mk = String(r[dataset.idx["make"] ?? -1] ?? "");
    const md = String(r[dataset.idx["model"] ?? -1] ?? "");
    const tr = String(r[dataset.idx["trim"] ?? -1] ?? "");
    const yr = String(r[dataset.idx["year"] ?? -1] ?? "");
    return `${yr} ${mk} ${md} ${tr}`;
  };

  return (
    <div className={styles.searchWrap}>
      <div className={styles.searchBar}>
        <svg 
          className={styles.searchIcon} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          className={styles.searchField}
          placeholder={placeholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowSuggest(true);
          }}
          onFocus={() => setShowSuggest(true)}
          // Close on blur with delay to allow click
          onBlur={() => setTimeout(() => setShowSuggest(false), 200)}
        />
      </div>
      
      {showSuggest && suggestions.length > 0 && (
        <div className={styles.suggestList}>
          {suggestions.map((row, i) => (
            <button
              key={i}
              className={styles.suggestItem}
              onClick={() => handleSelect(row)}
            >
              {getCarLabel(row)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
