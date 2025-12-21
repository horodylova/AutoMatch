export const Categories = {
  PRACTICALITY: "Practicality & Everyday Usability",
  COMFORT: "Comfort & Cabin Experience",
  PERFORMANCE: "Performance & Driving Dynamics",
  EFFICIENCY: "Efficiency & Running Costs",
  LUXURY: "Luxury & Status Feel",
  TECHNOLOGY: "Technology & Innovation",
  ADVENTURE: "Adventure & Capability (Outdoors / Work)",
  CITY: "City-Friendly & Urban Life",
  ROAD_TRIP: "Road-Trip & Long-Distance Comfort",
  RELIABILITY: "Reliability & Ownership Confidence (Proxy)",
} as const;

export type CategoryValue = typeof Categories[keyof typeof Categories];
