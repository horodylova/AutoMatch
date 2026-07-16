import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const PAGE_SIZE = 50;

type PriceRange = { min?: number; max?: number };
type Cursor = { make: string; model: string } | null;

const PRICE_SQL = `NULLIF(REGEXP_REPLACE(COALESCE("Base MSRP"::text, ''), '[^0-9.]', '', 'g'), '')::numeric`;
const YEAR_SQL = `NULLIF(REGEXP_REPLACE(COALESCE("Year"::text, ''), '[^0-9]', '', 'g'), '')::int`;
const SEARCH_SQL = `LOWER(CONCAT_WS(' ', COALESCE("Make"::text, ''), COALESCE("Model"::text, ''), COALESCE("Trim"::text, ''), COALESCE("Year"::text, '')))`;
const IMAGE_SQL = `COALESCE("Image URL"::text, '')`;
const FUEL_SQL = `LOWER(COALESCE("Fuel type"::text, ''))`;
const TRANS_SQL = `LOWER(REGEXP_REPLACE(COALESCE("Transmission"::text, ''), '\\m\\d+\\s*-?\\s*speed\\s*', '', 'g'))`;

function normalizeList(values: string[]): string[] {
  return values.map((value) => value.trim()).filter(Boolean);
}

function parseNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parsePriceRanges(values: string[]): PriceRange[] {
  return values
    .map((value) => value.split(":"))
    .map(([rawMin, rawMax]) => ({ min: parseNumber(rawMin ?? null), max: parseNumber(rawMax ?? null) }))
    .filter((range) => typeof range.min === "number" || typeof range.max === "number");
}

function parseCursor(value: string | null): Cursor {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<Cursor>;
    if (!parsed || typeof parsed.make !== "string" || typeof parsed.model !== "string") return null;
    return { make: parsed.make, model: parsed.model };
  } catch {
    return null;
  }
}

function encodeCursor(cursor: Cursor): string | null {
  if (!cursor) return null;
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

function sqlQuote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function andAll(parts: string[]): string {
  return parts.length > 0 ? parts.map((part) => `(${part})`).join(" AND ") : "TRUE";
}

function orAll(parts: string[]): string {
  return parts.length > 0 ? parts.map((part) => `(${part})`).join(" OR ") : "FALSE";
}

function buildWhere(searchParams: URLSearchParams): string {
  const makes = normalizeList(searchParams.getAll("make"));
  const body = normalizeList(searchParams.getAll("body"));
  const fuel = normalizeList(searchParams.getAll("fuel"));
  const drive = normalizeList(searchParams.getAll("drive"));
  const transmission = normalizeList(searchParams.getAll("transmission"));
  const cylinders = normalizeList(searchParams.getAll("cylinders"));
  const priceMin = parseNumber(searchParams.get("priceMin"));
  const priceMax = parseNumber(searchParams.get("priceMax"));
  const priceRanges = parsePriceRanges(searchParams.getAll("priceRange"));
  const queryTokens = normalizeList((searchParams.get("query") || "").toLowerCase().split(/\s+/));

  const where: string[] = [];

  if (makes.length > 0) {
    where.push(`LOWER(COALESCE("Make"::text, '')) IN (${makes.map((value) => sqlQuote(value.toLowerCase())).join(", ")})`);
  }

  if (typeof priceMin === "number" || typeof priceMax === "number") {
    const rangeParts: string[] = [];
    if (typeof priceMin === "number") rangeParts.push(`${PRICE_SQL} >= ${priceMin}`);
    if (typeof priceMax === "number") rangeParts.push(`${PRICE_SQL} <= ${priceMax}`);
    where.push(andAll(rangeParts));
  }

  if (priceRanges.length > 0) {
    where.push(
      orAll(priceRanges.map((range) => {
        const rangeParts: string[] = [];
        if (typeof range.min === "number") rangeParts.push(`${PRICE_SQL} >= ${range.min}`);
        if (typeof range.max === "number") rangeParts.push(`${PRICE_SQL} <= ${range.max}`);
        return andAll(rangeParts);
      }))
    );
  }

  if (body.length > 0) {
    where.push(`LOWER(COALESCE("Body type"::text, '')) IN (${body.map((value) => sqlQuote(value.toLowerCase())).join(", ")})`);
  }

  if (fuel.length > 0) {
    const fuelConditions = fuel.map((value) => {
      const label = value.toLowerCase();
      if (label === "electric") {
        return `${FUEL_SQL} LIKE '%electric%' OR ${FUEL_SQL} LIKE '%bev%'`;
      }
      if (label === "hydrogen") {
        return `${FUEL_SQL} LIKE '%hydrogen%'`;
      }
      if (label === "diesel") {
        return `${FUEL_SQL} LIKE '%diesel%'`;
      }
      if (label === "hybrid") {
        return `${FUEL_SQL} LIKE '%hybrid%' OR ${FUEL_SQL} LIKE '%plug-in%' OR ${FUEL_SQL} LIKE '%phev%'`;
      }
      if (label === "flex-fuel") {
        return `${FUEL_SQL} LIKE '%flex%' OR ${FUEL_SQL} LIKE '%e85%'`;
      }
      if (label === "gasoline") {
        return `(${FUEL_SQL} LIKE '%gasoline%' OR ${FUEL_SQL} LIKE '%petrol%' OR ${FUEL_SQL} LIKE '%unleaded%')
          AND ${FUEL_SQL} NOT LIKE '%hybrid%'
          AND ${FUEL_SQL} NOT LIKE '%plug-in%'
          AND ${FUEL_SQL} NOT LIKE '%phev%'
          AND ${FUEL_SQL} NOT LIKE '%flex%'
          AND ${FUEL_SQL} NOT LIKE '%e85%'`;
      }
      return `${FUEL_SQL} LIKE ${sqlQuote(`%${label}%`)}`;
    });
    where.push(orAll(fuelConditions));
  }

  if (drive.length > 0) {
    where.push(`LOWER(COALESCE("Drive type"::text, '')) IN (${drive.map((value) => sqlQuote(value.toLowerCase())).join(", ")})`);
  }

  if (transmission.length > 0) {
    const transmissionConditions = transmission.map((value) => {
      const label = value.toLowerCase();
      const automatic = `${TRANS_SQL} LIKE '%automatic%' OR ${TRANS_SQL} LIKE '%direct drive%' OR ${TRANS_SQL} LIKE '%cvt%'`;
      const manual = `${TRANS_SQL} LIKE '%manual%'`;
      const mixed = `${TRANS_SQL} LIKE '%automated%' OR ${TRANS_SQL} LIKE '%dual%' OR ${TRANS_SQL} LIKE '%semi%' OR ${TRANS_SQL} LIKE '%sequential%' OR ((${automatic}) AND (${manual}))`;
      if (label === "manual") {
        return `(${manual}) AND NOT (${mixed}) AND NOT (${automatic})`;
      }
      if (label === "mixed") {
        return mixed;
      }
      return `(${automatic}) AND NOT (${mixed})`;
    });
    where.push(orAll(transmissionConditions));
  }

  if (cylinders.length > 0) {
    where.push(`LOWER(COALESCE("Cylinders"::text, '')) IN (${cylinders.map((value) => sqlQuote(value.toLowerCase())).join(", ")})`);
  }

  if (queryTokens.length > 0) {
    where.push(andAll(queryTokens.map((token) => `${SEARCH_SQL} LIKE ${sqlQuote(`%${token}%`)}`)));
  }

  return andAll(where);
}

function buildBaseCte(whereSql: string): string {
  return `
    WITH filtered AS (
      SELECT
        "ID"::text AS id,
        "Make"::text AS make,
        "Model"::text AS model,
        "Trim"::text AS trim,
        "Trim (description)"::text AS trim_description,
        "Image URL"::text AS image_url,
        "Engine size (L)"::text AS engine_size,
        "Horsepower (hp)"::text AS horsepower,
        "Total seating"::text AS total_seating,
        ${YEAR_SQL} AS year_num,
        ${PRICE_SQL} AS price_num,
        COUNT(*) OVER (PARTITION BY "Make", "Model")::int AS version_count
      FROM teo.teo_cars
      WHERE ${whereSql}
    ),
    photo_eligible AS (
      SELECT *
      FROM filtered
      WHERE ${IMAGE_SQL} <> ''
        AND ${IMAGE_SQL} NOT ILIKE '%placeholder%'
        AND ${IMAGE_SQL} NOT ILIKE '%no-image-available%'
        AND ${IMAGE_SQL} NOT ILIKE '%hold tight%'
    ),
    grouped AS (
      SELECT DISTINCT ON (make, model)
        id,
        make,
        model,
        trim,
        trim_description,
        image_url,
        BTRIM(SPLIT_PART(image_url, ';', 1)) AS primary_image_url,
        year_num,
        price_num,
        engine_size,
        horsepower,
        total_seating,
        version_count
      FROM photo_eligible
      ORDER BY make, model, year_num DESC NULLS LAST, price_num ASC NULLS LAST, id ASC
    ),
    deduped AS (
      SELECT DISTINCT ON (primary_image_url)
        id,
        make,
        model,
        trim,
        trim_description,
        primary_image_url,
        year_num,
        price_num,
        engine_size,
        horsepower,
        total_seating,
        version_count
      FROM grouped
      ORDER BY primary_image_url, make, model
    )
  `;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = parseCursor(searchParams.get("cursor"));
    const whereSql = buildWhere(searchParams);
    const baseCte = buildBaseCte(whereSql);
    const cursorSql = cursor
      ? `WHERE (make > ${sqlQuote(cursor.make)} OR (make = ${sqlQuote(cursor.make)} AND model > ${sqlQuote(cursor.model)}))`
      : "";

    const countQuery = `
      ${baseCte}
      SELECT COUNT(*)::int AS total_groups
      FROM deduped
    `;

    const itemsQuery = `
      ${baseCte}
      SELECT
        id,
        make,
        model,
        trim,
        trim_description,
        primary_image_url,
        year_num,
        price_num,
        engine_size,
        horsepower,
        total_seating,
        version_count
      FROM deduped
      ${cursorSql}
      ORDER BY make, model
      LIMIT ${PAGE_SIZE + 1}
    `;

    const countRows = (await prisma.$queryRawUnsafe(countQuery)) as Array<{ total_groups: number }>;
    const [{ total_groups: totalGroups = 0 } = { total_groups: 0 }] = countRows;

    const rows = (await prisma.$queryRawUnsafe(itemsQuery)) as Array<{
      id: string;
      make: string;
      model: string;
      trim: string | null;
      trim_description: string | null;
      primary_image_url: string;
      year_num: number | null;
      price_num: number | string | null;
      engine_size: string | null;
      horsepower: string | null;
      total_seating: string | null;
      version_count: number;
    }>;

    const hasMore = rows.length > PAGE_SIZE;
    const pageRows = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
    const lastItem = hasMore ? pageRows[pageRows.length - 1] : null;

    return NextResponse.json({
      items: pageRows.map((row: {
        id: string;
        make: string;
        model: string;
        trim: string | null;
        trim_description: string | null;
        primary_image_url: string;
        year_num: number | null;
        price_num: number | string | null;
        engine_size: string | null;
        horsepower: string | null;
        total_seating: string | null;
        version_count: number;
      }) => ({
        id: row.id,
        make: row.make,
        model: row.model,
        trim: row.trim || row.trim_description || "",
        year: row.year_num,
        price: row.price_num == null ? null : Number(row.price_num),
        imageUrl: row.primary_image_url,
        specs: {
          engine: row.engine_size || "",
          hp: row.horsepower || "",
          seats: row.total_seating || "",
        },
        versionCount: row.version_count,
      })),
      nextCursor: lastItem ? encodeCursor({ make: lastItem.make, model: lastItem.model }) : null,
      totalGroups,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
