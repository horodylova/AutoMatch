import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Row } from "@/lib/dataset";

const PAGE_SIZE = 50;

type PriceRange = { min?: number; max?: number };
type Cursor = { make: string; model: string } | null;
type Filters = {
  makes: string[];
  priceMin?: number;
  priceMax?: number;
  priceRanges: PriceRange[];
  body: string[];
  fuel: string[];
  drive: string[];
  transmission: string[];
  cylinders: string[];
  query?: string;
};

type GroupedItem = {
  id: string;
  make: string;
  model: string;
  trim: string;
  year: number | null;
  price: number | null;
  imageUrl: string;
  specs: {
    engine: string;
    hp: string;
    seats: string;
  };
  versionCount: number;
};

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

function num(v: unknown): number {
  const raw = String(v ?? "").trim();
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function toCell(value: unknown): string | number | boolean | null {
  if (value == null) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  return String(value);
}

function getCell(row: Row, idx: Record<string, number>, key: string): string {
  const columnIndex = idx[key.toLowerCase()] ?? -1;
  if (columnIndex < 0) return "";
  return String(row[columnIndex] ?? "").trim();
}

function normalizeImage(raw: string): string {
  const first = raw.split(/[;,]/).map((part) => part.trim()).filter(Boolean)[0] || "";
  if (!first) return "";
  if (!first.startsWith("/") && !first.startsWith("http")) {
    return `/photos-cars/${encodeURIComponent(first)}`;
  }
  return first.replace(/\s+/g, "%20");
}

function hasRealPhoto(raw: string): boolean {
  const normalized = normalizeImage(raw);
  if (!normalized) return false;
  const lower = normalized.toLowerCase();
  return !lower.includes("placeholder") && !lower.includes("no-image-available") && !lower.includes("hold tight");
}

function buildFilters(searchParams: URLSearchParams): Filters {
  return {
    makes: searchParams.getAll("make").map((value) => value.trim()).filter(Boolean),
    priceMin: parseNumber(searchParams.get("priceMin")),
    priceMax: parseNumber(searchParams.get("priceMax")),
    priceRanges: parsePriceRanges(searchParams.getAll("priceRange")),
    body: searchParams.getAll("body").map((value) => value.trim()).filter(Boolean),
    fuel: searchParams.getAll("fuel").map((value) => value.trim()).filter(Boolean),
    drive: searchParams.getAll("drive").map((value) => value.trim()).filter(Boolean),
    transmission: searchParams.getAll("transmission").map((value) => value.trim()).filter(Boolean),
    cylinders: searchParams.getAll("cylinders").map((value) => value.trim()).filter(Boolean),
    query: (searchParams.get("query") || "").trim() || undefined,
  };
}

function rowMatchesFilters(row: Row, idx: Record<string, number>, filters: Filters, allCylSet: Set<string>): boolean {
  if (filters.makes.length > 0) {
    const make = getCell(row, idx, "make").toLowerCase();
    const ok = filters.makes.some((label) => make === label.toLowerCase());
    if (!ok) return false;
  }

  if (filters.priceRanges.length > 0) {
    const value = num(getCell(row, idx, "base msrp"));
    const ok = filters.priceRanges.some((range) => {
      if (typeof range.min === "number" && value < range.min) return false;
      if (typeof range.max === "number" && value > range.max) return false;
      return true;
    });
    if (!ok) return false;
  } else if (typeof filters.priceMin !== "undefined" || typeof filters.priceMax !== "undefined") {
    const value = num(getCell(row, idx, "base msrp"));
    if (typeof filters.priceMin === "number" && value < filters.priceMin) return false;
    if (typeof filters.priceMax === "number" && value > filters.priceMax) return false;
  }

  if (filters.body.length > 0) {
    const body = getCell(row, idx, "body type").toLowerCase();
    const ok = filters.body.some((label) => body === label.toLowerCase());
    if (!ok) return false;
  }

  if (filters.fuel.length > 0) {
    const fuel = getCell(row, idx, "fuel type").toLowerCase();
    const ok = filters.fuel.some((label) => {
      const l = label.toLowerCase();
      if (l === "electric") return fuel.includes("electric") || fuel.includes("bev");
      if (l === "hydrogen") return fuel.includes("hydrogen");
      if (l === "diesel") return fuel.includes("diesel");
      if (l === "hybrid") return fuel.includes("hybrid") || fuel.includes("plug-in") || fuel.includes("phev");
      if (l === "flex-fuel") return fuel.includes("flex") || fuel.includes("e85");
      if (l === "gasoline") {
        const isGas = fuel.includes("gasoline") || fuel.includes("petrol") || fuel.includes("unleaded");
        const isHybrid = fuel.includes("hybrid") || fuel.includes("plug-in") || fuel.includes("phev");
        const isFlex = fuel.includes("flex") || fuel.includes("e85");
        return isGas && !isHybrid && !isFlex;
      }
      return fuel.includes(l);
    });
    if (!ok) return false;
  }

  if (filters.drive.length > 0) {
    const drive = getCell(row, idx, "drive type").toLowerCase();
    const ok = filters.drive.some((label) => drive === label.toLowerCase());
    if (!ok) return false;
  }

  if (filters.transmission.length > 0) {
    const raw = getCell(row, idx, "transmission").toLowerCase();
    const cleaned = raw.replace(/\b\d+\s*-?\s*speed\s*/g, "").trim();
    const automatic = cleaned.includes("automatic") || cleaned.includes("direct drive") || cleaned.includes("cvt");
    const manual = cleaned.includes("manual");
    const mixed = cleaned.includes("automated") || cleaned.includes("dual") || cleaned.includes("semi") || cleaned.includes("sequential") || (automatic && manual);
    let label = "Automatic";
    if (mixed) label = "Mixed";
    else if (manual && !mixed && !automatic) label = "Manual";
    const ok = filters.transmission.some((value) => value.toLowerCase() === label.toLowerCase());
    if (!ok) return false;
  }

  if (filters.cylinders.length > 0) {
    const allSelected = allCylSet.size > 0 && filters.cylinders.length >= allCylSet.size;
    if (!allSelected) {
      const cylinders = getCell(row, idx, "cylinders").toLowerCase();
      const ok = cylinders ? filters.cylinders.some((value) => value.toLowerCase() === cylinders) : false;
      if (!ok) return false;
    }
  }

  if (filters.query) {
    const q = filters.query.toLowerCase();
    const hay = [
      getCell(row, idx, "make"),
      getCell(row, idx, "model"),
      getCell(row, idx, "trim"),
      getCell(row, idx, "year"),
    ]
      .join(" ")
      .toLowerCase();
    const tokens = q.split(/\s+/).filter(Boolean);
    const ok = tokens.every((token) => hay.includes(token));
    if (!ok) return false;
  }

  return true;
}

function chooseRepresentative(rows: Row[], idx: Record<string, number>): Row | null {
  const eligible = rows.filter((row) => hasRealPhoto(getCell(row, idx, "image url")));
  if (eligible.length === 0) return null;

  return [...eligible].sort((a, b) => {
    const yearDiff = num(getCell(b, idx, "year")) - num(getCell(a, idx, "year"));
    if (yearDiff !== 0) return yearDiff;
    const priceDiff = num(getCell(a, idx, "base msrp")) - num(getCell(b, idx, "base msrp"));
    if (priceDiff !== 0) return priceDiff;
    return getCell(a, idx, "id").localeCompare(getCell(b, idx, "id"));
  })[0] || null;
}

function groupRows(rows: Row[], idx: Record<string, number>): GroupedItem[] {
  const grouped = new Map<string, Row[]>();

  rows.forEach((row) => {
    const make = getCell(row, idx, "make");
    const model = getCell(row, idx, "model");
    const key = `${make}|${model}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)?.push(row);
  });

  const candidates: GroupedItem[] = [];

  grouped.forEach((groupRowsForModel) => {
    const representative = chooseRepresentative(groupRowsForModel, idx);
    if (!representative) return;

    const imageUrl = normalizeImage(getCell(representative, idx, "image url"));
    if (!imageUrl) return;

    candidates.push({
      id: getCell(representative, idx, "id"),
      make: getCell(representative, idx, "make"),
      model: getCell(representative, idx, "model"),
      trim: getCell(representative, idx, "trim") || getCell(representative, idx, "trim (description)"),
      year: num(getCell(representative, idx, "year")) || null,
      price: num(getCell(representative, idx, "base msrp")) || null,
      imageUrl,
      specs: {
        engine: getCell(representative, idx, "engine size (l)"),
        hp: getCell(representative, idx, "horsepower (hp)"),
        seats: getCell(representative, idx, "total seating"),
      },
      versionCount: groupRowsForModel.length,
    });
  });

  const imageDeduped = new Map<string, GroupedItem>();
  candidates
    .sort((a, b) => a.imageUrl.localeCompare(b.imageUrl) || a.make.localeCompare(b.make) || a.model.localeCompare(b.model))
    .forEach((item) => {
      if (!imageDeduped.has(item.imageUrl)) imageDeduped.set(item.imageUrl, item);
    });

  return Array.from(imageDeduped.values()).sort((a, b) => a.make.localeCompare(b.make) || a.model.localeCompare(b.model));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = parseCursor(searchParams.get("cursor"));
    const filters = buildFilters(searchParams);

    const cols = (await prisma.$queryRawUnsafe(
      "SELECT column_name FROM information_schema.columns WHERE table_schema = 'teo' AND table_name = 'teo_cars' ORDER BY ordinal_position"
    )) as Array<{ column_name: string }>;
    const headers = cols.map((column: { column_name: string }) => column.column_name);
    const quoted = headers.map((header: string) => `"${header.replace(/"/g, '""')}"`).join(", ");
    const sql = `SELECT ${quoted} FROM teo.teo_cars`;
    const rawRows = (await prisma.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
    const rows: Row[] = rawRows.map((row: Record<string, unknown>) => headers.map((header: string) => toCell(row[header])));
    const idx = Object.fromEntries(headers.map((header: string, i: number) => [header.toLowerCase(), i]));

    const cIdx = idx["cylinders"] ?? -1;
    const allCylSet = new Set<string>();
    if (cIdx >= 0) {
      rows.forEach((row) => {
        const raw = String(row[cIdx] ?? "").trim().toLowerCase();
        if (raw) allCylSet.add(raw);
      });
    }

    const filteredRows = rows.filter((row) => rowMatchesFilters(row, idx, filters, allCylSet));
    const groupedItems = groupRows(filteredRows, idx);
    const totalGroups = groupedItems.length;

    const cursorIndex = cursor
      ? groupedItems.findIndex((item) => item.make === cursor.make && item.model === cursor.model)
      : -1;
    const startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
    const pageItems = groupedItems.slice(startIndex, startIndex + PAGE_SIZE + 1);
    const hasMore = pageItems.length > PAGE_SIZE;
    const items = hasMore ? pageItems.slice(0, PAGE_SIZE) : pageItems;
    const lastItem = hasMore ? items[items.length - 1] : null;

    return NextResponse.json({
      items,
      nextCursor: lastItem ? encodeCursor({ make: lastItem.make, model: lastItem.model }) : null,
      totalGroups,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
