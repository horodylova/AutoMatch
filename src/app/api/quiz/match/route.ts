import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseCarData, matchCars, Row, QuizFilters } from "@/utils/carScoring";

export const runtime = "nodejs";
export const maxDuration = 60;

type Cell = string | number | boolean | null;

const CAR_FIELDS: [string, string][] = [
  ["ID", "id"],
  ["Year", "year"],
  ["Trim", "trim"],
  ["Base MSRP", "basePrice"],
  ["Horsepower (HP)", "horsepower"],
  ["Cylinder", "cylinders"],
  ["Total seating", "seating"],
  ["EPA combined MPG", "mpgCombined"],
  ["EPA combined MPGe", "mpgeCombined"],
  ["Image URL", "imageUrl"],
];

const SPEC_FIELDS: [string, string][] = [
  ["Base Invoice", "baseInvoice"],
  ["Colors exterior", "colorsExterior"],
  ["Colors interior", "colorsInterior"],
  ["Door", "doors"],
  ["Wheelbase (in)", "wheelbaseIn"],
  ["Angle of approach (degrees)", "angleOfApproach"],
  ["Angle of departure (degrees)", "angleOfDeparture"],
  ["Turning circle (ft)", "turningCircleFt"],
  ["Drag coefficient (Cd)", "dragCoefficient"],
  ["EPA interior volume (cu ft)", "epaInteriorVolumeCuFt"],
  ["Cargo capacity (cu ft)", "cargoCapacityCuFt"],
  ["Maximum cargo capacity (cu ft)", "maxCargoCapacityCuFt"],
  ["Curb weight (lbs)", "curbWeightLbs"],
  ["Gross weight (lbs)", "grossWeightLbs"],
  ["Maximum payload (lbs)", "maxPayloadLbs"],
  ["Maximum towing capacity (lbs)", "maxTowingCapacityLbs"],
  ["Engine size (l)", "engineSizeL"],
  ["Horsepower (rpm)", "horsepowerRpm"],
  ["Torque (ft-lbs)", "torqueFtLbs"],
  ["Torque (rpm)", "torqueRpm"],
  ["Valve", "valve"],
  ["Valve timing", "valveTiming"],
  ["Cam type", "camType"],
  ["Engine type", "engineType"],
  ["Fuel tank capacity (gal)", "fuelTankCapacityGal"],
  ["EPA city/highway MPG", "epaCityHighwayMpg"],
  ["Range in miles (city/hwy)", "rangeMilesCityHwy"],
  ["EPA city/highway MPGe", "epaCityHighwayMpge"],
  ["EPA electricity range", "epaElectricityRange"],
  ["EPA kWh/100 mi", "epaKwhPer100Mi"],
  ["EPA time to charge battery (at 240V)", "epaTimeToChargeAt240V"],
  ["Battery capacity", "batteryCapacity"],
  ["Car classification", "carClassification"],
  ["Front head room (in)", "frontHeadRoomIn"],
  ["Front hip room (in)", "frontHipRoomIn"],
  ["Front leg room (in)", "frontLegRoomIn"],
  ["Front shoulder room (in)", "frontShoulderRoomIn"],
  ["Rear head room (in)", "rearHeadRoomIn"],
  ["Rear hip room (in)", "rearHipRoomIn"],
  ["Rear leg room (in)", "rearLegRoomIn"],
  ["Rear shoulder room (in)", "rearShoulderRoomIn"],
];

const RELATION_FIELDS: [string, keyof RelationBag][] = [
  ["Make", "make"],
  ["Model", "model"],
  ["Body type", "bodyType"],
  ["Fuel type", "fuelType"],
  ["Drive type", "driveType"],
  ["Transmission", "transmission"],
];

type RelationBag = {
  make: { name: string } | null;
  model: { name: string } | null;
  bodyType: { name: string } | null;
  fuelType: { name: string } | null;
  driveType: { name: string } | null;
  transmission: { name: string } | null;
};

function cell(value: unknown): Cell {
  if (value === null || value === undefined) return "";
  if (typeof value === "number" || typeof value === "boolean") return value;
  return String(value);
}

const HEADERS: string[] = [
  ...CAR_FIELDS.map(([header]) => header),
  ...RELATION_FIELDS.map(([header]) => header),
  ...SPEC_FIELDS.map(([header]) => header),
];

const IDX: Record<string, number> = Object.fromEntries(
  HEADERS.map((header, i) => [header.toLowerCase(), i])
);

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

    const cars = await prisma.catalogCar.findMany({
      where: { imageUrl: { not: null } },
      include: {
        make: { select: { name: true } },
        model: { select: { name: true } },
        bodyType: { select: { name: true } },
        fuelType: { select: { name: true } },
        driveType: { select: { name: true } },
        transmission: { select: { name: true } },
        spec: {
          select: Object.fromEntries(
            SPEC_FIELDS.map(([, field]) => [field, true])
          ) as Record<string, boolean>,
        },
      },
    });

    const rows: Row[] = cars.map(car => {
      const carRecord = car as unknown as Record<string, unknown>;
      const specRecord = (car.spec ?? {}) as unknown as Record<string, unknown>;
      const relations = car as unknown as RelationBag;
      return [
        ...CAR_FIELDS.map(([, field]) => cell(carRecord[field])),
        ...RELATION_FIELDS.map(([, field]) => cell(relations[field]?.name ?? "")),
        ...SPEC_FIELDS.map(([, field]) => cell(specRecord[field])),
      ] as Row;
    });

    const parsed = rows.map(row => parseCarData(row, IDX));
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
