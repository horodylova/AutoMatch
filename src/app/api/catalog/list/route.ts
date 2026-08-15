import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { labelForEngine, powertrainWhere } from "@/lib/powertrain";

export const runtime = "nodejs";

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 100;

function list(params: URLSearchParams, key: string): string[] {
  const out: string[] = [];
  for (const raw of params.getAll(key)) {
    for (const part of raw.split(",")) {
      const v = part.trim();
      if (v) out.push(v);
    }
  }
  return out;
}

function num(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

function ranges(values: string[]): { min?: number; max?: number }[] {
  return values
    .map(v => v.split(":"))
    .map(([lo, hi]) => ({ min: num(lo ?? null), max: num(hi ?? null) }))
    .filter(r => r.min !== undefined || r.max !== undefined);
}

function buildWhere(params: URLSearchParams): Prisma.CatalogCarWhereInput {
  const and: Prisma.CatalogCarWhereInput[] = [];

  const makes = list(params, "make");
  if (makes.length) and.push({ make: { name: { in: makes } } });

  const bodies = list(params, "body");
  if (bodies.length) and.push({ bodyType: { name: { in: bodies } } });

  const fuels = list(params, "fuel");
  if (fuels.length) and.push({ fuelType: { name: { in: fuels } } });

  const drives = list(params, "drive");
  if (drives.length) and.push({ driveType: { name: { in: drives } } });

  const transmissions = list(params, "transmission");
  if (transmissions.length) and.push({ transmission: { name: { in: transmissions } } });

  const powertrains = powertrainWhere(list(params, "powertrain"));
  if (powertrains) and.push(powertrains);

  const engines = list(params, "engine");
  if (engines.length) and.push({ engineType: { name: { in: engines } } });

  const cylinders = list(params, "cylinders");
  if (cylinders.length) and.push({ cylinders: { in: cylinders } });

  const years = list(params, "year").map(y => parseInt(y, 10)).filter(Number.isFinite);
  if (years.length) and.push({ year: { in: years } });

  const priceMin = num(params.get("priceMin"));
  const priceMax = num(params.get("priceMax"));
  if (priceMin !== undefined || priceMax !== undefined) {
    and.push({
      basePrice: {
        ...(priceMin !== undefined ? { gte: Math.round(priceMin) } : {}),
        ...(priceMax !== undefined ? { lte: Math.round(priceMax) } : {}),
      },
    });
  }

  const priceBands = ranges(list(params, "priceRange"));
  if (priceBands.length) {
    and.push({
      OR: priceBands.map(r => ({
        basePrice: {
          ...(r.min !== undefined ? { gte: Math.round(r.min) } : {}),
          ...(r.max !== undefined ? { lte: Math.round(r.max) } : {}),
        },
      })),
    });
  }

  const unit = params.get("efficiencyUnit") === "mpge" ? "mpgeCombined" : "mpgCombined";
  const effBands = ranges(list(params, "efficiencyRange"));
  if (effBands.length) {
    and.push({
      OR: effBands.map(r => ({
        [unit]: {
          ...(r.min !== undefined ? { gte: Math.round(r.min) } : {}),
          ...(r.max !== undefined ? { lte: Math.round(r.max) } : {}),
        },
      })) as Prisma.CatalogCarWhereInput[],
    });
  }

  const query = (params.get("q") || "").trim();
  if (query) {
    const terms = query.split(/\s+/).filter(Boolean).slice(0, 6);
    for (const term of terms) {
      and.push({
        OR: [
          { make: { name: { contains: term, mode: "insensitive" } } },
          { model: { name: { contains: term, mode: "insensitive" } } },
          { trim: { contains: term, mode: "insensitive" } },
          { engineType: { name: { contains: term, mode: "insensitive" } } },
        ],
      });
    }
  }

  return and.length ? { AND: and } : {};
}

function buildOrderBy(sort: string | null): Prisma.CatalogCarOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ basePrice: { sort: "asc", nulls: "last" } }, { id: "asc" }];
    case "price-desc":
      return [{ basePrice: { sort: "desc", nulls: "last" } }, { id: "asc" }];
    case "year-desc":
      return [{ year: "desc" }, { id: "asc" }];
    case "year-asc":
      return [{ year: "asc" }, { id: "asc" }];
    case "mpg-desc":
      return [{ mpgCombined: { sort: "desc", nulls: "last" } }, { id: "asc" }];
    case "newest":
      return [{ spec: { dateAdded: { sort: "desc", nulls: "last" } } }, { id: "asc" }];
    default:
      return [{ make: { name: "asc" } }, { model: { name: "asc" } }, { year: "desc" }, { id: "asc" }];
  }
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;

    const page = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);
    const requested = parseInt(params.get("pageSize") || "", 10);
    const pageSize = Number.isFinite(requested)
      ? Math.min(Math.max(requested, 1), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;

    const where = buildWhere(params);
    const orderBy = buildOrderBy(params.get("sort"));

    const [total, rows] = await Promise.all([
      prisma.catalogCar.count({ where }),
      prisma.catalogCar.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          year: true,
          trim: true,
          basePrice: true,
          horsepower: true,
          cylinders: true,
          seating: true,
          mpgCombined: true,
          mpgeCombined: true,
          imageUrl: true,
          make: { select: { name: true, slug: true } },
          model: { select: { name: true, slug: true } },
          bodyType: { select: { name: true } },
          fuelType: { select: { name: true } },
          driveType: { select: { name: true } },
          transmission: { select: { name: true } },
          engineType: { select: { name: true } },
          spec: { select: { trimDescription: true, engineSizeL: true } },
        },
      }),
    ]);

    const items = rows.map(r => ({
      id: r.id,
      make: r.make.name,
      makeSlug: r.make.slug,
      model: r.model.name,
      modelSlug: r.model.slug,
      year: r.year,
      trim: r.trim,
      price: r.basePrice,
      horsepower: r.horsepower,
      cylinders: r.cylinders,
      seating: r.seating,
      mpg: r.mpgCombined,
      mpge: r.mpgeCombined,
      imageUrl: r.imageUrl,
      bodyType: r.bodyType?.name ?? null,
      fuelType: r.fuelType?.name ?? null,
      driveType: r.driveType?.name ?? null,
      transmission: r.transmission?.name ?? null,
      engineType: r.engineType?.name ?? null,
      powertrain: labelForEngine(r.engineType?.name),
      trimDescription: r.spec?.trimDescription ?? null,
      engineSizeL: r.spec?.engineSizeL ?? null,
    }));

    const response = NextResponse.json({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
    response.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600");
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
