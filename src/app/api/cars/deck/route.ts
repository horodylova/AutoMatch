import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { enginesForLabel } from "@/lib/powertrain";

export const runtime = "nodejs";

const PAGE_SIZE = 50;

type GroupedItem = {
  id: string;
  make: string;
  model: string;
  trim: string;
  year: number | null;
  price: number | null;
  imageUrl: string;
  specs: { engine: string; hp: string; seats: string };
  versionCount: number;
};

type DeckRow = {
  id: string;
  make: string;
  model: string;
  trim: string | null;
  trimDescription: string | null;
  year: number;
  price: number | null;
  imageUrl: string | null;
  engineSizeL: number | null;
  horsepower: number | null;
  seating: number | null;
  versionCount: bigint;
};

function values(params: URLSearchParams, key: string): string[] {
  const out: string[] = [];
  for (const raw of params.getAll(key)) {
    for (const part of raw.split(",")) {
      const v = part.trim();
      if (v) out.push(v);
    }
  }
  return out;
}

function toNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

function parseRanges(raw: string[]): { min?: number; max?: number }[] {
  return raw
    .map(v => v.split(":"))
    .map(([lo, hi]) => ({ min: toNumber(lo ?? null), max: toNumber(hi ?? null) }))
    .filter(r => r.min !== undefined || r.max !== undefined);
}

function decodeCursor(value: string | null): { make: string; model: string } | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (typeof parsed?.make !== "string" || typeof parsed?.model !== "string") return null;
    return { make: parsed.make, model: parsed.model };
  } catch {
    return null;
  }
}

function encodeCursor(cursor: { make: string; model: string }): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

function normalizeImage(raw: string | null): string | null {
  if (!raw) return null;
  const first = raw.split(/[;,]/).map(s => s.trim()).filter(Boolean)[0];
  if (!first) return null;
  if (/no-image-available/i.test(first)) return null;
  if (!first.startsWith("/") && !first.startsWith("http")) {
    return `/photos-cars/${encodeURIComponent(first)}`;
  }
  return first.replace(/\s+/g, "%20");
}

function buildConditions(params: URLSearchParams): Prisma.Sql[] {
  const conditions: Prisma.Sql[] = [
    Prisma.sql`c."imageUrl" IS NOT NULL AND btrim(c."imageUrl") <> ''`,
  ];

  const makes = values(params, "make");
  if (makes.length) conditions.push(Prisma.sql`mk.name IN (${Prisma.join(makes)})`);

  const bodies = values(params, "body");
  if (bodies.length) conditions.push(Prisma.sql`bt.name IN (${Prisma.join(bodies)})`);

  const drives = values(params, "drive");
  if (drives.length) conditions.push(Prisma.sql`dt.name IN (${Prisma.join(drives)})`);

  const transmissions = values(params, "transmission");
  if (transmissions.length) conditions.push(Prisma.sql`tr.name IN (${Prisma.join(transmissions)})`);

  const cylinders = values(params, "cylinders");
  if (cylinders.length) conditions.push(Prisma.sql`c.cylinders IN (${Prisma.join(cylinders)})`);

  const fuelLabels = values(params, "fuel").concat(values(params, "powertrain"));
  if (fuelLabels.length) {
    const engines = fuelLabels.flatMap(enginesForLabel);
    if (engines.length) {
      conditions.push(Prisma.sql`lower(et.name) IN (${Prisma.join(engines)})`);
    }
  }

  const priceMin = toNumber(params.get("priceMin"));
  const priceMax = toNumber(params.get("priceMax"));
  if (priceMin !== undefined) conditions.push(Prisma.sql`c."basePrice" >= ${Math.round(priceMin)}`);
  if (priceMax !== undefined) conditions.push(Prisma.sql`c."basePrice" <= ${Math.round(priceMax)}`);

  const bands = parseRanges(values(params, "priceRange"));
  if (bands.length) {
    const parts = bands.map(b => {
      if (b.min !== undefined && b.max !== undefined) {
        return Prisma.sql`(c."basePrice" >= ${Math.round(b.min)} AND c."basePrice" <= ${Math.round(b.max)})`;
      }
      if (b.min !== undefined) return Prisma.sql`(c."basePrice" >= ${Math.round(b.min)})`;
      return Prisma.sql`(c."basePrice" <= ${Math.round(b.max as number)})`;
    });
    conditions.push(Prisma.sql`(${Prisma.join(parts, " OR ")})`);
  }

  const unit = params.get("efficiencyUnit") === "mpge" ? "mpgeCombined" : "mpgCombined";
  const effBands = parseRanges(values(params, "efficiencyRange"));
  if (effBands.length) {
    const column = unit === "mpgeCombined"
      ? Prisma.sql`c."mpgeCombined"`
      : Prisma.sql`c."mpgCombined"`;
    const parts = effBands.map(b => {
      if (b.min !== undefined && b.max !== undefined) {
        return Prisma.sql`(${column} >= ${Math.round(b.min)} AND ${column} <= ${Math.round(b.max)})`;
      }
      if (b.min !== undefined) return Prisma.sql`(${column} >= ${Math.round(b.min)})`;
      return Prisma.sql`(${column} <= ${Math.round(b.max as number)})`;
    });
    conditions.push(Prisma.sql`(${Prisma.join(parts, " OR ")})`);
  }

  const query = (params.get("q") || "").trim();
  if (query) {
    const like = `%${query}%`;
    conditions.push(
      Prisma.sql`(mk.name ILIKE ${like} OR md.name ILIKE ${like} OR c.trim ILIKE ${like})`
    );
  }

  return conditions;
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const cursor = decodeCursor(params.get("cursor"));
    const conditions = buildConditions(params);
    const where = Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`;

    const rows = await prisma.$queryRaw<DeckRow[]>(Prisma.sql`
      WITH filtered AS (
        SELECT
          c.id,
          mk.name       AS make,
          md.name       AS model,
          c.trim,
          s."trimDescription",
          c."year",
          c."basePrice" AS price,
          c."imageUrl",
          s."engineSizeL",
          c.horsepower,
          c.seating,
          ROW_NUMBER() OVER (
            PARTITION BY mk.name, md.name
            ORDER BY c."year" DESC, c."basePrice" ASC NULLS LAST, c.id ASC
          ) AS rn,
          COUNT(*) OVER (PARTITION BY mk.name, md.name) AS "versionCount"
        FROM "CatalogCar" c
        JOIN "Make" mk          ON mk.id = c."makeId"
        JOIN "CatalogModel" md  ON md.id = c."modelId"
        LEFT JOIN "CatalogSpec" s   ON s."carId" = c.id
        LEFT JOIN "BodyType" bt     ON bt.id = c."bodyTypeId"
        LEFT JOIN "DriveType" dt    ON dt.id = c."driveTypeId"
        LEFT JOIN "Transmission" tr ON tr.id = c."transmissionId"
        LEFT JOIN "EngineType" et   ON et.id = c."engineTypeId"
        ${where}
      )
      SELECT * FROM filtered WHERE rn = 1 ORDER BY make ASC, model ASC
    `);

    const seenImages = new Set<string>();
    const grouped: GroupedItem[] = [];

    for (const row of rows) {
      const imageUrl = normalizeImage(row.imageUrl);
      if (!imageUrl || seenImages.has(imageUrl)) continue;
      seenImages.add(imageUrl);
      grouped.push({
        id: row.id,
        make: row.make,
        model: row.model,
        trim: row.trim || row.trimDescription || "",
        year: row.year ?? null,
        price: row.price ?? null,
        imageUrl,
        specs: {
          engine: row.engineSizeL !== null ? String(row.engineSizeL) : "",
          hp: row.horsepower !== null ? String(row.horsepower) : "",
          seats: row.seating !== null ? String(row.seating) : "",
        },
        versionCount: Number(row.versionCount),
      });
    }

    const cursorIndex = cursor
      ? grouped.findIndex(item => item.make === cursor.make && item.model === cursor.model)
      : -1;
    const startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
    const pageItems = grouped.slice(startIndex, startIndex + PAGE_SIZE + 1);
    const hasMore = pageItems.length > PAGE_SIZE;
    const items = hasMore ? pageItems.slice(0, PAGE_SIZE) : pageItems;
    const lastItem = hasMore ? items[items.length - 1] : null;

    return NextResponse.json({
      items,
      nextCursor: lastItem ? encodeCursor({ make: lastItem.make, model: lastItem.model }) : null,
      totalGroups: grouped.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
