import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { groupPowertrainCounts } from "@/lib/powertrain";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [makes, bodies, fuels, drives, transmissions, engines, cylinderRows, priceStats, effStats] =
      await Promise.all([
        prisma.make.findMany({
          select: { name: true, slug: true, _count: { select: { cars: true } } },
          orderBy: { name: "asc" },
        }),
        prisma.bodyType.findMany({
          select: { name: true, _count: { select: { cars: true } } },
          orderBy: { name: "asc" },
        }),
        prisma.fuelType.findMany({
          select: { name: true, _count: { select: { cars: true } } },
          orderBy: { name: "asc" },
        }),
        prisma.driveType.findMany({
          select: { name: true, _count: { select: { cars: true } } },
          orderBy: { name: "asc" },
        }),
        prisma.transmission.findMany({
          select: { name: true, _count: { select: { cars: true } } },
          orderBy: { name: "asc" },
        }),
        prisma.engineType.findMany({
          select: { name: true, _count: { select: { cars: true } } },
          orderBy: { name: "asc" },
        }),
        prisma.catalogCar.groupBy({
          by: ["cylinders"],
          _count: { _all: true },
          where: { cylinders: { not: null } },
          orderBy: { cylinders: "asc" },
        }),
        prisma.catalogCar.aggregate({
          _min: { basePrice: true, year: true },
          _max: { basePrice: true, year: true },
        }),
        prisma.catalogCar.aggregate({
          _min: { mpgCombined: true, mpgeCombined: true },
          _max: { mpgCombined: true, mpgeCombined: true },
        }),
      ]);

    const shape = (rows: { name: string; _count: { cars: number } }[]) =>
      rows.filter(r => r._count.cars > 0).map(r => ({ name: r.name, count: r._count.cars }));

    const response = NextResponse.json({
      makes: makes
        .filter(m => m._count.cars > 0)
        .map(m => ({ name: m.name, slug: m.slug, count: m._count.cars })),
      bodyTypes: shape(bodies),
      fuelTypes: shape(fuels),
      driveTypes: shape(drives),
      transmissions: shape(transmissions),
      powertrains: groupPowertrainCounts(shape(engines)),
      cylinders: cylinderRows
        .filter(r => r.cylinders)
        .map(r => ({ name: r.cylinders as string, count: r._count._all })),
      price: { min: priceStats._min.basePrice ?? 0, max: priceStats._max.basePrice ?? 0 },
      year: { min: priceStats._min.year ?? 0, max: priceStats._max.year ?? 0 },
      efficiency: {
        mpg: { min: effStats._min.mpgCombined ?? 0, max: effStats._max.mpgCombined ?? 0 },
        mpge: { min: effStats._min.mpgeCombined ?? 0, max: effStats._max.mpgeCombined ?? 0 },
      },
    });
    response.headers.set("Cache-Control", "public, s-maxage=600, stale-while-revalidate=3600");
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
