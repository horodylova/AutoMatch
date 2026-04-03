import { Row, ScoredCar, parseCarData } from "./carScoring";

export type BudgetBand =
  | "under_35"
  | "35_60"
  | "60_120"
  | "120_200"
  | "200_350"
  | "350_plus"
  | "no_strict";

function bounds(b: BudgetBand): { min?: number; max?: number; mid?: number } {
  if (b === "under_35") return { max: 35000, mid: 30000 };
  if (b === "35_60") return { min: 35000, max: 60000, mid: 47500 };
  if (b === "60_120") return { min: 60000, max: 120000, mid: 90000 };
  if (b === "120_200") return { min: 120000, max: 200000, mid: 160000 };
  if (b === "200_350") return { min: 200000, max: 350000, mid: 275000 };
  if (b === "350_plus") return { min: 350000, mid: 420000 };
  return {};
}

export function buildInitialCandidates(
  rows: Row[],
  idx: Record<string, number>,
  budget: BudgetBand,
  includeUpcoming: boolean,
  cap = 1000
) {
  const cars = rows.map(r => parseCarData(r, idx));
  const yearLimit = includeUpcoming ? undefined : 2024;
  const { min, max, mid } = bounds(budget);
  const inBand = (price: number) => {
    if (typeof min === "number" && price < min) return false;
    if (typeof max === "number" && price > max) return false;
    return true;
  };
  const filtered = cars.filter(c => {
    if (!c.image || c.image.includes("no-image-available") || c.image.includes("placeholder")) return false;
    if (yearLimit && c.year > yearLimit) return false;
    if (budget === "no_strict") return true;
    const p = c.baseMsrp || 0;
    if (p <= 0) return false;
    return inBand(p);
  });
  const scored = filtered.map(c => {
    const p = c.baseMsrp || 0;
    let s = 0;
    if (budget === "no_strict") {
      s = (c.year || 0) * 2 - p * 0.0001;
    } else if (typeof mid === "number" && p > 0) {
      const d = Math.abs(p - mid);
      s = -d;
    } else {
      s = -(p || 0);
    }
    return { car: c, matchScore: s } as ScoredCar;
  });
  scored.sort((a, b) => b.matchScore - a.matchScore);
  const seen = new Set<string>();
  const unique = scored.filter(s => {
    const key = `${s.car.make.trim().toLowerCase()}|${s.car.model.trim().toLowerCase()}|${s.car.year}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return unique.slice(0, cap).map(s => s.car);
}
