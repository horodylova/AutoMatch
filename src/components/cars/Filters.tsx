"use client";
import { useEffect, useRef, useState } from "react";
import { Input, Checkbox, Switch, NumericTextBox } from "@progress/kendo-react-inputs";
import { ButtonGroup, Button } from "@progress/kendo-react-buttons";
import FilterSection from "./FilterSection";
import styles from "./cars.module.css";
import { fetchDataset, getMakes, getPriceStats } from "@/lib/dataset";

export default function Filters() {
  const [makes, setMakes] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(0);
  const [rangeMin, setRangeMin] = useState<number>(0);
  const [rangeMax, setRangeMax] = useState<number>(0);
  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [showSuggest, setShowSuggest] = useState<boolean>(false);
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    const run = async () => {
      const ds = await fetchDataset();
      setMakes(getMakes(ds));
      const stats = getPriceStats(ds);
      setPriceMin(stats.min);
      setPriceMax(stats.max);
      setRangeMin(stats.min);
      setRangeMax(stats.max);
    };
    run();
  }, []);
  
  return (
    <div className={styles.panel}>

      <div className={styles.panelBody}>
        <FilterSection title="Search">
          <div className={styles.searchWrap}>
            <Input
              placeholder="Search make, model, trim"
              value={search}
              onChange={(e) => { setSearch(String(e.value || "")); setShowSuggest(true); }}
              onFocus={() => setShowSuggest(true)}
            />
            {showSuggest && search && (
              <div className={styles.suggestList}>
                {makes.filter(m => m.toLowerCase().includes(search.toLowerCase())).slice(0, 8).map(m => (
                  <button
                    key={m}
                    className={styles.suggestItem}
                    onClick={() => { setSelectedMakes(prev => prev.includes(m) ? prev : [...prev, m]); setSearch(""); setShowSuggest(false); }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
        </FilterSection>
        <FilterSection title="Price">
          <div className={styles.priceRowUI}>
            <div className={styles.priceBadges}>
              <span className={styles.priceBadge}>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(priceMin || 0)}</span>
              <span className={styles.priceBadge}>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(priceMax || 0)}</span>
              <div className={styles.priceGroup}>
                <ButtonGroup>
                  <Button onClick={() => { setRangeMin(priceMin); setRangeMax(priceMax); }}>All</Button>
                  <Button onClick={() => { setRangeMin(priceMin); setRangeMax(priceMin); }}>Cheapest</Button>
                  <Button onClick={() => { setRangeMin(priceMax); setRangeMax(priceMax); }}>Most expensive</Button>
                </ButtonGroup>
              </div>
            </div>
            <div className={styles.priceInputs}>
              <NumericTextBox value={rangeMin} onChange={(e) => setRangeMin(Number(e.value))} format="c0" placeholder="Min" />
              <NumericTextBox value={rangeMax} onChange={(e) => setRangeMax(Number(e.value))} format="c0" placeholder="Max" />
            </div>
            <div className={styles.priceNote}>Based on Base MSRP</div>
          </div>
        </FilterSection>
        <FilterSection title="Make">
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
        <FilterSection title="Body type">
          <Checkbox label="Sedan" />
          <Checkbox label="SUV" />
          <Checkbox label="Truck" />
          <Checkbox label="Coupe" />
        </FilterSection>
        <FilterSection title="Fuel">
          <Checkbox label="Gasoline" />
          <Checkbox label="Diesel" />
          <Checkbox label="Hybrid" />
          <Checkbox label="Electric" />
        </FilterSection>
        <FilterSection title="New only">
          <Switch />
        </FilterSection>
        <div style={{ display: "flex", gap: 8 }}>
          <Button themeColor="primary">Apply</Button>
          <Button onClick={() => { setSelectedMakes([]); setSearch(""); setShowSuggest(false); }}>Reset</Button>
        </div>
      </div>
    </div>
  );
}
