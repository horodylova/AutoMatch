"use client";

import { useState, useEffect } from "react";
import { Row } from "@/lib/dataset";
import { CarSpecs, parseCarData } from "@/utils/carScoring";
import styles from "../../app/compare/compare.module.css";

type Suggestion = {
  id: string;
  label: string;
};

type Props = {
  onSelect: (car: CarSpecs) => void;
  placeholder?: string;
};

export default function CompareSearch({ onSelect, placeholder = "Search make, model..." }: Props) {
  const [search, setSearch] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = search.trim();
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({ q: term, pageSize: "20" });
      fetch(`/api/catalog/list?${params.toString()}`, { signal: controller.signal })
        .then(response => (response.ok ? response.json() : null))
        .then(payload => {
          if (!active || !payload?.items) return;
          setSuggestions(
            payload.items.map((item: {
              id: string;
              make: string;
              model: string;
              trim: string | null;
              year: number;
            }) => ({
              id: item.id,
              label: [item.year, item.make, item.model, item.trim].filter(Boolean).join(" "),
            }))
          );
        })
        .catch(() => {})
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [search]);

  const handleSelect = async (id: string) => {
    try {
      const response = await fetch(`/api/catalog/car/${encodeURIComponent(id)}`);
      if (!response.ok) return;
      const payload = await response.json();
      const row = payload?.data?.row as Row | undefined;
      const idx = payload?.data?.idx as Record<string, number> | undefined;
      if (!row || !idx) return;
      onSelect(parseCarData(row, idx));
      setSearch("");
      setShowSuggest(false);
    } catch {
      // selection failed, leave the field as is
    }
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
          onBlur={() => setTimeout(() => setShowSuggest(false), 200)}
        />
      </div>

      {showSuggest && (loading || suggestions.length > 0) && (
        <div className={styles.suggestList}>
          {loading && suggestions.length === 0 && (
            <div className={styles.suggestItem}>Searching…</div>
          )}
          {suggestions.map(suggestion => (
            <button
              key={suggestion.id}
              className={styles.suggestItem}
              onClick={() => handleSelect(suggestion.id)}
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
