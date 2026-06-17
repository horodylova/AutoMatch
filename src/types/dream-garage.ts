import type { CarSpecs } from "@/utils/carScoring";

export type DreamGarageRole =
  | "daily"
  | "hauler"
  | "thrill"
  | "statement"
  | "explorer"
  | "project";

export type DreamGarageBay = {
  id: string;
  role: DreamGarageRole;
  allocationPct: number;
};

export type DreamGarageSignal = {
  source: string;
  label: string;
  suggestedRole: DreamGarageRole;
};

export type DreamGarageMatchedCar = {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  image: string;
  price: number;
  bodyType: string;
  driveType: string;
  fuelType: string;
};

export type DreamGarageResultItem = {
  bayId: string;
  role: DreamGarageRole;
  allocationPct: number;
  allocationAmount: number;
  status: "matched" | "unfilled";
  reason?: string;
  leftover: number;
  car?: DreamGarageMatchedCar;
};

export type DreamGarageResponse = {
  garage: DreamGarageResultItem[];
  totalBudget: number;
  totalSpent: number;
  budgetLeftover: number;
  totalAllocatedPct: number;
};

export type DreamGarageRoleMeta = {
  key: DreamGarageRole;
  label: string;
  description: string;
};

export type RoleScoreContext = {
  maxMsrp: number;
  maxHorsepower: number;
  maxCargo: number;
  maxTowing: number;
  maxMpg: number;
};

export type RoleMatcher = {
  match: (car: CarSpecs) => boolean;
  score: (car: CarSpecs, ctx: RoleScoreContext) => number;
};
