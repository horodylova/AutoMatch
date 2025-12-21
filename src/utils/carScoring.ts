import { Categories, CategoryValue } from "../constants/categories";

export type Row = (string | number | boolean | null)[];

export interface CarSpecs {
  id: string; // generated or row index
  make: string;
  model: string;
  year: number;
  trim: string;
  image: string; // Placeholder or parsed if available

  // Practicality
  bodyType: string;
  doors: number;
  totalSeating: number;
  cargoCapacity: number;
  maxCargoCapacity: number;
  curbWeight: number;
  turningCircle: number;

  // Comfort
  headroomFront: number;
  legroomFront: number;
  shoulderRoomFront: number;
  headroomRear: number;
  legroomRear: number;
  shoulderRoomRear: number;
  hipRoomRear: number;
  wheelbase: number;

  // Performance
  horsepower: number;
  torque: number;
  engineSize: number;
  cylinders: number;
  driveType: string;
  transmission: string;
  classification: string;

  // Efficiency
  baseMsrp: number;
  baseInvoice: number;
  fuelType: string;
  fuelTankCapacity: number;
  epaCombinedMpg: number;
  epaCityMpg: number;
  epaHighwayMpg: number;
  rangeCity: number;
  rangeHwy: number;

  // EV
  mpge: number;
  evRange: number;
  batteryCapacity: number;
  chargingTime: number;

  // Adventure
  maxTowingCapacity: number;
  maxPayload: number;
  groundClearance: number;

  // City
  length: number;
  width: number;

  // Reliability
  basicWarranty: string; // e.g., "3 yr / 36,000 mi" - need to parse?
  drivetrainWarranty: string;
  roadsideAssistance: string;
  rustWarranty: string;
  countryOfOrigin: string;
}

// Helper functions
function num(x: unknown): number {
  if (x == null) return 0;
  const s = String(x).trim();
  if (!s) return 0;
  const m = s.replace(/[$,]/g, "");
  // Match number, potentially with decimals
  const parts = m.match(/(-?\d+(?:\.\d+)?)/g);
  if (!parts) return 0;
  // Use the last number found (often handles ranges like "20-30" by taking 30, or units like "2.5 L" -> 2.5)
  // For ranges like "$30,000 - $40,000", taking the last one is max.
  const n = Number(parts[parts.length - 1]);
  if (Number.isFinite(n)) return n;
  return 0;
}

function parseCityHighway(s: string): { city: number; hwy: number } | null {
  const m = s.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const a = Number(m[1]);
  const b = Number(m[2]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return { city: a, hwy: b };
}

function clamp01(x: number): number {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

function norm(v: number, min: number, max: number): number {
  if (!Number.isFinite(v) || !Number.isFinite(min) || !Number.isFinite(max)) return 0;
  if (max <= min) return 0;
  return clamp01((v - min) / (max - min));
}

// Parsing logic
export function parseCarData(row: Row, idxMap: Record<string, number>): CarSpecs {
  const idx = (name: string) => idxMap[name.toLowerCase()] ?? -1;
  const val = (name: string) => {
    const i = idx(name);
    return i >= 0 ? row[i] : null;
  };
  const str = (name: string) => String(val(name) ?? "").trim();
  const n = (name: string) => num(val(name));

  const cityHwy = str("epa city/highway mpg") || str("city/highway mpg");
  const parsedMpg = parseCityHighway(cityHwy);
  
  // Image extraction logic aligned with CarDetails.tsx
  const processImage = (raw: string): string | null => {
    if (!raw) return null;
    const arr = raw.split(/[;,]/).map(s => s.trim()).filter(Boolean);
    const sanitize = (u: string): string | null => {
      // Remove quotes, trailing parenthesis, replace spaces
      const cleaned = u.replace(/^['"]|['"]$/g, "").replace(/[)]+$/, "").replace(/\s+/g, "%20");
      if (cleaned.startsWith("https://") || cleaned.startsWith("http://") || cleaned.startsWith("/")) return cleaned;
      if (cleaned.startsWith("www.")) return `https://${cleaned}`;
      return null;
    };
    
    // Return first valid image
    for (const url of arr) {
      const s = sanitize(url);
      if (s && !s.includes("no-image-available")) return s;
    }
    return null;
  };

  const rawImage = str("image url") || str("image") || str("photo") || str("photos") || str("picture") || str("pictures") || str("url") || str("photo url") || str("calculated_image_url");
  let image = processImage(rawImage);

  if (!image) {
    // If we have make/model, we might construct a path, but better to leave empty and handle in UI
    image = "/placeholder-car.jpg"; 
  }

  return {
    id: str("id"), // Strict ID from table, no fallback to index
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
    classification: str("classification"), // or "EPA Classification"

    baseMsrp: n("base msrp"),
    baseInvoice: n("base invoice"),
    fuelType: str("fuel type"),
    fuelTankCapacity: n("fuel tank capacity (gal)"),
    epaCombinedMpg: n("epa combined mpg"),
    epaCityMpg: parsedMpg ? parsedMpg.city : 0,
    epaHighwayMpg: parsedMpg ? parsedMpg.hwy : 0,
    rangeCity: 0, // Need column name verification, assuming inferred from mpg * tank if not present
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

// Stats for normalization
export interface GlobalStats {
  hpMin: number; hpMax: number;
  msrpMin: number; msrpMax: number;
  cargoMin: number; cargoMax: number;
  towMin: number; towMax: number;
  lenMin: number; lenMax: number;
  wbMin: number; wbMax: number;
  mpgMin: number; mpgMax: number;
  rangeMin: number; rangeMax: number;
}

export function calculateGlobalStats(cars: CarSpecs[]): GlobalStats {
  const s = {
    hpMin: Infinity, hpMax: -Infinity,
    msrpMin: Infinity, msrpMax: -Infinity,
    cargoMin: Infinity, cargoMax: -Infinity,
    towMin: Infinity, towMax: -Infinity,
    lenMin: Infinity, lenMax: -Infinity,
    wbMin: Infinity, wbMax: -Infinity,
    mpgMin: Infinity, mpgMax: -Infinity,
    rangeMin: Infinity, rangeMax: -Infinity,
  };

  for (const c of cars) {
    if (c.horsepower) { s.hpMin = Math.min(s.hpMin, c.horsepower); s.hpMax = Math.max(s.hpMax, c.horsepower); }
    if (c.baseMsrp) { s.msrpMin = Math.min(s.msrpMin, c.baseMsrp); s.msrpMax = Math.max(s.msrpMax, c.baseMsrp); }
    if (c.cargoCapacity) { s.cargoMin = Math.min(s.cargoMin, c.cargoCapacity); s.cargoMax = Math.max(s.cargoMax, c.cargoCapacity); }
    if (c.maxTowingCapacity) { s.towMin = Math.min(s.towMin, c.maxTowingCapacity); s.towMax = Math.max(s.towMax, c.maxTowingCapacity); }
    if (c.length) { s.lenMin = Math.min(s.lenMin, c.length); s.lenMax = Math.max(s.lenMax, c.length); }
    if (c.wheelbase) { s.wbMin = Math.min(s.wbMin, c.wheelbase); s.wbMax = Math.max(s.wbMax, c.wheelbase); }
    
    // MPG / MPGe logic
    const eff = c.mpge || c.epaCombinedMpg;
    if (eff) { s.mpgMin = Math.min(s.mpgMin, eff); s.mpgMax = Math.max(s.mpgMax, eff); }

    const range = c.evRange || (c.epaCombinedMpg * c.fuelTankCapacity);
    if (range) { s.rangeMin = Math.min(s.rangeMin, range); s.rangeMax = Math.max(s.rangeMax, range); }
  }
  
  // Fallbacks if no data
  if (s.hpMin === Infinity) { s.hpMin = 100; s.hpMax = 500; }
  if (s.msrpMin === Infinity) { s.msrpMin = 20000; s.msrpMax = 100000; }
  
  return s;
}

// Scoring Logic
export function calculateCarScores(car: CarSpecs, stats: GlobalStats): Record<CategoryValue, number> {
  const scores: Record<CategoryValue, number> = {
    [Categories.PRACTICALITY]: 0,
    [Categories.COMFORT]: 0,
    [Categories.PERFORMANCE]: 0,
    [Categories.EFFICIENCY]: 0,
    [Categories.LUXURY]: 0,
    [Categories.TECHNOLOGY]: 0,
    [Categories.ADVENTURE]: 0,
    [Categories.CITY]: 0,
    [Categories.ROAD_TRIP]: 0,
    [Categories.RELIABILITY]: 0,
  };

  const body = car.bodyType.toLowerCase();
  const fuel = car.fuelType.toLowerCase();
  const drive = car.driveType.toLowerCase();

  // 1. Practicality & Everyday Usability
  let prac = 0;
  // Body type
  if (body.includes("wagon") || body.includes("suv") || body.includes("minivan") || body.includes("crossover")) prac += 40;
  else if (body.includes("hatch") || body.includes("sedan")) prac += 20;
  else prac += 5; // Coupe/Convertible

  // Cargo
  const cargoNorm = norm(car.cargoCapacity || car.maxCargoCapacity, stats.cargoMin, stats.cargoMax);
  prac += cargoNorm * 30;

  // Doors/Seats
  if (car.doors >= 4) prac += 15;
  if (car.totalSeating >= 5) prac += 15;
  
  scores[Categories.PRACTICALITY] = Math.min(100, prac);


  // 2. Comfort & Cabin Experience
  let comf = 0;
  const wbNorm = norm(car.wheelbase, stats.wbMin, stats.wbMax);
  comf += wbNorm * 30; // Longer wheelbase = smoother ride

  // Space (Sum of legrooms/headrooms if available)
  const frontSpace = (car.headroomFront + car.legroomFront + car.shoulderRoomFront);
  const rearSpace = (car.headroomRear + car.legroomRear + car.shoulderRoomRear);
  // Rough heuristic: > 120 inch sum is good
  if (frontSpace > 115) comf += 20;
  if (rearSpace > 110) comf += 20;
  if (car.totalSeating >= 5) comf += 10;
  
  // Luxury usually implies comfort
  if (car.baseMsrp > 50000) comf += 20;

  scores[Categories.COMFORT] = Math.min(100, comf);


  // 3. Performance & Driving Dynamics
  let perf = 0;
  const hpNorm = norm(car.horsepower, stats.hpMin, stats.hpMax);
  perf += hpNorm * 40;

  if (car.torque > 0) {
      // Assuming torque loosely correlates with hp stats for normalization
      perf += norm(car.torque, stats.hpMin, stats.hpMax) * 20; 
  }

  // Drive type
  if (drive.includes("rwd") || drive.includes("rear")) perf += 15;
  if (drive.includes("awd") || drive.includes("all")) perf += 10;

  // Transmission
  const trans = car.transmission.toLowerCase();
  if (trans.includes("dual") || trans.includes("dct") || trans.includes("manual")) perf += 15;

  // Classification
  if (car.classification.toLowerCase().includes("sport") || car.bodyType.toLowerCase().includes("coupe")) perf += 10;

  scores[Categories.PERFORMANCE] = Math.min(100, perf);


  // 4. Efficiency & Running Costs
  let eff = 0;
  const mpgVal = car.mpge || car.epaCombinedMpg;
  const mpgNorm = norm(mpgVal, stats.mpgMin, stats.mpgMax);
  eff += mpgNorm * 40;

  // Price (lower is better for running costs/efficiency usually correlates with economy cars)
  const priceNorm = norm(car.baseMsrp, stats.msrpMin, stats.msrpMax);
  eff += (1 - priceNorm) * 30;

  if (fuel.includes("hybrid") || fuel.includes("electric")) eff += 20;
  if (car.rangeCity > 300 || car.epaCombinedMpg > 30) eff += 10;

  scores[Categories.EFFICIENCY] = Math.min(100, eff);


  // 5. Luxury & Status Feel
  let lux = 0;
  lux += priceNorm * 60; // Price is main proxy
  if (car.trim.toLowerCase().includes("platinum") || car.trim.toLowerCase().includes("limited") || car.trim.toLowerCase().includes("amg") || car.trim.toLowerCase().includes("m sport")) lux += 20;
  if (car.make.match(/Mercedes|BMW|Audi|Porsche|Lexus|Land Rover|Jaguar|Cadillac|Lincoln|Volvo/i)) lux += 20;

  scores[Categories.LUXURY] = Math.min(100, lux);


  // 6. Technology & Innovation
  let tech = 0;
  if (fuel.includes("electric")) tech += 50;
  else if (fuel.includes("hybrid") || fuel.includes("plug-in")) tech += 30;
  
  // Year proxy (newer = more tech)
  if (car.year >= 2024) tech += 20;
  else if (car.year >= 2023) tech += 10;

  // Features count would be ideal, but parsing is complex. 
  // High trim often implies tech.
  if (car.baseMsrp > 60000) tech += 20; // Expensive cars have more tech
  
  if (car.mpge > 0) tech += 10;

  scores[Categories.TECHNOLOGY] = Math.min(100, tech);


  // 7. Adventure & Capability
  let adv = 0;
  const towNorm = norm(car.maxTowingCapacity, stats.towMin, stats.towMax);
  adv += towNorm * 30;

  if (drive.includes("awd") || drive.includes("4wd") || drive.includes("4x4")) adv += 30;
  
  if (car.groundClearance > 7) adv += 20;
  if (body.includes("truck") || body.includes("suv")) adv += 20;

  scores[Categories.ADVENTURE] = Math.min(100, adv);


  // 8. City-Friendly & Urban Life
  let city = 0;
  // Length (shorter is better)
  const lenNorm = norm(car.length, stats.lenMin, stats.lenMax);
  city += (1 - lenNorm) * 40;

  // Turning circle (smaller is better) - assume range 30-50ft
  if (car.turningCircle > 0) {
      const tcNorm = norm(car.turningCircle, 30, 50);
      city += (1 - tcNorm) * 20;
  } else {
      city += (1 - lenNorm) * 10; // fallback
  }

  // City MPG
  const cityMpgNorm = norm(car.epaCityMpg, stats.mpgMin, stats.mpgMax);
  city += cityMpgNorm * 20;

  if (body.includes("hatch") || body.includes("compact") || (car.length < 180 && car.length > 0)) city += 20;

  scores[Categories.CITY] = Math.min(100, city);


  // 9. Road-Trip & Long-Distance Comfort
  let road = 0;
  // Range
  const rangeVal = car.evRange || (car.epaCombinedMpg * car.fuelTankCapacity);
  const rangeNorm = norm(rangeVal, 200, 600); // 200-600 miles typical range
  road += rangeNorm * 40;

  // Comfort (wheelbase/space)
  road += wbNorm * 20;
  if (car.cargoCapacity > 20) road += 10;

  // Highway MPG
  const hwyMpgNorm = norm(car.epaHighwayMpg, stats.mpgMin, stats.mpgMax);
  road += hwyMpgNorm * 30;

  scores[Categories.ROAD_TRIP] = Math.min(100, road);


  // 10. Reliability & Ownership Confidence
  let rel = 0;
  // Warranty proxy
  if (car.basicWarranty.match(/5\s*yr|6\s*yr|10\s*yr/i)) rel += 20; // 5+ year warranty
  else if (car.basicWarranty.match(/4\s*yr/i)) rel += 15;
  else rel += 10; // 3yr standard

  if (car.drivetrainWarranty.match(/10\s*yr|100,?000/i)) rel += 15;

  if (car.roadsideAssistance) rel += 5;
  if (car.rustWarranty) rel += 5;

  // Brand proxy
  if (car.make.match(/Toyota|Lexus|Honda|Mazda|Subaru|Porsche/i)) rel += 40;
  else if (car.make.match(/Ford|Chevrolet|Nissan|BMW|Mercedes/i)) rel += 20;

  scores[Categories.RELIABILITY] = Math.min(100, rel);

  return scores;
}

export interface ScoredCar {
  car: CarSpecs;
  scores: Record<CategoryValue, number>;
  matchScore: number;
}

export function matchCars(cars: CarSpecs[], userPreferences: Record<CategoryValue, number>): ScoredCar[] {
  const stats = calculateGlobalStats(cars);
  
  return cars.map(car => {
    const scores = calculateCarScores(car, stats);
    let totalScore = 0;
    
    // Dot product: sum(userWeight * carScore)
    // userPreferences values are likely 0-1 or 0-100? Assuming they are relative weights.
    // If userPreferences are just accumulated counts, we should probably normalize them or just sum.
    
    for (const [cat, weight] of Object.entries(userPreferences)) {
      const w = weight as number;
      const s = scores[cat as CategoryValue] || 0;
      totalScore += w * s;
    }

    return {
      car,
      scores,
      matchScore: totalScore
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
