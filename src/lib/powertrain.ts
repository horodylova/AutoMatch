import { Prisma } from "@prisma/client";

export type PowertrainLabel =
  | "Gasoline"
  | "Electric"
  | "Hybrid"
  | "Plug-in Hybrid"
  | "Diesel"
  | "Flex-fuel"
  | "Hydrogen";

export const POWERTRAIN_ORDER: PowertrainLabel[] = [
  "Gasoline",
  "Hybrid",
  "Plug-in Hybrid",
  "Electric",
  "Diesel",
  "Flex-fuel",
  "Hydrogen",
];

const ENGINE_TO_LABEL: Record<string, PowertrainLabel> = {
  "gas": "Gasoline",
  "mild hybrid": "Hybrid",
  "hybrid": "Hybrid",
  "plug-in hybrid": "Plug-in Hybrid",
  "electric": "Electric",
  "electric (fuel cell)": "Hydrogen",
  "diesel": "Diesel",
  "flex-fuel (ffv)": "Flex-fuel",
};

export function labelForEngine(engineName: string | null | undefined): PowertrainLabel | null {
  if (!engineName) return null;
  return ENGINE_TO_LABEL[engineName.trim().toLowerCase()] ?? null;
}

export function enginesForLabel(label: string): string[] {
  const target = label.trim().toLowerCase();
  return Object.entries(ENGINE_TO_LABEL)
    .filter(([, value]) => value.toLowerCase() === target)
    .map(([key]) => key);
}

export function powertrainWhere(labels: string[]): Prisma.CatalogCarWhereInput | null {
  if (!labels.length) return null;
  const engines = labels.flatMap(enginesForLabel);
  if (!engines.length) return null;
  return { engineType: { name: { in: engines, mode: "insensitive" } } };
}

export function groupPowertrainCounts(
  rows: { name: string; count: number }[]
): { name: PowertrainLabel; count: number }[] {
  const totals = new Map<PowertrainLabel, number>();
  for (const row of rows) {
    const label = labelForEngine(row.name);
    if (!label) continue;
    totals.set(label, (totals.get(label) ?? 0) + row.count);
  }
  return POWERTRAIN_ORDER.filter(label => (totals.get(label) ?? 0) > 0).map(label => ({
    name: label,
    count: totals.get(label) as number,
  }));
}
