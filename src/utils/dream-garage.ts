import { getQuestionAnswer } from "@/utils/storage";
import type { CarSpecs } from "@/utils/carScoring";
import { hasRealImage } from "@/utils/carScoring";
import type {
  DreamGarageBay,
  DreamGarageMatchedCar,
  DreamGarageResponse,
  DreamGarageResultItem,
  DreamGarageRole,
  DreamGarageRoleMeta,
  DreamGarageSignal,
  RoleMatcher,
  RoleScoreContext,
} from "@/types/dream-garage";

export const DREAM_GARAGE_ROLES: DreamGarageRoleMeta[] = [
  { key: "daily", label: "Daily Driver", description: "Everyday, easy, efficient" },
  { key: "hauler", label: "Family Hauler", description: "Space for people and gear" },
  { key: "thrill", label: "Weekend Thrill", description: "Fun first, practical second" },
  { key: "statement", label: "The Statement", description: "Looks expensive because it is" },
  { key: "explorer", label: "The Explorer", description: "Snow, trails, rough roads" },
  { key: "project", label: "The Project", description: "Manual, niche, enthusiast energy" },
];

const LUXURY_MAKES = [
  "aston martin",
  "bentley",
  "bugatti",
  "ferrari",
  "lamborghini",
  "maserati",
  "mclaren",
  "porsche",
  "rolls-royce",
];

const DAILY_MAKES = [
  "acura",
  "audi",
  "bmw",
  "buick",
  "cadillac",
  "chevrolet",
  "chrysler",
  "dodge",
  "fiat",
  "ford",
  "genesis",
  "honda",
  "hyundai",
  "infiniti",
  "jaguar",
  "kia",
  "lexus",
  "lincoln",
  "mazda",
  "mercedes-benz",
  "mini",
  "mitsubishi",
  "nissan",
  "polestar",
  "subaru",
  "tesla",
  "toyota",
  "volkswagen",
  "volvo",
];

const HAULER_MAKES = [
  "acura",
  "audi",
  "bmw",
  "buick",
  "cadillac",
  "chevrolet",
  "chrysler",
  "dodge",
  "ford",
  "gmc",
  "honda",
  "hyundai",
  "infiniti",
  "jeep",
  "kia",
  "land rover",
  "lexus",
  "lincoln",
  "mazda",
  "mercedes-benz",
  "mini",
  "mitsubishi",
  "nissan",
  "porsche",
  "subaru",
  "tesla",
  "toyota",
  "volkswagen",
  "volvo",
];

const THRILL_MAKES = [
  "alfa romeo",
  "aston martin",
  "audi",
  "bmw",
  "chevrolet",
  "dodge",
  "ferrari",
  "ford",
  "jaguar",
  "lamborghini",
  "lexus",
  "maserati",
  "mazda",
  "mclaren",
  "mercedes-benz",
  "nissan",
  "porsche",
  "tesla",
  "toyota",
];

const EXPLORER_MAKES = [
  "chevrolet",
  "ford",
  "gmc",
  "ineos",
  "jeep",
  "land rover",
  "lexus",
  "mercedes-benz",
  "nissan",
  "ram",
  "rivian",
  "subaru",
  "toyota",
  "audi",
  "bmw",
  "cadillac",
  "dodge",
  "honda",
  "hyundai",
  "kia",
  "lincoln",
  "mazda",
  "mitsubishi",
  "porsche",
  "volkswagen",
  "volvo",
];

const PROJECT_MAKES = [
  "alfa romeo",
  "aston martin",
  "audi",
  "bmw",
  "chevrolet",
  "dodge",
  "fiat",
  "ford",
  "honda",
  "jaguar",
  "mazda",
  "mini",
  "mitsubishi",
  "nissan",
  "porsche",
  "subaru",
  "toyota",
  "volkswagen",
];

function lower(value: string | number | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

function includesAny(value: string, parts: string[]) {
  return parts.some((part) => value.includes(part));
}

function getBodyBucket(bodyType: string) {
  const body = lower(bodyType);
  if (body === "convertible") return "convertible";
  if (body === "coupe") return "coupe";
  if (body === "ext van" || body === "van") return "van";
  if (body === "hatchback") return "hatchback";
  if (body === "minivan") return "minivan";
  if (body === "sedan") return "sedan";
  if (body === "suv") return "suv";
  if (body === "wagon") return "wagon";
  if (body.startsWith("truck")) return "truck";
  return "other";
}

function isFamilyTruckBody(bodyType: string) {
  const body = lower(bodyType);
  return includesAny(body, ["crew cab", "crewmax", "double cab", "mega cab", "quad cab", "supercrew"]);
}

function getHaulerBodyValue(car: CarSpecs) {
  const body = lower(car.bodyType);
  const bucket = getBodyBucket(body);
  const seating = car.totalSeating || 0;

  if (bucket === "suv") return seating >= 7 ? 1 : 0.94;
  if (bucket === "minivan") return 0.92;
  if (bucket === "wagon") return 0.78;
  if (bucket === "sedan") return seating >= 5 ? 0.52 : 0.12;
  if (bucket === "truck") return isFamilyTruckBody(body) && seating >= 5 ? 0.46 : 0.14;
  if (bucket === "van") return body === "van" ? 0.24 : 0.1;
  return seating >= 6 ? 0.36 : 0.08;
}

function safeDiv(a: number, b: number) {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= 0) return 0;
  return a / b;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function buildScoreContext(cars: CarSpecs[]): RoleScoreContext {
  const maxMsrp = Math.max(...cars.map((car) => car.baseMsrp || 0), 1);
  const maxHorsepower = Math.max(...cars.map((car) => car.horsepower || 0), 1);
  const maxCargo = Math.max(...cars.map((car) => Math.max(car.cargoCapacity || 0, car.maxCargoCapacity || 0)), 1);
  const maxTowing = Math.max(...cars.map((car) => car.maxTowingCapacity || 0), 1);
  const maxMpg = Math.max(...cars.map((car) => car.mpge || car.epaCombinedMpg || 0), 1);
  return { maxMsrp, maxHorsepower, maxCargo, maxTowing, maxMpg };
}

export function getRoleMeta(role: DreamGarageRole) {
  return DREAM_GARAGE_ROLES.find((item) => item.key === role) || DREAM_GARAGE_ROLES[0];
}

export function createDefaultBays(): DreamGarageBay[] {
  return [
    { id: "bay-1", role: "daily", allocationPct: 35 },
    { id: "bay-2", role: "hauler", allocationPct: 35 },
    { id: "bay-3", role: "thrill", allocationPct: 30 },
  ];
}

export function normalizeBays(bays: DreamGarageBay[]): DreamGarageBay[] {
  return bays.map((bay) => ({
    ...bay,
    allocationPct: Math.max(5, Math.min(100, Math.round(bay.allocationPct))),
  }));
}

export function redistributeAllocations(bays: DreamGarageBay[], newCount: number): DreamGarageBay[] {
  if (newCount <= 0) return bays;
  
  const currentTotal = bays.reduce((sum, bay) => sum + bay.allocationPct, 0);
  
  if (newCount === bays.length) {
    // Если количество не изменилось, просто нормализуем
    return normalizeBays(bays);
  }
  
  if (newCount > bays.length) {
    // Добавляем новый бей - равномерно уменьшаем все существующие
    const newBayAllocation = Math.max(10, Math.floor(100 / newCount));
    const remainingForExisting = 100 - newBayAllocation;
    const scaleFactor = remainingForExisting / currentTotal;
    
    const updatedBays = bays.map((bay) => ({
        ...bay,
        allocationPct: Math.max(5, Math.round(bay.allocationPct * scaleFactor)),
      }));
    
    // Определяем следующую доступную роль
    const currentRoles = updatedBays.map((bay) => bay.role);
    const orderedRoles = DREAM_GARAGE_ROLES.map((role) => role.key);
    const nextRole = orderedRoles.find((role) => !currentRoles.includes(role)) || "daily";
    
    // Добавляем новый бей с оставшимся процентом
    const totalAfterUpdate = updatedBays.reduce((sum, bay) => sum + bay.allocationPct, 0);
    const finalNewBayAllocation = Math.max(10, 100 - totalAfterUpdate);
    
    return [
      ...updatedBays,
      {
        id: `bay-${Date.now()}`,
        role: nextRole,
        allocationPct: finalNewBayAllocation,
      },
    ];
  } else {
    // Удаляем бей - перераспределяем его аллокацию пропорционально между оставшимися
    const removedBay = bays[bays.length - 1];
    const remainingBays = bays.slice(0, newCount);
    const remainingTotal = remainingBays.reduce((sum, bay) => sum + bay.allocationPct, 0);
    
    if (remainingTotal <= 0) return remainingBays;
    
    const scaleFactor = (remainingTotal + removedBay.allocationPct) / remainingTotal;
    
    return remainingBays.map((bay) => ({
      ...bay,
      allocationPct: Math.max(5, Math.round(bay.allocationPct * scaleFactor)),
    }));
  }
}

export function getDreamGarageSignals(): DreamGarageSignal[] {
  const signals: DreamGarageSignal[] = [];

  const emotion = getQuestionAnswer<{ key?: string; title?: string }>("emotional_expectation");
  if (emotion?.key === "status_achievement") {
    signals.push({ source: "Quiz", label: "Status & Achievement", suggestedRole: "statement" });
  }
  if (emotion?.key === "joy_excitement") {
    signals.push({ source: "Quiz", label: "Joy & Excitement", suggestedRole: "thrill" });
  }
  if (emotion?.key === "freedom_possibility") {
    signals.push({ source: "Quiz", label: "Freedom & Possibility", suggestedRole: "explorer" });
  }

  const morning = getQuestionAnswer<{ key?: string; title?: string }>("perfect_morning");
  if (morning?.key === "family_chaos") {
    signals.push({ source: "Quiz", label: "Family chaos morning", suggestedRole: "hauler" });
  }
  if (morning?.key === "fast_commute" || morning?.key === "quiet_coffee") {
    signals.push({ source: "Quiz", label: morning.title || "Daily routine", suggestedRole: "daily" });
  }

  const cargo = getQuestionAnswer<{ title?: string }>("car_cargo_preference");
  if (cargo?.title && includesAny(lower(cargo.title), ["kids", "luggage", "large", "equipment", "groceries"])) {
    signals.push({ source: "Quiz", label: cargo.title, suggestedRole: "hauler" });
  }

  const control = getQuestionAnswer<{ title?: string }>("control_preference");
  if (control?.title && includesAny(lower(control.title), ["manual", "control", "engaged"])) {
    signals.push({ source: "Quiz", label: control.title, suggestedRole: "project" });
  }

  const weather = getQuestionAnswer<{ title?: string }>("bad_weather_focus");
  if (weather?.title && includesAny(lower(weather.title), ["traction", "grip", "visibility", "stability"])) {
    signals.push({ source: "Quiz", label: weather.title, suggestedRole: "explorer" });
  }

  const unique = new Map<string, DreamGarageSignal>();
  for (const signal of signals) {
    unique.set(`${signal.suggestedRole}:${signal.label}`, signal);
  }
  return Array.from(unique.values()).slice(0, 4);
}

export function buildPrefilledBaysFromSignals(signals: DreamGarageSignal[]): DreamGarageBay[] {
  if (signals.length === 0) return createDefaultBays();

  const orderedRoles: DreamGarageRole[] = [];
  for (const signal of signals) {
    if (!orderedRoles.includes(signal.suggestedRole)) {
      orderedRoles.push(signal.suggestedRole);
    }
  }

  if (!orderedRoles.includes("daily")) {
    orderedRoles.unshift("daily");
  }

  const limited = orderedRoles.slice(0, 4);
  const defaultAllocations = limited.length === 2 ? [55, 45] : limited.length === 3 ? [35, 35, 30] : [30, 25, 25, 20];

  return limited.map((role, index) => ({
    id: `bay-${index + 1}`,
    role,
    allocationPct: defaultAllocations[index] || 20,
  }));
}

const roleMatchers: Record<DreamGarageRole, RoleMatcher> = {
  daily: {
    match: (car) => {
      const body = lower(car.bodyType);
      const bucket = getBodyBucket(body);
      const classification = lower(car.classification);
      const mpg = car.mpge || car.epaCombinedMpg || 0;
      const make = lower(car.make);
      
      return (
        (["sedan", "hatchback", "wagon"].includes(bucket) ||
        (bucket === "suv" && includesAny(classification, ["compact", "midsize", "small"])) ||
        includesAny(classification, ["compact", "midsize", "small"])) &&
        (mpg >= 20 || lower(car.fuelType).includes("electric")) &&
        DAILY_MAKES.some((brand) => make.includes(brand))
      );
    },
    score: (car, ctx) => {
      const mpg = car.mpge || car.epaCombinedMpg || 0;
      const priceValue = 1 - clamp01(safeDiv(car.baseMsrp, ctx.maxMsrp));
      const mpgValue = clamp01(safeDiv(mpg, ctx.maxMpg));
      const reliabilityBonus = clamp01(includesAny(lower(car.make), ["toyota", "lexus", "honda", "mazda", "subaru"]) ? 1 : 0.45);
      const dailyBrandBonus = DAILY_MAKES.some((brand) => lower(car.make).includes(brand)) ? 0.15 : 0;
      return priceValue * 0.3 + mpgValue * 0.35 + reliabilityBonus * 0.2 + dailyBrandBonus;
    },
  },
  hauler: {
    match: (car) => {
      const body = lower(car.bodyType);
      const bucket = getBodyBucket(body);
      const make = lower(car.make);
      
      return (
        (bucket === "suv" ||
        bucket === "minivan" ||
        bucket === "wagon" ||
        (bucket === "sedan" && car.totalSeating >= 5) ||
        (bucket === "truck" && isFamilyTruckBody(body) && car.totalSeating >= 5) ||
        (bucket === "van" && car.totalSeating >= 7) ||
        car.totalSeating >= 6) &&
        HAULER_MAKES.some((brand) => make.includes(brand))
      );
    },
    score: (car, ctx) => {
      const seatingValue = clamp01(safeDiv(car.totalSeating, 8));
      const cargoValue = clamp01(safeDiv(Math.max(car.cargoCapacity, car.maxCargoCapacity), ctx.maxCargo));
      const towingValue = clamp01(safeDiv(car.maxTowingCapacity, ctx.maxTowing));
      const bodyValue = getHaulerBodyValue(car);
      const haulerBrandBonus = HAULER_MAKES.some((brand) => lower(car.make).includes(brand)) ? 0.15 : 0;
      return bodyValue * 0.33 + seatingValue * 0.22 + cargoValue * 0.2 + towingValue * 0.1 + haulerBrandBonus;
    },
  },
  thrill: {
    match: (car) => {
      const bucket = getBodyBucket(car.bodyType);
      const make = lower(car.make);
      return (["coupe", "convertible"].includes(bucket) || car.zeroSixty > 0 && car.zeroSixty <= 5.2) &&
        THRILL_MAKES.some((brand) => make.includes(brand));
    },
    score: (car, ctx) => {
      const hpValue = clamp01(safeDiv(car.horsepower, ctx.maxHorsepower));
      const accelerationValue = car.zeroSixty > 0 ? clamp01((6.5 - car.zeroSixty) / 4.5) : 0;
      const driveBonus = includesAny(lower(car.driveType), ["rwd", "rear", "awd"]) ? 0.12 : 0;
      const thrillBrandBonus = THRILL_MAKES.some((brand) => lower(car.make).includes(brand)) ? 0.15 : 0;
      return hpValue * 0.45 + accelerationValue * 0.33 + driveBonus + thrillBrandBonus;
    },
  },
  statement: {
    match: (car) => {
      const make = lower(car.make);
      const bucket = getBodyBucket(car.bodyType);
      return (car.baseMsrp >= 85000 || LUXURY_MAKES.some((item) => make.includes(item))) &&
        (["sedan", "coupe", "convertible", "suv", "wagon"].includes(bucket) || includesAny(make, LUXURY_MAKES));
    },
    score: (car, ctx) => {
      const priceValue = clamp01(safeDiv(car.baseMsrp, ctx.maxMsrp));
      const hpValue = clamp01(safeDiv(car.horsepower, ctx.maxHorsepower));
      const makeBonus = LUXURY_MAKES.some((item) => lower(car.make).includes(item)) ? 0.2 : 0.08;
      const statementBrandBonus = LUXURY_MAKES.some((brand) => lower(car.make).includes(brand)) ? 0.15 : 0;
      return priceValue * 0.45 + hpValue * 0.2 + makeBonus + statementBrandBonus;
    },
  },
  explorer: {
    match: (car) => {
      const bucket = getBodyBucket(car.bodyType);
      const drive = lower(car.driveType);
      const make = lower(car.make);
      const classification = lower(car.classification);
      
      // Основные критерии для внедорожников
      const hasOffroadDrive = includesAny(drive, ["awd", "4wd", "four-wheel"]);
      const hasOffroadBody = ["suv", "truck", "wagon"].includes(bucket);
      const hasOffroadClassification = includesAny(classification, ["suv", "truck", "off-road", "crossover"]);
      
      // Принимаем машины, которые удовлетворяют хотя бы одному из критериев
      return (hasOffroadDrive || hasOffroadBody || hasOffroadClassification) &&
        EXPLORER_MAKES.some((brand) => make.includes(brand));
    },
    score: (car, ctx) => {
      const bucket = getBodyBucket(car.bodyType);
      const drive = lower(car.driveType);
      const classification = lower(car.classification);
      
      // Базовые оценки
      const clearanceValue = clamp01(safeDiv(car.groundClearance || 0, 12));
      const towingValue = clamp01(safeDiv(car.maxTowingCapacity || 0, ctx.maxTowing));
      const angleValue = clamp01(safeDiv((car.angleApproach || 0) + (car.angleDeparture || 0), 80));
      
      // Бонусы за специфические характеристики
      const driveBonus = includesAny(drive, ["awd", "4wd", "four-wheel"]) ? 0.12 : 0;
      const bodyBonus = ["suv", "truck"].includes(bucket) ? 0.1 : 0;
      const classificationBonus = includesAny(classification, ["suv", "truck", "off-road"]) ? 0.08 : 0;
      const explorerBrandBonus = EXPLORER_MAKES.some((brand) => lower(car.make).includes(brand)) ? 0.15 : 0;
      
      return clearanceValue * 0.25 + towingValue * 0.25 + angleValue * 0.15 + 
             driveBonus + bodyBonus + classificationBonus + explorerBrandBonus;
    },
  },
  project: {
    match: (car) => {
      const bucket = getBodyBucket(car.bodyType);
      const transmission = lower(car.transmission);
      const make = lower(car.make);
      return ["coupe", "convertible", "hatchback"].includes(bucket) && 
        transmission.includes("manual") &&
        PROJECT_MAKES.some((brand) => make.includes(brand));
    },
    score: (car, ctx) => {
      const hpValue = clamp01(safeDiv(car.horsepower, ctx.maxHorsepower));
      const priceValue = 1 - clamp01(safeDiv(car.baseMsrp, ctx.maxMsrp));
      const manualBonus = lower(car.transmission).includes("manual") ? 0.2 : 0;
      const projectBrandBonus = PROJECT_MAKES.some((brand) => lower(car.make).includes(brand)) ? 0.15 : 0;
      return hpValue * 0.3 + priceValue * 0.4 + manualBonus + projectBrandBonus;
    },
  },
};

export function buildGarageMatch(cars: CarSpecs[], totalBudget: number, bays: DreamGarageBay[]): DreamGarageResponse {
  const cleanCars = cars.filter((car) => car.id && car.baseMsrp > 0 && hasRealImage(car));
  const ctx = buildScoreContext(cleanCars);
  const usedIds = new Set<string>();
  const garage: DreamGarageResultItem[] = [];
  const totalAllocatedPct = bays.reduce((sum, bay) => sum + bay.allocationPct, 0);

  for (const bay of bays) {
    const allocationAmount = Math.round(totalBudget * (bay.allocationPct / 100));
    const matcher = roleMatchers[bay.role];
    const roleCandidates = cleanCars.filter((car) => matcher.match(car));
    const available = roleCandidates.filter((car) => !usedIds.has(car.id));
    const affordable = available.filter((car) => car.baseMsrp <= allocationAmount);
    const roleFloor = roleCandidates.reduce((min, car) => Math.min(min, car.baseMsrp), Number.POSITIVE_INFINITY);

    if (affordable.length === 0) {
      let reason = "No matches inside this bay budget.";
      if (!Number.isFinite(roleFloor)) {
        reason = "This role has no matches in the current dataset.";
      } else if (allocationAmount < roleFloor) {
        reason = `Cheapest ${getRoleMeta(bay.role).label.toLowerCase()} starts around $${Math.round(roleFloor).toLocaleString("en-US")}.`;
      }

      garage.push({
        bayId: bay.id,
        role: bay.role,
        allocationPct: bay.allocationPct,
        allocationAmount,
        status: "unfilled",
        reason,
        leftover: allocationAmount,
      });
      continue;
    }

    const ranked = affordable
      .map((car) => ({
        car,
        score: matcher.score(car, ctx),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.car.baseMsrp - a.car.baseMsrp;
      });

    const topScore = ranked[0]?.score ?? 0;
    const shortlist = ranked.filter((entry) => entry.score >= topScore * 0.88);
    const winner = shortlist.sort((a, b) => b.car.baseMsrp - a.car.baseMsrp)[0]?.car || ranked[0].car;
    usedIds.add(winner.id);

    const matchedCar: DreamGarageMatchedCar = {
      id: winner.id,
      make: winner.make,
      model: winner.model,
      year: winner.year,
      trim: winner.trim,
      image: winner.image,
      price: winner.baseMsrp,
      bodyType: winner.bodyType,
      driveType: winner.driveType,
      fuelType: winner.fuelType,
    };

    garage.push({
      bayId: bay.id,
      role: bay.role,
      allocationPct: bay.allocationPct,
      allocationAmount,
      status: "matched",
      leftover: Math.max(0, allocationAmount - winner.baseMsrp),
      car: matchedCar,
    });
  }

  const totalSpent = garage.reduce((sum, item) => sum + (item.car?.price || 0), 0);

  return {
    garage,
    totalBudget,
    totalSpent,
    budgetLeftover: Math.max(0, totalBudget - totalSpent),
    totalAllocatedPct,
  };
}
