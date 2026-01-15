import { Categories, CategoryValue } from "../constants/categories";

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
      .map(s => s.trim())
      .filter(Boolean);

    const sanitize = (u: string): string => {
      const cleaned = u
        .replace(/^['"]|['"]$/g, "")
        .replace(/[)]+$/, "")
        .replace(/\s+/g, "%20");
      if (
        cleaned.startsWith("https://") ||
        cleaned.startsWith("http://") ||
        cleaned.startsWith("/")
      ) {
        return cleaned;
      }
      if (cleaned.startsWith("www.")) {
        return `https://${cleaned}`;
      }
      return "/no-image-available.jpg";
    };

    const candidates = parts.map(sanitize).filter(Boolean);
    if (candidates.length > 0) {
      image = candidates[0];
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
    epaCityMpg: n("epa city/highway mpg") || n("epa city mpg"),
    epaHighwayMpg: n("epa highway mpg"),
    rangeCity: n("range in miles (city/hwy)") || n("range city"),
    rangeHwy: n("range hwy"),

    mpge: n("epa combined mpge"),
    epaCityMpge: n("epa city mpge"),
    epaHighwayMpge: n("epa highway mpge"),
    evRange: n("epa electricity range (mi)") || n("range in miles (city/hwy)"),
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

  const luxuryBrands = [
    "acura", "alfa romeo", "aston martin", "audi", "bentley", "bmw", 
    "cadillac", "fisker", "genesis", "ineos", "infiniti", "jaguar", 
    "lamborghini", "land rover", "lexus", "lincoln", "lucid", "maserati", 
    "mclaren", "mercedes-benz", "polestar", "porsche", "rivian", 
    "rolls-royce", "tesla", "volvo"
  ];

  const scored = validCars.map(car => {
    const scores = calculateCarScores(car, stats);
    
    const baseScore = Object.entries(prefs).reduce(
      (sum, [cat, w]) => sum + w * (scores[cat as CategoryValue] || 0),
      0
    );
    let matchScore = baseScore;

    const price = car.baseMsrp || 0;
    const body = (car.bodyType || "").toLowerCase();
    const brand = (car.make || "").toLowerCase();
    const isLuxBrand = luxuryBrands.some(b => brand.includes(b));

    if (filters?.expensePreference) {
      if (filters.expensePreference === "low") {
         if (price > 40000) return { car, scores, matchScore: 0 };
         if (price < 20000) matchScore *= 1.4;
         else if (price <= 35000) matchScore *= 1.2;
         else matchScore *= 0.4;
      } 
      else if (filters.expensePreference === "balanced") {
         if (price < 20000) return { car, scores, matchScore: 0 };
         if (price > 70000) return { car, scores, matchScore: 0 };
         if (price >= 25000 && price < 48000) matchScore *= 1.25;
         else if (price >= 48000 && price <= 60000) matchScore *= 1.0;
         else if (price >= 60000 && price <= 70000) matchScore *= 0.5;
         if (price < 25000) matchScore *= 0.8;
      } 
      else if (filters.expensePreference === "high") {
         if (price < 40000) return { car, scores, matchScore: 0 };
         if (price >= 50000 && price <= 120000) matchScore *= 1.1;
         if (price > 120000) matchScore *= 0.7; 
      }
      else if (filters.expensePreference === "unlimited") {
         if (price > 75000) matchScore *= 1.3;
         if (price < 60000) matchScore *= 0.5; 
      }
    }

    if (filters?.isFamily) {
       if (isLuxBrand && filters.expensePreference !== "high" && filters.expensePreference !== "unlimited") {
         return { car, scores, matchScore: 0 };
       }

       if (filters.familyStyle === "practical") {
           if (body.includes("minivan")) {
             matchScore *= 2.5;
           } else if (body.includes("suv") || body.includes("crossover")) {
             matchScore *= 1.4;
           } else if (body.includes("wagon")) {
             matchScore *= 1.3;
           }

           if (body.includes("coupe") || body.includes("convertible")) {
             return { car, scores, matchScore: 0 };
           }
       } else {
           if (body.includes("suv") || body.includes("crossover")) {
             matchScore *= 1.6;
           } else if (body.includes("minivan")) {
             matchScore *= 1.2;
           }
       }

       if (body.includes("van") && !body.includes("minivan")) {
           matchScore *= 0.2;
       }

       if (body.includes("truck")) {
           matchScore *= 0.3;
       }
    }

    if (filters?.forceUtility) {
       if (isLuxBrand && filters.expensePreference !== "high" && filters.expensePreference !== "unlimited") {
         return { car, scores, matchScore: 0 };
       }

       const cargo = Math.max(car.cargoCapacity || 0, car.maxCargoCapacity || 0);
       const tow = car.maxTowingCapacity || 0;
       const isUtility = body.includes("truck") || body.includes("van");

       if (!isUtility) {
         matchScore *= 0.15;
       } else {
         matchScore *= 3.0;
       }

       if (tow > 5000) matchScore *= 1.5;
       if (cargo > 60) matchScore *= 1.3;
    }

    if (filters?.forceSport) {
       const hp = car.horsepower || 0;
       const isSportyBody = body.includes("coupe") || body.includes("convertible") || body.includes("sport");

       if (hp > 400) matchScore *= 1.5; 
       else if (hp > 300) matchScore *= 1.3;
       
       if (isSportyBody) matchScore *= 1.4;

       const hpThreshold = filters.expensePreference === "low" ? 140 : 200;
       if (hp < hpThreshold && !isSportyBody) matchScore *= 0.5;

       const isBoring = !filters.forceUtility && (body.includes("minivan") || body.includes("van") || (body.includes("suv") && hp < 250));
       if (isBoring) matchScore *= 0.3;
       
       if (scores[Categories.PERFORMANCE] > 80) matchScore *= 1.2;
    }

    if (filters?.forceLuxury) {
       if (isLuxBrand) matchScore *= 1.5; 

       const premiumBrands = ["mazda", "volkswagen", "mini", "gmc", "jeep"];
       if (!isLuxBrand && premiumBrands.some(b => brand.includes(b))) {
           matchScore *= 1.2;
       }
    
       if (filters.expensePreference !== "low" && filters.expensePreference !== "balanced") {
          if (price > 75000) matchScore *= 1.2; 
          if (price > 120000) matchScore *= 1.15;
          if (scores[Categories.LUXURY] > 70) matchScore *= 1.2;
       }

       if (scores[Categories.COMFORT] > 70) matchScore *= 1.15;
       if (scores[Categories.TECHNOLOGY] > 70) matchScore *= 1.1;
    }

    if (filters?.sizePreference) {
      const length = car.length || 0;

      if (filters.sizePreference === "small") {
        if (body.includes("truck") || body.includes("van") || body.includes("minivan") || body.includes("large suv")) {
            return { car, scores, matchScore: 0 }; 
        }
        
        if (length > 185) {
           if (!body.includes("coupe") && !body.includes("convertible")) {
               return { car, scores, matchScore: 0 }; 
           }
           matchScore *= 0.4; 
        } else if (length < 178 || body.includes("compact") || body.includes("hatchback")) {
           matchScore *= 1.3; 
        }
      } 
      else if (filters.sizePreference === "mid") {
        if (length < 170 || length > 200 || body.includes("truck") || body.includes("van")) {
           matchScore *= 0.6; 
        } else if (length >= 175 && length <= 195) {
           matchScore *= 1.2; 
        }
      }
      else if (filters.sizePreference === "large") {
        if (length < 190 || body.includes("compact") || body.includes("small")) {
           matchScore *= 0.5; 
        } else if (length >= 195 && length <= 215) {
           matchScore *= 1.2; 
        }

        if (body.includes("suv")) matchScore *= 1.1;

        if (body.includes("van") && !body.includes("minivan") && !filters.forceUtility && filters.cargoNeeds !== "high") {
           matchScore *= 0.7;
        }
      }
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

       if (filters.drivingPosition === "low") {
           if (height > 62 || body.includes("suv") || body.includes("truck") || body.includes("van")) {
               return { car, scores, matchScore: 0 };
           }
           if (height < 58 || body.includes("coupe") || body.includes("sedan") || body.includes("hatchback")) {
               matchScore *= 1.2;
           }
       } else if (filters.drivingPosition === "high") {
           if (height < 60 && !body.includes("suv")) {
               return { car, scores, matchScore: 0 };
           }
           if (body.includes("suv") || body.includes("truck") || body.includes("van")) {
               matchScore *= 1.2;
           }
       }
    }

    if (filters?.fuelPriority === "critical") {
      const mpg = car.epaCombinedMpg || 0;
      const isEV = car.fuelType?.toLowerCase().includes("electric") || car.mpge > 0;
      if (!isEV && mpg < 30) {
        return { car, scores, matchScore: 0 };
      }
    } else if (filters?.fuelPriority === "high") {
      const mpg = car.epaCombinedMpg || 0;
      const isEV = car.fuelType?.toLowerCase().includes("electric") || car.mpge > 0;
      if (!isEV && mpg < 25) {
        if (filters.forceUtility) {
             matchScore *= 0.8;
        } else {
             matchScore *= 0.4;
        }
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
       
       if (filters.cargoNeeds === "high") {
          const isUtility = body.includes("truck") || body.includes("van") || body.includes("minivan");
       
          if (isUtility) {
             matchScore *= 1.2; 
          } 

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
