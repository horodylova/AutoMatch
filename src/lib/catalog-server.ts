import prisma from "@/lib/prisma";
import { parseCarData, CarSpecs, Row } from "@/utils/carScoring";

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

export async function loadCatalogCars(): Promise<CarSpecs[]> {
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

  return cars.map(car => {
    const carRecord = car as unknown as Record<string, unknown>;
    const specRecord = (car.spec ?? {}) as unknown as Record<string, unknown>;
    const relations = car as unknown as RelationBag;
    const row = [
      ...CAR_FIELDS.map(([, field]) => cell(carRecord[field])),
      ...RELATION_FIELDS.map(([, field]) => cell(relations[field]?.name ?? "")),
      ...SPEC_FIELDS.map(([, field]) => cell(specRecord[field])),
    ] as Row;
    return parseCarData(row, IDX);
  });
}
