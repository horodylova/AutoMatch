import { Categories, CategoryValue } from "../constants/categories";

/* =========================
   TYPES
========================= */

export type Row = (string | number | boolean | null)[];

export interface AnswerSignal {
  primary: CategoryValue;
  secondary?: CategoryValue;
}

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

function parseWarrantyYears(w: string): number {
  if (!w) return 0;
  const m = w.match(/(\d+)\s*yr/i);
  return m ? Number(m[1]) : 0;
}

/* =========================
   USER PREFS (PRIMARY / SECONDARY)
========================= */

export function buildUserPreferences(
  answers: AnswerSignal[],
  secondaryFactor = 0.5
): Record<CategoryValue, number> {
  const prefs = Object.fromEntries(
    Object.values(Categories).map(c => [c, 0])
  ) as Record<CategoryValue, number>;

  for (const a of answers) {
    prefs[a.primary] += 1;
    if (a.secondary) prefs[a.secondary] += secondaryFactor;
  }

  return prefs;
}

function normalizePrefs(prefs: Record<CategoryValue, number>) {
  const sum = Object.values(prefs).reduce((a, b) => a + b, 0) || 1;
  return Object.fromEntries(
    Object.entries(prefs).map(([k, v]) => [k, v / sum])
  ) as Record<CategoryValue, number>;
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

  let image = "/placeholder-car.jpg";
  if (rawImage) {
    const parts = rawImage
      .split(/[;,]/)
      .map(s => s.trim().replace(/^['"]|['"]$/g, ""));
    const valid = parts.find(p =>
      p.startsWith("http") || p.startsWith("/") || p.startsWith("www.")
    );
    if (valid) image = valid.startsWith("www.") ? `https://${valid}` : valid;
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
  const pick = (arr: number[]) => arr.length ? arr : [0];
  return {
    hpMin: Math.min(...pick(cars.map(c => c.horsepower).filter(Boolean))),
    hpMax: Math.max(...pick(cars.map(c => c.horsepower).filter(Boolean))),
    msrpMin: Math.min(...pick(cars.map(c => c.baseMsrp).filter(Boolean))),
    msrpMax: Math.max(...pick(cars.map(c => c.baseMsrp).filter(Boolean))),
    cargoMin: Math.min(...pick(cars.map(c => c.cargoCapacity).filter(Boolean))),
    cargoMax: Math.max(...pick(cars.map(c => c.cargoCapacity).filter(Boolean))),
    towMin: Math.min(...pick(cars.map(c => c.maxTowingCapacity).filter(Boolean))),
    towMax: Math.max(...pick(cars.map(c => c.maxTowingCapacity).filter(Boolean))),
    lenMin: Math.min(...pick(cars.map(c => c.length).filter(Boolean))),
    lenMax: Math.max(...pick(cars.map(c => c.length).filter(Boolean))),
    wbMin: Math.min(...pick(cars.map(c => c.wheelbase).filter(Boolean))),
    wbMax: Math.max(...pick(cars.map(c => c.wheelbase).filter(Boolean))),
    mpgMin: Math.min(...pick(cars.map(c => c.mpge || c.epaCombinedMpg).filter(Boolean))),
    mpgMax: Math.max(...pick(cars.map(c => c.mpge || c.epaCombinedMpg).filter(Boolean))),
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

  scores[Categories.COMFORT] =
    scores[Categories.ROAD_TRIP] * 0.7;

  scores[Categories.TECHNOLOGY] =
    car.fuelType.toLowerCase().includes("electric") ? 80 : 40;

  // RELIABILITY — fixed to real data
  let rel = 0;
  const basicY = parseWarrantyYears(car.basicWarranty);
  const driveY = parseWarrantyYears(car.drivetrainWarranty);

  if (basicY >= 5) rel += 20;
  else if (basicY === 4) rel += 15;
  else if (basicY === 3) rel += 10;
  else rel += 8;

  if (driveY >= 10) rel += 15;
  else if (driveY >= 6) rel += 10;

  if (car.roadsideAssistance) rel += 5;
  if (car.rustWarranty) rel += 5;

  if (car.make.match(/Toyota|Lexus|Honda|Mazda|Subaru|Porsche/i)) rel += 25;
  else if (car.make.match(/Ford|Chevrolet|Nissan|BMW|Mercedes/i)) rel += 15;

  scores[Categories.RELIABILITY] = Math.min(100, rel);

  return scores;
}

/* =========================
   MATCHING
========================= */

export interface ScoredCar {
  car: CarSpecs;
  scores: Record<CategoryValue, number>;
  matchScore: number;
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

export interface QuizFilters {
  sizePreference?: "small" | "mid" | "large" | "oversized";
  fuelPriority?: "low" | "medium" | "high" | "critical";
  expensePreference?: "low" | "balanced" | "high" | "unlimited";
  minSeats?: number;
  cargoNeeds?: "low" | "medium" | "high";
  awdPreferred?: boolean;
  transmissionPreference?: "manual" | "automatic";
  forceSport?: boolean;
  forceUtility?: boolean;
  forceLuxury?: boolean;
}

export function matchCars(
  cars: CarSpecs[],
  userPreferences: Record<CategoryValue, number>,
  filters?: QuizFilters
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
    
    // Base score calculation
    const baseScore = Object.entries(prefs).reduce(
      (sum, [cat, w]) => sum + w * (scores[cat as CategoryValue] || 0),
      0
    );
    let matchScore = baseScore;

    // Apply hard filters / strong boosts based on QuizFilters

    // --- SIZE FILTER ---
    if (filters?.sizePreference) {
      const length = car.length || 0;
      // Classifications often contain "Compact", "Mid-size", "Full-size"
      const cls = (car.classification || "").toLowerCase();
      const body = (car.bodyType || "").toLowerCase();

      if (filters.sizePreference === "small") {
        // Penalty for large vehicles - SOFTENED from 0.1 to 0.4
        if (length > 190 || cls.includes("large") || cls.includes("full-size") || body.includes("truck") || body.includes("van")) {
           matchScore *= 0.4; 
        } else if (length < 180 || cls.includes("compact") || cls.includes("mini") || cls.includes("small")) {
           matchScore *= 1.3; // Boost reduced slightly
        }
      } else if (filters.sizePreference === "oversized") {
        // Don't penalize Trucks or Vans for length if the user wants "Oversized"
        if (length < 195 && !body.includes("truck") && !body.includes("van") && !cls.includes("large")) {
           matchScore *= 0.4; // Softened from 0.2
        }
      }
    }

    // --- FUEL FILTER ---
    if (filters?.fuelPriority === "critical") {
      // Must be efficient
      const mpg = car.epaCombinedMpg || 0;
      const isEV = car.fuelType?.toLowerCase().includes("electric") || car.mpge > 0;
      if (!isEV && mpg < 30) {
        matchScore *= 0.1; // Keep strict for "Critical"
      }
    } else if (filters?.fuelPriority === "high") {
      const mpg = car.epaCombinedMpg || 0;
      const isEV = car.fuelType?.toLowerCase().includes("electric") || car.mpge > 0;
      if (!isEV && mpg < 25) {
        matchScore *= 0.6; // Softened from 0.5
      }
    }

    // --- EXPENSE FILTER (Price) ---
    // RECALIBRATED for 2023-2025 market realities (Inflation adjustment)
    if (filters?.expensePreference) {
      const price = car.baseMsrp || 0;
      if (filters.expensePreference === "low") {
         // Low: <$35k is ideal, but up to $50k is tolerable.
         if (price > 65000) matchScore *= 0.2; // Hard ceiling (was 40k)
         else if (price > 50000) matchScore *= 0.6; // Soft ceiling (was 30k)
      } else if (filters.expensePreference === "balanced") {
         // Balanced: Average is now $50k-$80k.
         // Don't punish until we hit real "expensive" territory (>100k).
         if (price > 120000) matchScore *= 0.4; // (was 60k)
         else if (price > 95000) matchScore *= 0.7;
      }
    }

    // --- SEATS FILTER ---
    if (filters?.minSeats) {
       const seats = car.totalSeating || 0;
       if (seats < filters.minSeats) {
          // Hard failure for passenger needs - KEEP STRICT
          matchScore *= 0.0; 
       }
    }

    // --- CARGO FILTER ---
    if (filters?.cargoNeeds) {
       const cargo = Math.max(car.cargoCapacity || 0, car.maxCargoCapacity || 0);
       const body = (car.bodyType || "").toLowerCase();
       
       if (filters.cargoNeeds === "high") {
          // Needs big space (Truck, Minivan, Large SUV)
          if (body.includes("truck") || body.includes("van") || body.includes("minivan")) {
             matchScore *= 1.2; // Boost ideal matches
          } else if (cargo < 50) {
             matchScore *= 0.4; // Softened from 0.2
          }
       } else if (filters.cargoNeeds === "medium") {
          // Allow Wagons, SUVs, Hatchbacks to pass "Medium" needs even if raw cu-ft data is weirdly low
          if (cargo < 15 && !body.includes("hatchback") && !body.includes("suv") && !body.includes("crossover") && !body.includes("wagon")) {
             // Small trunk penalty
             matchScore *= 0.7; // Softened from 0.6
          }
       }
    }

    // --- AWD FILTER ---
    if (filters?.awdPreferred) {
       const drive = (car.driveType || "").toLowerCase();
       const isAWD = drive.includes("awd") || drive.includes("4wd") || drive.includes("four");
       if (!isAWD) {
          matchScore *= 0.7; // Softened from 0.6
       } else {
          matchScore *= 1.1; // Boost
       }
    }

    // --- TRANSMISSION FILTER (Control vs Ease) ---
    if (filters?.transmissionPreference) {
       const trans = (car.transmission || "").toLowerCase();
       const isManual = trans.includes("manual") || trans.includes("stick");
       // Some manuals might be "6-speed" without "automatic" keyword, but usually data has "manual"
       
       if (filters.transmissionPreference === "manual") {
          if (isManual) {
             matchScore *= 1.5; // Huge boost for the dying breed of manuals
          } else {
             matchScore *= 0.6; // Penalty for automatics if user wants control
          }
       } else if (filters.transmissionPreference === "automatic") {
          if (isManual) {
             matchScore *= 0.5; // Most people who want "simple/safe" can't/won't drive manual
          }
       }
    }

    // --- SPORT MODE (Force Sport) ---
    if (filters?.forceSport) {
       const hp = car.horsepower || 0;
       const body = (car.bodyType || "").toLowerCase();
       const isSportyBody = body.includes("coupe") || body.includes("convertible") || body.includes("sport");
       // CONFLICT ARBITRATION: If Utility is also forced, don't penalize Trucks/SUVs for being "boring"
       const isUtilityMode = filters.forceUtility || false;
       const isBoring = !isUtilityMode && (body.includes("minivan") || body.includes("van") || (body.includes("suv") && hp < 250));

       // 1. Boost high HP
       if (hp > 400) matchScore *= 1.4; // Slightly reduced boost
       else if (hp > 300) matchScore *= 1.2;
       
       // 2. Boost sporty body types
       if (isSportyBody) matchScore *= 1.3;

       // 3. Penalize boring or low HP (Softened)
       if (hp < 200 && !isSportyBody) matchScore *= 0.6; // Softened from 0.4
       if (isBoring) matchScore *= 0.4; // Softened from 0.2
       
       // 4. Boost Performance score contribution
       if (scores[Categories.PERFORMANCE] > 80) matchScore *= 1.2;
    }

    // --- UTILITY MODE (Work / Cargo) ---
    if (filters?.forceUtility) {
       const body = (car.bodyType || "").toLowerCase();
       const cargo = Math.max(car.cargoCapacity || 0, car.maxCargoCapacity || 0);
       const tow = car.maxTowingCapacity || 0;

       const isUtility = body.includes("truck") || body.includes("van") || body.includes("minivan");
       
       // 1. Boost for trucks/vans (Reduced slightly to avoid dominating)
       if (isUtility) matchScore *= 1.6; // Reduced from 2.0

       // 2. Boost high towing or cargo
       if (tow > 5000) matchScore *= 1.4;
       if (cargo > 60) matchScore *= 1.2;

       // 3. Penalize low utility (Softened)
       if (cargo < 30 && tow < 2000) matchScore *= 0.4; // Softened from 0.1
    }

    // --- LUXURY MODE (Prestige / Comfort) ---
    if (filters?.forceLuxury) {
       const price = car.baseMsrp || 0;
       const brand = (car.make || "").toLowerCase();
       // Updated based on user's full inventory list
       const luxuryBrands = [
         "acura", "alfa romeo", "aston martin", "audi", "bentley", "bmw", 
         "cadillac", "fisker", "genesis", "ineos", "infiniti", "jaguar", 
         "lamborghini", "land rover", "lexus", "lincoln", "lucid", "maserati", 
         "mclaren", "mercedes-benz", "polestar", "porsche", "rivian", 
         "rolls-royce", "tesla", "volvo"
       ];
       
       const isLuxBrand = luxuryBrands.some(b => brand.includes(b));

       // 1. Boost luxury brands
       if (isLuxBrand) matchScore *= 1.3; // Reduced from 1.5

       // 2. Penalize mass-market cars (Adjusted for inflation)
       if (price < 55000) matchScore *= 0.7; // Was 35k

       // 3. Boost high price (True luxury starts higher now)
       if (price > 90000) matchScore *= 1.2; // Was 60k
       if (price > 150000) matchScore *= 1.15; // Ultra-luxury boost

       // 4. Boost Comfort/Luxury scores
       if (scores[Categories.LUXURY] > 70) matchScore *= 1.2;
       if (scores[Categories.COMFORT] > 70) matchScore *= 1.1;
    }

    // --- SAFETY FLOOR ---
    // Prevent cumulative soft penalties from completely eliminating a viable car.
    // If the car wasn't hard-filtered (score > 0), ensure it keeps at least 10% of its base relevance.
    if (matchScore > 0.01) {
       matchScore = Math.max(matchScore, baseScore * 0.1);
    }

    return { car, scores, matchScore };
  });

  return diversifyByMake(
    scored.sort((a, b) => b.matchScore - a.matchScore),
    2
  );
}


