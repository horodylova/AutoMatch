import { NextRequest, NextResponse } from "next/server";
import { matchCars, QuizFilters } from "@/utils/carScoring";
import { loadCatalogCars } from "@/lib/catalog-server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const preferences = body?.preferences as Record<string, number> | undefined;
    const filters = (body?.filters ?? {}) as QuizFilters;
    const limit = Math.min(Math.max(Number(body?.limit) || 24, 1), 100);
    const primaryIds: string[] = Array.isArray(body?.primaryIds) ? body.primaryIds.filter(Boolean) : [];

    if (!preferences || typeof preferences !== "object") {
      return NextResponse.json({ error: "Missing preferences" }, { status: 400 });
    }

    const parsed = await loadCatalogCars();
    const validCars = parsed.filter(c => c.image && c.image !== "/placeholder-car.jpg");

    const primarySet = new Set(primaryIds);
    const primaryPool = primaryIds.length > 0
      ? validCars.filter(c => primarySet.has(c.id))
      : validCars;

    const matchesPrimary = matchCars(primaryPool, preferences as never, filters);
    let scored = matchesPrimary;

    if (matchesPrimary.length < 12) {
      const allMatches = matchCars(validCars, preferences as never, filters);
      const seen = new Set(matchesPrimary.map(m => m.car.id));
      scored = [...matchesPrimary, ...allMatches.filter(m => !seen.has(m.car.id))];
    }

    const response = NextResponse.json({
      items: scored.slice(0, limit),
      total: scored.length,
      pool: validCars.length,
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
