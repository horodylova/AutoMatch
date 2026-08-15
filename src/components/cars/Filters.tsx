"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import FilterSection from "./FilterSection";
import styles from "./cars.module.css";
import { CatalogFacets, fetchCatalogFacets } from "@/lib/catalog-client";

export type FiltersData = {
  makes: string[];
  priceMin?: number;
  priceMax?: number;
  priceRanges?: { min?: number; max?: number }[];
  body?: string[];
  powertrains?: string[];
  fuel?: string[];
  drive?: string[];
  transmission?: string[];
  cylinders?: string[];
  efficiencyUnit?: "mpg" | "mpge";
  efficiencyRanges?: { min?: number; max?: number }[];
  query?: string;
};

type Band = { label: string; min?: number; max?: number };

const PRICE_BANDS: Band[] = [
  { label: "Under $20,000", min: 0, max: 20000 },
  { label: "$20k–$35k", min: 20000, max: 35000 },
  { label: "$35k–$50k", min: 35000, max: 50000 },
  { label: "$50k–$75k", min: 50000, max: 75000 },
  { label: "$75k–$120k", min: 75000, max: 120000 },
  { label: "$120k–$200k", min: 120000, max: 200000 },
  { label: "$200k–$350k", min: 200000, max: 350000 },
  { label: "$350k–$500k", min: 350000, max: 500000 },
  { label: "$500k+", min: 500000 },
];

const MPG_BANDS: Band[] = [
  { label: "Under 20 MPG", min: 0, max: 20 },
  { label: "20–30 MPG", min: 20, max: 30 },
  { label: "30–40 MPG", min: 30, max: 40 },
  { label: "40+ MPG", min: 40 },
];

const MPGE_BANDS: Band[] = [
  { label: "Under 80 MPGe", min: 0, max: 80 },
  { label: "80–100 MPGe", min: 80, max: 100 },
  { label: "100–120 MPGe", min: 100, max: 120 },
  { label: "120+ MPGe", min: 120 },
];

type Props = { onApply?: (f: FiltersData) => void };

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter(v => v !== value) : [...list, value];
}

function bandsToRanges(labels: string[], bands: Band[]): { min?: number; max?: number }[] {
  return labels
    .map(label => bands.find(b => b.label === label))
    .filter((b): b is Band => Boolean(b))
    .map(b => ({ min: b.min, max: b.max }));
}

export default function Filters({ onApply }: Props) {
  const [facets, setFacets] = useState<CatalogFacets | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [selectedBody, setSelectedBody] = useState<string[]>([]);
  const [selectedPowertrain, setSelectedPowertrain] = useState<string[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<string[]>([]);
  const [selectedTransmission, setSelectedTransmission] = useState<string[]>([]);
  const [selectedCylinders, setSelectedCylinders] = useState<string[]>([]);
  const [selectedPriceLabels, setSelectedPriceLabels] = useState<string[]>([]);
  const [selectedEffLabels, setSelectedEffLabels] = useState<string[]>([]);
  const [efficiencyUnit, setEfficiencyUnit] = useState<"mpg" | "mpge">("mpg");
  const [search, setSearch] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchCatalogFacets()
      .then(setFacets)
      .catch(err => setLoadError(err instanceof Error ? err.message : "Failed to load filters"));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      setIsMobile(query.matches);
      setShowFilters(!query.matches);
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  const effBands = efficiencyUnit === "mpge" ? MPGE_BANDS : MPG_BANDS;

  const buildPayload = (overrides: Partial<FiltersData> = {}): FiltersData => ({
    makes: selectedMakes,
    body: selectedBody,
    powertrains: selectedPowertrain,
    drive: selectedDrive,
    transmission: selectedTransmission,
    cylinders: selectedCylinders,
    priceRanges: bandsToRanges(selectedPriceLabels, PRICE_BANDS),
    efficiencyUnit,
    efficiencyRanges: bandsToRanges(selectedEffLabels, effBands),
    query: search.trim() || undefined,
    ...overrides,
  });

  const apply = (overrides: Partial<FiltersData> = {}) => {
    onApply?.(buildPayload(overrides));
    setShowSuggest(false);
  };

  const reset = () => {
    setSelectedMakes([]);
    setSelectedBody([]);
    setSelectedPowertrain([]);
    setSelectedDrive([]);
    setSelectedTransmission([]);
    setSelectedCylinders([]);
    setSelectedPriceLabels([]);
    setSelectedEffLabels([]);
    setSearch("");
    setShowSuggest(false);
    onApply?.({
      makes: [],
      body: [],
      powertrains: [],
      drive: [],
      transmission: [],
      cylinders: [],
      priceRanges: [],
      efficiencyRanges: [],
      query: undefined,
    });
  };

  const suggestions = facets && search.trim().length > 0
    ? facets.makes
        .filter(m => m.name.toLowerCase().includes(search.trim().toLowerCase()))
        .slice(0, 6)
    : [];

  if (loadError) {
    return <div className={styles.filtersPanel}>{loadError}</div>;
  }

  if (!facets) {
    return <div className={styles.filtersPanel}>Loading filters…</div>;
  }

  const chip = (label: string, active: boolean, onClick: () => void, count?: number) => (
    <button
      key={label}
      className={`${styles.pill} ${active ? styles.pillActive : ""}`}
      onClick={onClick}
      title={count !== undefined ? `${count} cars` : undefined}
    >
      {label}
    </button>
  );

  const cloud = (nodes: React.ReactNode) => <div className={styles.tagCloud}>{nodes}</div>;

  return (
    <div className={styles.filtersPanel}>
      {showFilters && (
        <div className={styles.filtersBody}>
          <FilterSection title="Search" active={search.trim().length > 0}>
            <div className={styles.searchWrap}>
              <div className={styles.searchBar}>
                <svg className={styles.searchIcon} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="currentColor" d="M10 2a8 8 0 105.29 14.03l4.34 4.34a1 1 0 001.42-1.42l-4.34-4.34A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z" />
                </svg>
                <input
                  className={styles.searchField}
                  value={search}
                  placeholder="Search make, model, trim"
                  onChange={e => {
                    setSearch(e.target.value);
                    setShowSuggest(true);
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter") apply({ query: search.trim() || undefined });
                  }}
                />
              </div>
              {showSuggest && suggestions.length > 0 && (
                <div className={styles.suggestList}>
                  {suggestions.map(s => (
                    <button
                      key={s.name}
                      className={styles.suggestItem}
                      onClick={() => {
                        setSearch(s.name);
                        apply({ query: s.name });
                      }}
                    >
                      {s.name} <span className={styles.badge}>{s.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </FilterSection>

          <FilterSection title="Price" active={selectedPriceLabels.length > 0}>
            {cloud(PRICE_BANDS.map(b =>
              chip(b.label, selectedPriceLabels.includes(b.label), () =>
                setSelectedPriceLabels(v => toggle(v, b.label))
              )
            ))}
          </FilterSection>

          <FilterSection title="Make" active={selectedMakes.length > 0}>
            {cloud(facets.makes.map(m =>
              chip(m.name, selectedMakes.includes(m.name), () => setSelectedMakes(v => toggle(v, m.name)), m.count)
            ))}
          </FilterSection>

          <FilterSection title="Body type" active={selectedBody.length > 0}>
            {cloud(facets.bodyTypes.map(b =>
              chip(b.name, selectedBody.includes(b.name), () => setSelectedBody(v => toggle(v, b.name)), b.count)
            ))}
          </FilterSection>

          <FilterSection title="Powertrain" active={selectedPowertrain.length > 0}>
            {cloud(facets.powertrains.map(p =>
              chip(p.name, selectedPowertrain.includes(p.name), () =>
                setSelectedPowertrain(v => toggle(v, p.name)), p.count
              )
            ))}
          </FilterSection>

          <FilterSection title="Fuel Efficiency" active={selectedEffLabels.length > 0}>
            <div className={styles.tagCloud}>
              <button
                className={`${styles.pill} ${efficiencyUnit === "mpg" ? styles.pillActive : ""}`}
                onClick={() => {
                  setEfficiencyUnit("mpg");
                  setSelectedEffLabels([]);
                }}
              >
                MPG
              </button>
              <button
                className={`${styles.pill} ${efficiencyUnit === "mpge" ? styles.pillActive : ""}`}
                onClick={() => {
                  setEfficiencyUnit("mpge");
                  setSelectedEffLabels([]);
                }}
              >
                MPGe
              </button>
            </div>
            {cloud(effBands.map(b =>
              chip(b.label, selectedEffLabels.includes(b.label), () =>
                setSelectedEffLabels(v => toggle(v, b.label))
              )
            ))}
          </FilterSection>

          <FilterSection title="Drive type" active={selectedDrive.length > 0}>
            {cloud(facets.driveTypes.map(d =>
              chip(d.name, selectedDrive.includes(d.name), () => setSelectedDrive(v => toggle(v, d.name)), d.count)
            ))}
          </FilterSection>

          <FilterSection title="Transmission" active={selectedTransmission.length > 0}>
            {cloud(facets.transmissions.map(t =>
              chip(t.name, selectedTransmission.includes(t.name), () =>
                setSelectedTransmission(v => toggle(v, t.name)), t.count
              )
            ))}
          </FilterSection>

          <FilterSection title="Cylinders" active={selectedCylinders.length > 0}>
            {cloud(facets.cylinders.map(c =>
              chip(c.name, selectedCylinders.includes(c.name), () =>
                setSelectedCylinders(v => toggle(v, c.name)), c.count
              )
            ))}
          </FilterSection>

        </div>
      )}

      {showFilters && (
        <div className={styles.actionRow}>
          <Button
            className={`${styles.actionBtn} ${styles.actionSecondary}`}
            fillMode="solid"
            themeColor="base"
            onClick={reset}
          >
            Reset
          </Button>
          <Button
            className={`${styles.actionBtn} ${styles.actionPrimary}`}
            fillMode="solid"
            themeColor="primary"
            onClick={() => apply()}
          >
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}
