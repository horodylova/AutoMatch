"use client";
import { useEffect, useRef, useState } from "react";
import { Input, Checkbox, Switch, NumericTextBox } from "@progress/kendo-react-inputs";
import { ButtonGroup, Button } from "@progress/kendo-react-buttons";
import FilterSection from "./FilterSection";
import styles from "./cars.module.css";
import { fetchDataset, getMakes, getPriceStats } from "@/lib/dataset";

export type FiltersData = {
  makes: string[];
  priceMin?: number;
  priceMax?: number;
  body?: string[];
  fuel?: string[];
  newOnly?: boolean;
};

type Props = { onApply?: (f: FiltersData) => void };

export default function Filters({ onApply }: Props) {
  const [makes, setMakes] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(0);
  const [rangeMin, setRangeMin] = useState<number>(0);
  const [rangeMax, setRangeMax] = useState<number>(0);
  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [showSuggest, setShowSuggest] = useState<boolean>(false);
  const [selectedBody, setSelectedBody] = useState<string[]>([]);
  const [selectedFuel, setSelectedFuel] = useState<string[]>([]);
  const [newOnly, setNewOnly] = useState<boolean>(false);
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
          <Checkbox label="Sedan" checked={selectedBody.includes("Sedan")} onChange={(e) => setSelectedBody(prev => e.value ? [...prev, "Sedan"] : prev.filter(x => x !== "Sedan"))} />
          <Checkbox label="SUV" checked={selectedBody.includes("SUV")} onChange={(e) => setSelectedBody(prev => e.value ? [...prev, "SUV"] : prev.filter(x => x !== "SUV"))} />
          <Checkbox label="Truck" checked={selectedBody.includes("Truck")} onChange={(e) => setSelectedBody(prev => e.value ? [...prev, "Truck"] : prev.filter(x => x !== "Truck"))} />
          <Checkbox label="Coupe" checked={selectedBody.includes("Coupe")} onChange={(e) => setSelectedBody(prev => e.value ? [...prev, "Coupe"] : prev.filter(x => x !== "Coupe"))} />
        </FilterSection>
        <FilterSection title="Fuel">
          <Checkbox label="Gasoline" checked={selectedFuel.includes("Gasoline")} onChange={(e) => setSelectedFuel(prev => e.value ? [...prev, "Gasoline"] : prev.filter(x => x !== "Gasoline"))} />
          <Checkbox label="Diesel" checked={selectedFuel.includes("Diesel")} onChange={(e) => setSelectedFuel(prev => e.value ? [...prev, "Diesel"] : prev.filter(x => x !== "Diesel"))} />
          <Checkbox label="Hybrid" checked={selectedFuel.includes("Hybrid")} onChange={(e) => setSelectedFuel(prev => e.value ? [...prev, "Hybrid"] : prev.filter(x => x !== "Hybrid"))} />
          <Checkbox label="Electric" checked={selectedFuel.includes("Electric")} onChange={(e) => setSelectedFuel(prev => e.value ? [...prev, "Electric"] : prev.filter(x => x !== "Electric"))} />
        </FilterSection>
        <FilterSection title="New only">
          <Switch checked={newOnly} onChange={(e) => setNewOnly(Boolean(e.value))} />
        </FilterSection>
        <div style={{ display: "flex", gap: 8 }}>
          <Button themeColor="primary" onClick={() => onApply?.({ makes: selectedMakes, priceMin: rangeMin || undefined, priceMax: rangeMax || undefined, body: selectedBody, fuel: selectedFuel, newOnly })}>Apply</Button>
          <Button onClick={() => { setSelectedMakes([]); setSelectedBody([]); setSelectedFuel([]); setSearch(""); setShowSuggest(false); setRangeMin(priceMin); setRangeMax(priceMax); setNewOnly(false); onApply?.({ makes: [], priceMin: priceMin, priceMax: priceMax, body: [], fuel: [], newOnly: false }); }}>Reset</Button>
        </div>
      </div>
    </div>
  );
}
