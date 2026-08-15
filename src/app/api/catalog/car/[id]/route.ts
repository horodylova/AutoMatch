import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

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
  ["Trim (description)", "trimDescription"],
  ["Base Invoice", "baseInvoice"],
  ["Colors exterior", "colorsExterior"],
  ["Colors interior", "colorsInterior"],
  ["Door", "doors"],
  ["Length (in)", "lengthIn"],
  ["Width (in)", "widthIn"],
  ["Height (in)", "heightIn"],
  ["Wheelbase (in)", "wheelbaseIn"],
  ["Front track (in)", "frontTrackIn"],
  ["Rear track (in)", "rearTrackIn"],
  ["Ground clearance (in)", "groundClearanceIn"],
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
  ["Electric Range", "electricRange"],
  ["EPA electricity range", "epaElectricityRange"],
  ["EPA kWh/100 mi", "epaKwhPer100Mi"],
  ["EPA time to charge battery (at 240V)", "epaTimeToChargeAt240V"],
  ["Battery capacity", "batteryCapacity"],
  ["Cost to Drive", "costToDrive"],
  ["Fast-charge port type", "fastChargePortType"],
  ["Country of final assembly", "countryOfFinalAssembly"],
  ["Country of origin", "countryOfOrigin"],
  ["Car classification", "carClassification"],
  ["Platform code / generation number", "platformCode"],
  ["Front head room (in)", "frontHeadRoomIn"],
  ["Front hip room (in)", "frontHipRoomIn"],
  ["Front leg room (in)", "frontLegRoomIn"],
  ["Front shoulder room (in)", "frontShoulderRoomIn"],
  ["Rear head room (in)", "rearHeadRoomIn"],
  ["Rear hip room (in)", "rearHipRoomIn"],
  ["Rear leg room (in)", "rearLegRoomIn"],
  ["Rear shoulder room (in)", "rearShoulderRoomIn"],
  ["Basic", "warrantyBasic"],
  ["Drivetrain", "warrantyDrivetrain"],
  ["Roadside assistance", "warrantyRoadside"],
  ["Rust", "warrantyRust"],
  ["Source URL", "sourceUrl"],
  ["Review", "review"],
  ["Pro", "pro"],
  ["Con", "con"],
  ["What's new", "whatsNew"],
  ["NHTSA Overall Rating", "nhtsaOverallRating"],
  ["New price range", "newPriceRange"],
  ["Used price range", "usedPriceRange"],
  ["Scorecard Overall", "scorecardOverall"],
  ["Scorecard Driving", "scorecardDriving"],
  ["Scorecard Confort", "scorecardComfort"],
  ["Scorecard Interior", "scorecardInterior"],
  ["Scorecard Utility", "scorecardUtility"],
  ["Scorecard Technology", "scorecardTechnology"],
];

const RELATION_FIELDS: [string, string][] = [
  ["Make", "make"],
  ["Model", "model"],
  ["Body type", "bodyType"],
  ["Fuel type", "fuelType"],
  ["Drive type", "driveType"],
  ["Transmission", "transmission"],
];

function cell(value: unknown): Cell {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number" || typeof value === "boolean") return value;
  return String(value);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const car = await prisma.catalogCar.findUnique({
      where: { id },
      include: {
        make: { select: { name: true } },
        model: { select: { name: true } },
        bodyType: { select: { name: true } },
        fuelType: { select: { name: true } },
        driveType: { select: { name: true } },
        transmission: { select: { name: true } },
        engineType: { select: { name: true } },
        spec: true,
      },
    });

    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    const headers: string[] = [];
    const row: Cell[] = [];

    const push = (header: string, value: unknown) => {
      headers.push(header);
      row.push(cell(value));
    };

    const carRecord = car as unknown as Record<string, unknown>;
    for (const [header, field] of CAR_FIELDS) push(header, carRecord[field]);

    const relations: Record<string, { name: string } | null> = {
      make: car.make,
      model: car.model,
      bodyType: car.bodyType,
      fuelType: car.fuelType,
      driveType: car.driveType,
      transmission: car.transmission,
    };
    for (const [header, field] of RELATION_FIELDS) push(header, relations[field]?.name ?? "");

    const specRecord = (car.spec ?? {}) as unknown as Record<string, unknown>;
    for (const [header, field] of SPEC_FIELDS) push(header, specRecord[field]);

    push("Date added", specRecord["dateAdded"]);

    const idx: Record<string, number> = {};
    headers.forEach((header, i) => {
      idx[header.toLowerCase()] = i;
    });

    const response = NextResponse.json({ data: { headers, row, idx } });
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=1800");
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
