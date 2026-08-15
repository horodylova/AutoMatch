import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

type BudgetBand =
  | "under_35"
  | "35_60"
  | "60_120"
  | "120_200"
  | "200_350"
  | "350_plus"
  | "no_strict";

function bounds(band: BudgetBand): { min?: number; max?: number; mid?: number } {
  if (band === "under_35") return { max: 35000, mid: 30000 };
  if (band === "35_60") return { min: 35000, max: 60000, mid: 47500 };
  if (band === "60_120") return { min: 60000, max: 120000, mid: 90000 };
  if (band === "120_200") return { min: 120000, max: 200000, mid: 160000 };
  if (band === "200_350") return { min: 200000, max: 350000, mid: 275000 };
  if (band === "350_plus") return { min: 350000, mid: 420000 };
  return {};
}

type CandidateRow = {
  id: string;
  make: string;
  model: string;
  trim: string | null;
  year: number;
  baseMsrp: number | null;
  image: string | null;
  bodyType: string | null;
  seats: number | null;
  horsepower: number | null;
};

function normalizeImage(raw: string | null): string {
  if (!raw) return "/no-image-available.jpg";
  const first = raw.split(/[;,]/).map(s => s.trim()).filter(Boolean)[0];
  if (!first) return "/no-image-available.jpg";
  if (!first.startsWith("/") && !first.startsWith("http")) {
    return `/photos-cars/${encodeURIComponent(first)}`;
  }
  return first.replace(/\s+/g, "%20");
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const budget = (params.get("budget") || "no_strict") as BudgetBand;
    const includeUpcoming = params.get("includeUpcoming") === "true";
    const cap = Math.min(Math.max(Number(params.get("cap")) || 1000, 1), 2000);

    const { min, max, mid } = bounds(budget);

    const conditions: Prisma.Sql[] = [
      Prisma.sql`c."imageUrl" IS NOT NULL AND btrim(c."imageUrl") <> ''`,
      Prisma.sql`c."imageUrl" NOT ILIKE '%no-image-available%'`,
      Prisma.sql`c."imageUrl" NOT ILIKE '%placeholder%'`,
    ];

    if (!includeUpcoming) conditions.push(Prisma.sql`c."year" <= 2024`);

    if (budget !== "no_strict") {
      conditions.push(Prisma.sql`c."basePrice" IS NOT NULL AND c."basePrice" > 0`);
      if (min !== undefined) conditions.push(Prisma.sql`c."basePrice" >= ${min}`);
      if (max !== undefined) conditions.push(Prisma.sql`c."basePrice" <= ${max}`);
    }

    const order =
      budget === "no_strict"
        ? Prisma.sql`ORDER BY ("year" * 2 - COALESCE("baseMsrp", 0) * 0.0001) DESC`
        : mid !== undefined
          ? Prisma.sql`ORDER BY abs(COALESCE("baseMsrp", 0) - ${mid}) ASC`
          : Prisma.sql`ORDER BY COALESCE("baseMsrp", 0) ASC`;

    const rows = await prisma.$queryRaw<CandidateRow[]>(Prisma.sql`
      WITH ranked AS (
        SELECT
          c.id,
          mk.name AS make,
          md.name AS model,
          c.trim,
          c."year",
          c."basePrice" AS "baseMsrp",
          c."imageUrl"  AS image,
          bt.name       AS "bodyType",
          c.seating     AS seats,
          c.horsepower,
          ROW_NUMBER() OVER (
            PARTITION BY lower(btrim(mk.name)), lower(btrim(md.name)), c."year"
            ORDER BY c.id ASC
          ) AS rn
        FROM "CatalogCar" c
        JOIN "Make" mk         ON mk.id = c."makeId"
        JOIN "CatalogModel" md ON md.id = c."modelId"
        LEFT JOIN "BodyType" bt ON bt.id = c."bodyTypeId"
        WHERE ${Prisma.join(conditions, " AND ")}
      )
      SELECT id, make, model, trim, "year", "baseMsrp", image, "bodyType", seats, horsepower
      FROM ranked
      WHERE rn = 1
      ${order}
      LIMIT ${cap}
    `);

    const items = rows.map(row => ({
      id: row.id,
      make: row.make,
      model: row.model,
      trim: row.trim ?? "",
      year: row.year,
      baseMsrp: row.baseMsrp ?? 0,
      image: normalizeImage(row.image),
      bodyType: row.bodyType ?? "",
      seats: row.seats ?? 0,
      horsepower: row.horsepower ?? 0,
    }));

    const response = NextResponse.json({ items, total: items.length });
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=1800");
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
