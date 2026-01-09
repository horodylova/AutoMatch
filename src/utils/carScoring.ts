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
  zeroSixty: number;
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
  height: number;
  frontTrack: number;
  rearTrack: number;

  colorsExterior: string;
  colorsInterior: string;
  angleApproach: number;
  angleDeparture: number;
  dragCoefficient: number;
  epaInteriorVolume: number;
  grossWeight: number;
  horsepowerRpm: number;
  torqueRpm: number;
  valves: number;
  valveTiming: string;
  camType: string;
  engineType: string;
  epaCityMpge: number;
  epaHighwayMpge: number;
  epaKwh100Mi: number;
  hipRoomFront: number;

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
  return (
    car.image && 
    !car.image.includes("placeholder") && 
    !car.image.includes("no-image-available")
  );
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

  let image = "/no-image-available.jpg";
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
    dragCoefficient: n("drag coefficient (cd)"),
    grossWeight: n("gross weight (lbs)"),
    angleApproach: n("angle of approach (degrees)"),
    angleDeparture: n("angle of departure (degrees)"),

    colorsExterior: str("colors exterior"),
    colorsInterior: str("colors interior"),

    headroomFront: n("front headroom (in)"),
    legroomFront: n("front legroom (in)"),
    shoulderRoomFront: n("front shoulder room (in)"),
    hipRoomFront: n("front hip room (in)"),
    headroomRear: n("rear headroom (in)"),
    legroomRear: n("rear legroom (in)"),
    shoulderRoomRear: n("rear shoulder room (in)"),
    hipRoomRear: n("rear hip room (in)"),
    epaInteriorVolume: n("epa interior volume (cu ft)"),
    wheelbase: n("wheelbase (in)"),

    horsepower: n("horsepower (hp)"),
    horsepowerRpm: n("horsepower (rpm)"),
    torque: n("torque (ft-lbs)"),
    torqueRpm: n("torque (rpm)"),
    engineSize: n("engine size (l)"),
    cylinders: n("cylinders"),
    valves: n("valves"),
    valveTiming: str("valve timing"),
    camType: str("cam type"),
    engineType: str("engine type"),
    zeroSixty: n("0-60 mph (sec)") || n("0-60 time (sec)") || n("0-60 mph") || n("acceleration (0-60)"),
    driveType: str("drive type"),
    transmission: str("transmission"),
    classification: str("classification"),

    baseMsrp: n("base msrp"),
    baseInvoice: n("base invoice"),
    fuelType: str("fuel type"),
    fuelTankCapacity: n("fuel tank capacity (gal)"),
    epaCombinedMpg: n("epa combined mpg"),
    epaCityMpg: n("epa city/highway mpg") || n("epa city mpg"), // Try split if combined
    epaHighwayMpg: n("epa highway mpg"),
    rangeCity: n("range in miles (city/hwy)") || n("range city"),
    rangeHwy: n("range hwy"),

    mpge: n("epa combined mpge"),
    epaCityMpge: n("epa city mpge"),
    epaHighwayMpge: n("epa highway mpge"),
    evRange: n("epa electricity range (mi)") || n("range in miles (city/hwy)"), // Fallback
    epaKwh100Mi: n("epa kwh/100 mi"),
    batteryCapacity: n("battery capacity (kwh)"),
    chargingTime: n("epa time to charge battery (at 240v) (hr)"),

    maxTowingCapacity: n("maximum towing capacity (lbs)"),
    maxPayload: n("maximum payload (lbs)"),
    groundClearance: n("ground clearance (in)"),

    length: n("length (in)"),
    width: n("width (in)"),
    height: n("height (in)"),
    frontTrack: n("front track (in)"),
    rearTrack: n("rear track (in)"),

    basicWarranty: str("basic"),
    drivetrainWarranty: str("drivetrain"),
    roadsideAssistance: str("roadside assistance"),
    rustWarranty: str("rust"),
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
  drivingPosition?: "low" | "balanced" | "high";
  fuelPriority?: "low" | "medium" | "high" | "critical";
  expensePreference?: "low" | "balanced" | "high" | "unlimited";
  minSeats?: number;
  cargoNeeds?: "low" | "medium" | "high";
  awdPreferred?: boolean;
  transmissionPreference?: "manual" | "automatic";
  forceSport?: boolean;
  forceUtility?: boolean;
  forceLuxury?: boolean;
  isFamily?: boolean;
  familyStyle?: "practical" | "image_conscious";
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
    
   
    // Base Logic: Weighted sum of categories
    const baseScore = Object.entries(prefs).reduce(
      (sum, [cat, w]) => sum + w * (scores[cat as CategoryValue] || 0),
      0
    );
    let matchScore = baseScore;

    // --- NORMALIZATION & BALANCE FIXES ---
    // Problem: Some categories (like Performance) can have very high raw scores compared to others.
    // Solution: We need to ensure "baseScore" isn't dominated by a single outlier stat.
    // (Already handled by 0-100 normalization in calculateCarScores, but let's be sure).

    // --- SIZE FILTERS (Updated for stricter City/Small definition) ---
    if (filters?.sizePreference) {
      const length = car.length || 0;
      const body = (car.bodyType || "").toLowerCase();

      // "small_agile" -> Target < 178 in, Penalize > 185
      if (filters.sizePreference === "small") {
        // STRICT FILTER: Absolutely no trucks, vans, or large SUVs for "Small & Agile"
        if (body.includes("truck") || body.includes("van") || body.includes("minivan") || body.includes("large suv")) {
            return { car, scores, matchScore: 0 }; 
        }
        
        if (length > 185) {
           // Allow slight flexibility for sporty coupes (e.g. Mustang is ~188), but strictly penalize others
           if (!body.includes("coupe") && !body.includes("convertible")) {
               return { car, scores, matchScore: 0 }; 
           }
           matchScore *= 0.4; 
        } else if (length < 178 || body.includes("compact") || body.includes("hatchback")) {
           matchScore *= 1.3; 
        }
      } 
      // "mid_size_balanced" -> Target 175-195
      else if (filters.sizePreference === "mid") {
        if (length < 170 || length > 200 || body.includes("truck") || body.includes("van")) {
           matchScore *= 0.6; 
        } else if (length >= 175 && length <= 195) {
           matchScore *= 1.2; 
        }
      }
      // "large_comfortable" -> Target 195-215 (SUVs, Minivans)
      else if (filters.sizePreference === "large") {
        if (length < 190 || body.includes("compact") || body.includes("small")) {
           matchScore *= 0.5; 
        } else if (length >= 195 && length <= 215) {
           matchScore *= 1.2; 
        }

        // Boost SUVs for large category as per user preference
        if (body.includes("suv")) matchScore *= 1.1;

        // Penalize commercial vans unless specifically utility focused (handled later)
        if (body.includes("van") && !body.includes("minivan") && !filters.forceUtility && filters.cargoNeeds !== "high") {
           matchScore *= 0.7;
        }
      }
      // "oversized_powerful" -> Target > 215 (Trucks, Large SUVs, Vans)
      else if (filters.sizePreference === "oversized") {
        if (length < 200) {
           matchScore *= 0.4; 
        } else if (length >= 210) {
           matchScore *= 1.3; 
        }
        
        if (body.includes("truck") || body.includes("large suv") || body.includes("van")) {
           matchScore *= 1.2;
        }
      }
    }

    if (filters?.drivingPosition) {
       const height = car.height || 0;
       const body = (car.bodyType || "").toLowerCase();

       if (filters.drivingPosition === "low") {
           // User wants "Low & Connected"
           if (height > 62 || body.includes("suv") || body.includes("truck") || body.includes("van")) {
               return { car, scores, matchScore: 0 }; // STRICT: No tall vehicles
           }
           if (height < 58 || body.includes("coupe") || body.includes("sedan") || body.includes("hatchback")) {
               matchScore *= 1.2;
           }
       } else if (filters.drivingPosition === "high") {
           // User wants "High & Commanding"
           if (height < 60 && !body.includes("suv")) {
               return { car, scores, matchScore: 0 }; // STRICT: No low vehicles
           }
           if (body.includes("suv") || body.includes("truck") || body.includes("van")) {
               matchScore *= 1.2;
           }
       }
    }

    if (filters?.isFamily) {
       const body = (car.bodyType || "").toLowerCase();
       // Boost family friendly cars (SUVs, Minivans, Wagons)
       if (body.includes("suv") || body.includes("minivan") || body.includes("crossover") || body.includes("wagon")) {
           matchScore *= 1.25;
       }
       
       // Penalize commercial vans/trucks unless utility is forced
       if (!filters.forceUtility && filters.cargoNeeds !== "high") {
            if (body.includes("truck") || (body.includes("van") && !body.includes("minivan"))) {
                matchScore *= 0.6;
            }
       }
    }

    if (filters?.fuelPriority === "critical") {
     
      const mpg = car.epaCombinedMpg || 0;
      const isEV = car.fuelType?.toLowerCase().includes("electric") || car.mpge > 0;
      if (!isEV && mpg < 30) {
        return { car, scores, matchScore: 0 }; // STRICT: Must be efficient
      }
    } else if (filters?.fuelPriority === "high") {
      const mpg = car.epaCombinedMpg || 0;
      const isEV = car.fuelType?.toLowerCase().includes("electric") || car.mpge > 0;
      if (!isEV && mpg < 25) {
        if (filters.forceUtility) {
             matchScore *= 0.8; // Mild penalty for work vehicles
        } else {
             matchScore *= 0.4; // Strong penalty
        }
      }
    }

    if (filters?.expensePreference) {
      const price = car.baseMsrp || 0;
      
      // STRICT FILTERING: Eliminate cars outside user's budget segment
      if (filters.expensePreference === "low") {
         // Target: < 35k
         if (price > 40000) return { car, scores, matchScore: 0 };
         
         if (price < 20000) matchScore *= 1.4;
         else if (price <= 35000) matchScore *= 1.2;
         else matchScore *= 0.4; // 35k-40k range
      } 
      else if (filters.expensePreference === "balanced") {
         // Target: 25k - 65k
         if (price < 20000) return { car, scores, matchScore: 0 };
         if (price > 70000) return { car, scores, matchScore: 0 };

         if (price >= 25000 && price < 48000) matchScore *= 1.25;
         else if (price >= 48000 && price <= 60000) matchScore *= 1.0;
         else if (price >= 60000 && price <= 70000) matchScore *= 0.5; // Warning zone
         
         if (price < 25000) matchScore *= 0.8;
      } 
      else if (filters.expensePreference === "high") {
         // Target: 50k - 120k
         if (price < 40000) return { car, scores, matchScore: 0 };
         
         if (price >= 50000 && price <= 120000) matchScore *= 1.1;
         if (price > 120000) matchScore *= 0.7; 
      }
      else if (filters.expensePreference === "unlimited") {
         // Target: 75k+
         if (price > 75000) matchScore *= 1.3;
         if (price < 60000) matchScore *= 0.5; 
      }
    }

    if (filters?.minSeats) {
       const seats = car.totalSeating || 0;
       if (seats < filters.minSeats) {
        
          matchScore *= 0.0; 
       }
    }

   
    if (filters?.cargoNeeds) {
       const cargo = Math.max(car.cargoCapacity || 0, car.maxCargoCapacity || 0);
       const body = (car.bodyType || "").toLowerCase();
       
       if (filters.cargoNeeds === "high") {
          const isUtility = body.includes("truck") || body.includes("van") || body.includes("minivan");
       
          if (isUtility) {
             matchScore *= 1.2; 
          } 

          // Boost large SUVs for high cargo needs
          if (body.includes("suv") && cargo > 60) {
             matchScore *= 1.15;
          }

          if (cargo < 50 && !isUtility) {
             matchScore *= 0.4; 
          }
       } else if (filters.cargoNeeds === "medium") {
          if (cargo < 15 && !body.includes("hatchback") && !body.includes("suv") && !body.includes("crossover") && !body.includes("wagon")) {
            
             matchScore *= 0.7; 
          }
       }
    }

    
    if (filters?.awdPreferred) {
       const drive = (car.driveType || "").toLowerCase();
       const isAWD = drive.includes("awd") || drive.includes("4wd") || drive.includes("four");
       if (!isAWD) {
          matchScore *= 0.7; 
       } else {
          matchScore *= 1.1; 
       }
    }

    if (filters?.transmissionPreference) {
       const trans = (car.transmission || "").toLowerCase();
       const isManual = trans.includes("manual") || trans.includes("stick");
       
       if (filters.transmissionPreference === "manual") {
          if (isManual) {
             matchScore *= 1.5; 
          } else {
             matchScore *= 0.6; 
          }
       } else if (filters.transmissionPreference === "automatic") {
          if (isManual) {
             matchScore *= 0.5; 
          }
       }
    }

    if (filters?.forceSport) {
       const hp = car.horsepower || 0;
       const body = (car.bodyType || "").toLowerCase();
       const isSportyBody = body.includes("coupe") || body.includes("convertible") || body.includes("sport");

       const isUtilityMode = filters.forceUtility || false;
       const isBoring = !isUtilityMode && (body.includes("minivan") || body.includes("van") || (body.includes("suv") && hp < 250));

       if (hp > 400) matchScore *= 1.4; 
       else if (hp > 300) matchScore *= 1.2;
       
    
       if (isSportyBody) matchScore *= 1.3;

     
       // Penalize weak engines, but be lenient for budget cars
       const hpThreshold = filters.expensePreference === "low" ? 140 : 200;
       if (hp < hpThreshold && !isSportyBody) matchScore *= 0.6; 
       
       if (isBoring) matchScore *= 0.4; 
       
      
       if (scores[Categories.PERFORMANCE] > 80) matchScore *= 1.2;
    }

    
    if (filters?.forceUtility) {
       const body = (car.bodyType || "").toLowerCase();
       const cargo = Math.max(car.cargoCapacity || 0, car.maxCargoCapacity || 0);
       const tow = car.maxTowingCapacity || 0;

       const isUtility = body.includes("truck") || body.includes("van") || body.includes("minivan");
       
     
       if (isUtility) matchScore *= 2.2; // Massive boost for utility vehicles

       if (tow > 5000) matchScore *= 1.4;
       if (cargo > 60) matchScore *= 1.2;

       if (cargo < 30 && tow < 2000) matchScore *= 0.4; 
    }

    if (filters?.forceLuxury) {
       const price = car.baseMsrp || 0;
       const brand = (car.make || "").toLowerCase();
       
       const luxuryBrands = [
         "acura", "alfa romeo", "aston martin", "audi", "bentley", "bmw", 
         "cadillac", "fisker", "genesis", "ineos", "infiniti", "jaguar", 
         "lamborghini", "land rover", "lexus", "lincoln", "lucid", "maserati", 
         "mclaren", "mercedes-benz", "polestar", "porsche", "rivian", 
         "rolls-royce", "tesla", "volvo"
       ];
       
       const isLuxBrand = luxuryBrands.some(b => brand.includes(b));
    
       if (isLuxBrand) matchScore *= 1.35; 

       // For budget-conscious luxury seekers, boost "Premium" non-luxury brands
       const premiumBrands = ["mazda", "volkswagen", "mini", "gmc", "jeep"];
       if (!isLuxBrand && premiumBrands.some(b => brand.includes(b))) {
           matchScore *= 1.15;
       }
    
       // Luxury pricing alignment (Only apply high-price boosts if budget allows)
       if (filters.expensePreference !== "low" && filters.expensePreference !== "balanced") {
          if (price > 75000) matchScore *= 1.2; 
          if (price > 120000) matchScore *= 1.15;
          if (scores[Categories.LUXURY] > 70) matchScore *= 1.2;
       }

       // Universal Luxury indicators (Comfort/Tech)
       if (scores[Categories.COMFORT] > 70) matchScore *= 1.15;
       if (scores[Categories.TECHNOLOGY] > 70) matchScore *= 1.1;
    }

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

