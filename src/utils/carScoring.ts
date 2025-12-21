import { Categories, CategoryValue } from "../constants/categories";

/* =========================
   TYPES
========================= */

export type Row = (string | number | boolean | null)[];

export interface CarSpecs {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  image: string;

  bodyType: string;
  doors: number;
  totalSeating: number;
  cargoCapacity: number;
  maxCargoCapacity: number;
  curbWeight: number;
  turningCircle: number;

  headroomFront: number;
  legroomFront: number;
  shoulderRoomFront: number;
  headroomRear: number;
  legroomRear: number;
  shoulderRoomRear: number;
  hipRoomRear: number;
  wheelbase: number;

  horsepower: number;
  torque: number;
  engineSize: number;
  cylinders: number;
  driveType: string;
  transmission: string;
  classification: string;

  baseMsrp: number;
  baseInvoice: number;
  fuelType: string;
  fuelTankCapacity: number;
  epaCombinedMpg: number;
  epaCityMpg: number;
  epaHighwayMpg: number;
  rangeCity: number;
  rangeHwy: number;

  mpge: number;
  evRange: number;
  batteryCapacity: number;
  chargingTime: number;

  maxTowingCapacity: number;
  maxPayload: number;
  groundClearance: number;

  length: number;
  width: number;

  basicWarranty: string;
  drivetrainWarranty: string;
  roadsideAssistance: string;
  rustWarranty: string;
  countryOfOrigin: string;
}

/* =========================
   HELPERS
========================= */

function num(x: unknown): number {
  if (x == null) return 0;
  const s = String(x).trim();
  if (!s) return 0;
  const m = s.replace(/[$,]/g, "");
  const parts = m.match(/(-?\d+(?:\.\d+)?)/g);
  if (!parts) return 0;
  const n = Number(parts[parts.length - 1]);
  return Number.isFinite(n) ? n : 0;
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function norm(v: number, min: number, max: number): number {
  if (!Number.isFinite(v) || max <= min) return 0;
  return clamp01((v - min) / (max - min));
}

function hasRealImage(car: CarSpecs) {
  return car.image && !car.image.includes("placeholder");
}

function hasRealNumbers(car: CarSpecs) {
  return (
    car.horsepower > 0 ||
    car.baseMsrp > 0 ||
    car.length > 0 ||
    car.epaCombinedMpg > 0
  );
}

/* =========================
   PARSING
========================= */

export function parseCarData(
  row: Row,
  idxMap: Record<string, number>
): CarSpecs {
  const val = (k: string) => row[idxMap[k] ?? -1];
  const str = (k: string) => String(val(k) ?? "").trim();
  const n = (k: string) => num(val(k));

  const rawImage =
    str("image url") ||
    str("image") ||
    str("photo") ||
    str("picture") ||
    str("calculated_image_url");

  // Robust image parsing: handle lists, quotes, and non-http prefixes
  let image = "/placeholder-car.jpg";
  if (rawImage) {
    const parts = rawImage.split(/[;,]/).map(s => s.trim().replace(/^['"]|['"]$/g, ""));
    const valid = parts.find(p => p.startsWith("http") || p.startsWith("/") || p.startsWith("www."));
    if (valid) {
      image = valid.startsWith("www.") ? `https://${valid}` : valid;
    }
  }

  return {
    id: str("id"),
    make: str("make"),
    model: str("model"),
    year: n("year"),
    trim: str("trim"),
    image,

    bodyType: str("body type"),
    doors: n("doors"),
    totalSeating: n("total seating"),
    cargoCapacity: n("cargo capacity (cu ft)"),
    maxCargoCapacity: n("maximum cargo capacity (cu ft)"),
    curbWeight: n("curb weight (lbs)"),
    turningCircle: n("turning circle (ft)"),

    headroomFront: n("front headroom (in)"),
    legroomFront: n("front legroom (in)"),
    shoulderRoomFront: n("front shoulder room (in)"),
    headroomRear: n("rear headroom (in)"),
    legroomRear: n("rear legroom (in)"),
    shoulderRoomRear: n("rear shoulder room (in)"),
    hipRoomRear: n("rear hip room (in)"),
    wheelbase: n("wheelbase (in)"),

    horsepower: n("horsepower (hp)"),
    torque: n("torque (ft-lbs)"),
    engineSize: n("engine size (l)"),
    cylinders: n("cylinders"),
    driveType: str("drive type"),
    transmission: str("transmission"),
    classification: str("classification"),

    baseMsrp: n("base msrp"),
    baseInvoice: n("base invoice"),
    fuelType: str("fuel type"),
    fuelTankCapacity: n("fuel tank capacity (gal)"),
    epaCombinedMpg: n("epa combined mpg"),
    epaCityMpg: n("epa city mpg"),
    epaHighwayMpg: n("epa highway mpg"),
    rangeCity: 0,
    rangeHwy: 0,

    mpge: n("epa combined mpge"),
    evRange: n("ev range (mi)"),
    batteryCapacity: n("battery capacity (kwh)"),
    chargingTime: n("charging time (240v)"),

    maxTowingCapacity: n("maximum towing capacity (lbs)"),
    maxPayload: n("maximum payload (lbs)"),
    groundClearance: n("ground clearance (in)"),

    length: n("length (in)"),
    width: n("width (in)"),

    basicWarranty: str("basic warranty"),
    drivetrainWarranty: str("drivetrain warranty"),
    roadsideAssistance: str("roadside assistance"),
    rustWarranty: str("rust warranty"),
    countryOfOrigin: str("country of origin"),
  };
}

/* =========================
   STATS
========================= */

export function calculateGlobalStats(cars: CarSpecs[]) {
  const vals = {
    hp: cars.map(c => c.horsepower).filter(Boolean),
    price: cars.map(c => c.baseMsrp).filter(Boolean),
    cargo: cars.map(c => c.cargoCapacity).filter(Boolean),
    tow: cars.map(c => c.maxTowingCapacity).filter(Boolean),
    len: cars.map(c => c.length).filter(Boolean),
    wb: cars.map(c => c.wheelbase).filter(Boolean),
    mpg: cars.map(c => c.mpge || c.epaCombinedMpg).filter(Boolean),
  };

  return {
    hpMin: Math.min(...vals.hp),
    hpMax: Math.max(...vals.hp),
    msrpMin: Math.min(...vals.price),
    msrpMax: Math.max(...vals.price),
    cargoMin: Math.min(...vals.cargo),
    cargoMax: Math.max(...vals.cargo),
    towMin: Math.min(...vals.tow),
    towMax: Math.max(...vals.tow),
    lenMin: Math.min(...vals.len),
    lenMax: Math.max(...vals.len),
    wbMin: Math.min(...vals.wb),
    wbMax: Math.max(...vals.wb),
    mpgMin: Math.min(...vals.mpg),
    mpgMax: Math.max(...vals.mpg),
  };
}

/* =========================
   SCORING
========================= */

export function calculateCarScores(
  car: CarSpecs,
  stats: ReturnType<typeof calculateGlobalStats>
): Record<CategoryValue, number> {

  const scores = Object.fromEntries(
    Object.values(Categories).map(c => [c, 0])
  ) as Record<CategoryValue, number>;

  scores[Categories.PERFORMANCE] =
    norm(car.horsepower, stats.hpMin, stats.hpMax) * 100;

  scores[Categories.EFFICIENCY] =
    norm(car.mpge || car.epaCombinedMpg, stats.mpgMin, stats.mpgMax) * 100;

  scores[Categories.CITY] =
    (1 - norm(car.length, stats.lenMin, stats.lenMax)) * 100;

  scores[Categories.ROAD_TRIP] =
    norm(car.wheelbase, stats.wbMin, stats.wbMax) * 100;

  scores[Categories.PRACTICALITY] =
    norm(car.cargoCapacity, stats.cargoMin, stats.cargoMax) * 100;

  scores[Categories.LUXURY] =
    norm(car.baseMsrp, stats.msrpMin, stats.msrpMax) * 100;

  scores[Categories.ADVENTURE] =
    norm(car.maxTowingCapacity, stats.towMin, stats.towMax) * 100;

  scores[Categories.COMFORT] = scores[Categories.ROAD_TRIP] * 0.7;

  scores[Categories.TECHNOLOGY] =
    car.fuelType.toLowerCase().includes("electric") ? 80 : 40;

  scores[Categories.RELIABILITY] =
    car.basicWarranty ? 60 : 40;

  return scores;
}

/* =========================
   MATCHING
========================= */

function normalizePrefs(prefs: Record<CategoryValue, number>) {
  const sum = Object.values(prefs).reduce((a, b) => a + b, 0) || 1;
  return Object.fromEntries(
    Object.entries(prefs).map(([k, v]) => [k, v / sum])
  ) as Record<CategoryValue, number>;
}

function diversifyByMake(results: ScoredCar[], maxPerMake = 2) {
  const seen = new Map<string, number>();
  return results.filter(r => {
    const c = seen.get(r.car.make) || 0;
    if (c >= maxPerMake) return false;
    seen.set(r.car.make, c + 1);
    return true;
  });
}

export interface ScoredCar {
  car: CarSpecs;
  scores: Record<CategoryValue, number>;
  matchScore: number;
}

export function matchCars(
  cars: CarSpecs[],
  userPreferences: Record<CategoryValue, number>
): ScoredCar[] {

  const prefs = normalizePrefs(userPreferences);

  const validCars = cars.filter(c =>
    hasRealNumbers(c) &&
    hasRealImage(c) &&
    c.make &&
    c.model
  );

  const stats = calculateGlobalStats(validCars);

  const scored = validCars.map(car => {
    const scores = calculateCarScores(car, stats);
    const matchScore = Object.entries(prefs).reduce(
      (sum, [cat, w]) => sum + w * (scores[cat as CategoryValue] || 0),
      0
    );
    return { car, scores, matchScore };
  });

  return diversifyByMake(
    scored.sort((a, b) => b.matchScore - a.matchScore),
    2
  );
}

