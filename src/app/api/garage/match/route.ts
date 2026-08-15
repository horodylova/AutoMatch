import { NextResponse } from "next/server";
import { buildGarageMatch } from "@/utils/dream-garage";
import { hasRealImage } from "@/utils/carScoring";
import { loadCatalogCars } from "@/lib/catalog-server";
import type { DreamGarageBay } from "@/types/dream-garage";

function isRole(value: string): value is DreamGarageBay["role"] {
  return ["daily", "hauler", "thrill", "statement", "explorer", "project"].includes(value);
}

function parseBays(value: unknown): DreamGarageBay[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      const record = item as Record<string, unknown>;
      const role = String(record.role ?? "");
      const allocationPct = Number(record.allocationPct ?? 0);
      const id = String(record.id ?? `bay-${index + 1}`);
      if (!isRole(role) || !Number.isFinite(allocationPct)) return null;
      return {
        id,
        role,
        allocationPct,
      };
    })
    .filter((bay): bay is DreamGarageBay => Boolean(bay));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      totalBudget?: number;
      bays?: unknown;
    };

    const totalBudget = Number(body.totalBudget ?? 0);
    const bays = parseBays(body.bays);

    if (!Number.isFinite(totalBudget) || totalBudget <= 0) {
      return NextResponse.json({ error: "Invalid total budget." }, { status: 400 });
    }

    if (bays.length < 2 || bays.length > 5) {
      return NextResponse.json({ error: "Dream Garage needs between 2 and 5 bays." }, { status: 400 });
    }

    const cars = (await loadCatalogCars()).filter(car => car.id && car.baseMsrp > 0 && hasRealImage(car));
    const response = buildGarageMatch(cars, totalBudget, bays);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
