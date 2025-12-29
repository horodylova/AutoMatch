"use client";

import { CarSpecs } from "@/utils/carScoring";
import styles from "../../app/compare/compare.module.css";

type Props = {
  car1: CarSpecs;
  car2: CarSpecs;
};

type SectionItem = {
  label: string;
  k: keyof CarSpecs;
  unit: string;
  format?: (v: number | string) => string;
};

type Section = {
  title: string;
  items: SectionItem[];
};

export default function CompareView({ car1, car2 }: Props) {
  
  const formatNum = (n: number, unit: string = "") => {
    if (!n) return "-";
    return `${n.toLocaleString()}${unit}`;
  };

  const sections: Section[] = [
    {
      title: "Overview",
      items: [
        { label: "Fuel Type", k: "fuelType", unit: "" },
        { label: "Engine Type", k: "engineType", unit: "" },
        { label: "Body Type", k: "bodyType", unit: "" },
        { label: "Doors", k: "doors", unit: "" },
        { label: "Total Seating", k: "totalSeating", unit: "" },
        { label: "Country of Origin", k: "countryOfOrigin", unit: "" },
        { label: "Colors Exterior", k: "colorsExterior", unit: "" },
        { label: "Colors Interior", k: "colorsInterior", unit: "" },
      ]
    },
    {
      title: "Performance",
      items: [
        { label: "Horsepower", k: "horsepower", unit: " hp" },
        { label: "Horsepower (RPM)", k: "horsepowerRpm", unit: " rpm" },
        { label: "Torque", k: "torque", unit: " lb-ft" },
        { label: "Torque (RPM)", k: "torqueRpm", unit: " rpm" },
        { label: "0-60 MPH", k: "zeroSixty", unit: " sec" },
        { label: "Engine Size", k: "engineSize", unit: "L" },
        { label: "Cylinders", k: "cylinders", unit: "" },
        { label: "Valves", k: "valves", unit: "" },
        { label: "Valve Timing", k: "valveTiming", unit: "" },
        { label: "Cam Type", k: "camType", unit: "" },
        { label: "Drive Type", k: "driveType", unit: "" },
        { label: "Transmission", k: "transmission", unit: "" },
      ]
    },
    {
      title: "Efficiency & EV",
      items: [
        { label: "Combined MPG", k: "epaCombinedMpg", unit: " mpg" },
        { label: "City MPG", k: "epaCityMpg", unit: " mpg" },
        { label: "Highway MPG", k: "epaHighwayMpg", unit: " mpg" },
        { label: "Combined MPGe", k: "mpge", unit: " mpge" },
        { label: "City MPGe", k: "epaCityMpge", unit: " mpge" },
        { label: "Highway MPGe", k: "epaHighwayMpge", unit: " mpge" },
        { label: "EV Range", k: "evRange", unit: " mi" },
        { label: "kWh/100 mi", k: "epaKwh100Mi", unit: " kWh" },
        { label: "Battery Capacity", k: "batteryCapacity", unit: " kWh" },
        { label: "Charging Time (240V)", k: "chargingTime", unit: " hr" },
        { label: "Fuel Tank", k: "fuelTankCapacity", unit: " gal" },
        { label: "Total Range", k: "rangeCity", unit: " mi" },
      ]
    },
    {
      title: "Dimensions & Weight",
      items: [
        { label: "Length", k: "length", unit: "″" },
        { label: "Width", k: "width", unit: "″" },
        { label: "Height", k: "height", unit: "″" },
        { label: "Wheelbase", k: "wheelbase", unit: "″" },
        { label: "Front Track", k: "frontTrack", unit: "″" },
        { label: "Rear Track", k: "rearTrack", unit: "″" },
        { label: "Ground Clearance", k: "groundClearance", unit: "″" },
        { label: "Angle of Approach", k: "angleApproach", unit: "°" },
        { label: "Angle of Departure", k: "angleDeparture", unit: "°" },
        { label: "Turning Circle", k: "turningCircle", unit: " ft" },
        { label: "Drag Coefficient", k: "dragCoefficient", unit: "" },
        { label: "Curb Weight", k: "curbWeight", unit: " lbs" },
        { label: "Gross Weight", k: "grossWeight", unit: " lbs" },
        { label: "Max Payload", k: "maxPayload", unit: " lbs" },
        { label: "Max Towing", k: "maxTowingCapacity", unit: " lbs" },
        { label: "Cargo Capacity", k: "cargoCapacity", unit: " cu ft" },
        { label: "Max Cargo Capacity", k: "maxCargoCapacity", unit: " cu ft" },
        { label: "EPA Interior Volume", k: "epaInteriorVolume", unit: " cu ft" },
      ]
    },
    {
      title: "Interior Dimensions",
      items: [
        { label: "Front Head Room", k: "headroomFront", unit: "″" },
        { label: "Front Leg Room", k: "legroomFront", unit: "″" },
        { label: "Front Shoulder Room", k: "shoulderRoomFront", unit: "″" },
        { label: "Front Hip Room", k: "hipRoomFront", unit: "″" },
        { label: "Rear Head Room", k: "headroomRear", unit: "″" },
        { label: "Rear Leg Room", k: "legroomRear", unit: "″" },
        { label: "Rear Shoulder Room", k: "shoulderRoomRear", unit: "″" },
        { label: "Rear Hip Room", k: "hipRoomRear", unit: "″" },
      ]
    },
    {
      title: "Price & Warranty",
      items: [
        { label: "Base MSRP", k: "baseMsrp", unit: "", format: (v: number | string) => `$${Number(v).toLocaleString()}` },
        { label: "Base Invoice", k: "baseInvoice", unit: "", format: (v: number | string) => `$${Number(v).toLocaleString()}` },
        { label: "Basic Warranty", k: "basicWarranty", unit: "" },
        { label: "Drivetrain Warranty", k: "drivetrainWarranty", unit: "" },
        { label: "Roadside Assistance", k: "roadsideAssistance", unit: "" },
        { label: "Rust Warranty", k: "rustWarranty", unit: "" },
      ]
    }
  ];

  const getValue = (car: CarSpecs, item: SectionItem) => {
    const val = car[item.k];
    if (val === undefined || val === null || val === 0 || val === "") return "-";
    if (item.format) return item.format(val);
    if (typeof val === "number") return formatNum(val, item.unit);
    return String(val);
  };

  const isBetter = (val1: number | string, val2: number | string, key: string) => {
    if (typeof val1 !== "number" || typeof val2 !== "number") return 0;
    if (val1 === val2) return 0;
    
    // Higher is better
    const higherBetter = [
      "horsepower", "torque", "epaCombinedMpg", "epaCityMpg", "epaHighwayMpg", 
      "rangeCity", "rangeHwy", "evRange", "mpge", "epaCityMpge", "epaHighwayMpge",
      "cargoCapacity", "maxCargoCapacity", "epaInteriorVolume",
      "maxTowingCapacity", "maxPayload", "batteryCapacity",
      "headroomFront", "legroomFront", "shoulderRoomFront", "hipRoomFront",
      "headroomRear", "legroomRear", "shoulderRoomRear", "hipRoomRear"
    ];
    // Lower is better
    const lowerBetter = ["baseMsrp", "baseInvoice", "zeroSixty", "chargingTime", "epaKwh100Mi", "dragCoefficient", "turningCircle"]; 

    if (higherBetter.includes(key)) return val1 > val2 ? 1 : 2;
    if (lowerBetter.includes(key)) return val1 < val2 ? 1 : 2;
    
    return 0;
  };

  return (
    <div className={styles.comparisonView}>
      {/* Mobile Sticky Header */}
      <div className={styles.stickyHeader}>
        <div className={styles.stickyCol}>
          <span>{car1.year} {car1.make} {car1.model}</span>
          <span className={styles.stickyTrim}>{car1.trim}</span>
        </div>
        <div className={styles.stickyCol}>
          <span>{car2.year} {car2.make} {car2.model}</span>
          <span className={styles.stickyTrim}>{car2.trim}</span>
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.title} className={styles.section}>
          <div className={styles.sectionTitle}>{section.title}</div>
          {section.items.map((item) => {
            const v1 = getValue(car1, item);
            const v2 = getValue(car2, item);
            
            // Skip row if both values are missing/empty
            if (v1 === "-" && v2 === "-") return null;

            const win = isBetter(car1[item.k], car2[item.k], item.k);
            
            return (
              <div key={item.label} className={styles.row}>
                <div className={`${styles.rowValue} ${win === 1 ? styles.highlight : ""}`}>
                  {v1}
                </div>
                <div className={styles.rowLabel}>{item.label}</div>
                <div className={`${styles.rowValue} ${win === 2 ? styles.highlight : ""}`}>
                  {v2}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
