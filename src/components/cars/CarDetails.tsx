"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { fetchDataset, Row } from "@/lib/dataset";
import styles from "./cars.module.css";
import DetailsGallery from "./DetailsGallery";
import DetailsKVSection from "./DetailsKVSection";
import DetailsReview from "./DetailsReview";
import DetailsProsCons from "./DetailsProsCons";
import DealerModal from "./modals/DealerModal";
import { DealerResult } from "./modals/DealerResults";

type Props = { id: string };

function splitList(s: string): string[] {
  return s.split(/[;,\n]/).map(x => x.trim()).filter(Boolean);
}

export default function CarDetails({ id }: Props) {
  const [row, setRow] = useState<Row | null>(null);
  const [idx, setIdx] = useState<Record<string, number>>({});
  const [isDealerModalOpen, setIsDealerModalOpen] = useState(false);
  const [dealerLocation, setDealerLocation] = useState<string | null>(null);
  const [dealerResults, setDealerResults] = useState<DealerResult[] | null>(null);
  const [isSearchingDealers, setIsSearchingDealers] = useState(false);

  useEffect(() => {
    let active = true;
    const run = async () => {
      const ds = await fetchDataset();
      const idIdx = ds.idx["id"] ?? -1;
      let found: Row | null = null;
      if (idIdx >= 0) {
        for (const r of ds.rows) {
          const val = String(r[idIdx] ?? "").trim();
          if (val && val === id) {
            found = r;
            break;
          }
        }
      }
      if (active) {
        setRow(found);
        setIdx(ds.idx);
      }
    };
    run();
    return () => { active = false; };
  }, [id]);

  const get = useCallback((key: string): string => {
    const i = idx[key.toLowerCase()] ?? -1;
    if (i < 0 || !row) return "";
    return String(row[i] ?? "").trim();
  }, [row, idx]);

  const images = useMemo(() => {
    const raw = get("image url");
    const arr = raw.split(/[;,]/).map(s => s.trim()).filter(Boolean);
    const sanitize = (u: string): string => {
      const cleaned = u.replace(/^['"]|['"]$/g, "").replace(/[)]+$/, "").replace(/\s+/g, "%20");
      if (cleaned.startsWith("https://") || cleaned.startsWith("http://") || cleaned.startsWith("/")) return cleaned;
      if (cleaned.startsWith("www.")) return `https://${cleaned}`;
      return "/no-image-available.jpg";
    };
    const out = arr.map(sanitize).filter(Boolean);
    return out.length > 0 ? out : ["/no-image-available.jpg"];
  }, [get]);

  const hasRealImage = useMemo(() => {
    return images.some(src => !src.includes("no-image-available"));
  }, [images]);


  const make = get("make");
  const model = get("model");
  const year = get("year");
  const trim = get("trim");
  const title = [make, model, trim, year].filter(Boolean).join(" ");
  const subtitle = get("trim (description)");
  const origin = get("country of origin");
  const review = get("review");
  const reviewParas = useMemo(() => {
    const text = (review || "").trim();
    if (!text) return [];
    const parts = text.split(/\s*;\s*/).map(s => s.trim()).filter(Boolean);
    return parts.length > 0 ? parts : [text];
  }, [review]);
  const showLeftInfo = !hasRealImage && reviewParas.length === 0;
  const pros = splitList(get("pros"));
  const cons = splitList(get("cons"));

  const tagItems = useMemo(() => {
    const out: string[] = [];
    const body = get("body type");
    const drive = get("drive type");
    const fuel = get("fuel type");
    const cylinders = get("cylinders");
    const engineType = get("engine type");
    const seats = get("total seating");
    if (body) out.push(body);
    if (drive) out.push(drive);
    if (fuel) out.push(fuel);
    if (cylinders) out.push(cylinders);
    if (engineType) out.push(engineType);
    if (seats) out.push(`${seats} seats`);
    return out;
  }, [get]);

  const kvMain = [
    { k: "Make", v: make },
    { k: "Model", v: model },
    { k: "Year", v: year },
    { k: "Trim", v: trim },
    { k: "Base MSRP", v: get("base msrp") },
    { k: "Base Invoice", v: get("base invoice") },
    { k: "Body type", v: get("body type") },
    { k: "Doors", v: get("doors") },
    { k: "Total seating", v: get("total seating") },
  ];

  const kvDims = [
    { k: "Length (in)", v: get("length (in)") },
    { k: "Width (in)", v: get("width (in)") },
    { k: "Height (in)", v: get("height (in)") },
    { k: "Wheelbase (in)", v: get("wheelbase (in)") },
    { k: "Front track (in)", v: get("front track (in)") },
    { k: "Rear track (in)", v: get("rear track (in)") },
    { k: "Ground clearance (in)", v: get("ground clearance (in)") },
    { k: "Angle of approach (degrees)", v: get("angle of approach (degrees)") },
    { k: "Angle of departure (degrees)", v: get("angle of departure (degrees)") },
    { k: "Turning circle (ft)", v: get("turning circle (ft)") },
    { k: "Drag coefficient (Cd)", v: get("drag coefficient (cd)") },
  ];

  const kvCapacity = [
    { k: "EPA interior volume (cu ft)", v: get("epa interior volume (cu ft)") },
    { k: "Cargo capacity (cu ft)", v: get("cargo capacity (cu ft)") },
    { k: "Maximum cargo capacity (cu ft)", v: get("maximum cargo capacity (cu ft)") },
    { k: "Curb weight (lbs)", v: get("curb weight (lbs)") },
    { k: "Gross weight (lbs)", v: get("gross weight (lbs)") },
    { k: "Maximum payload (lbs)", v: get("maximum payload (lbs)") },
    { k: "Maximum towing capacity (lbs)", v: get("maximum towing capacity (lbs)") },
  ];

  const kvEngine = [
    { k: "Engine type", v: get("engine type") },
    { k: "Cylinders", v: get("cylinders") },
    { k: "Engine size (l)", v: get("engine size (l)") },
    { k: "Horsepower (HP)", v: get("horsepower (hp)") },
    { k: "Horsepower at rpm", v: get("horsepower (rpm)") },
    { k: "Torque (ft-lbs)", v: get("torque (ft-lbs)") },
    { k: "Torque at rpm", v: get("torque (rpm)") },
    { k: "Valves", v: get("valves") },
    { k: "Valve timing", v: get("valve timing") },
    { k: "Cam type", v: get("cam type") },
    { k: "Drive type", v: get("drive type") },
    { k: "Transmission", v: get("transmission") },
  ];

  const kvFuelFiltered = useMemo(() => {
    const kvFuel = [
      { k: "Fuel type", v: get("fuel type") },
      { k: "Fuel tank capacity (gal)", v: get("fuel tank capacity (gal)") },
      { k: "EPA combined MPG", v: get("epa combined mpg") },
      { k: "EPA city/highway MPG", v: get("epa city/highway mpg") },
      { k: "Range in miles (city/hwy)", v: get("range in miles (city/hwy)") },
      { k: "EPA combined MPGe", v: get("epa combined mpge") },
      { k: "EPA city/highway MPGe", v: get("epa city/highway mpge") },
      { k: "EPA electricity range (mi)", v: get("epa electricity range (mi)") },
      { k: "EPA kWh/100 mi", v: get("epa kwh/100 mi") },
      { k: "EPA time to charge battery (at 240V) (hr)", v: get("epa time to charge battery (at 240v) (hr)") },
      { k: "Battery capacity (kWh)", v: get("battery capacity (kwh)") },
    ];

    const fuelRaw = (get("fuel type") || "").toLowerCase();
    const isElectric = fuelRaw.includes("electric") || fuelRaw.includes("bev");
    const isHybrid = fuelRaw.includes("hybrid") || fuelRaw.includes("plug-in") || fuelRaw.includes("phev");
    
    return kvFuel.filter(({ k }) => {
      const label = k.toLowerCase();
      const isElectricMetric = label.includes("mpge") || label.includes("electricity range") || label.includes("kwh/100") || label.includes("time to charge") || label.includes("battery capacity");
      
      if (isElectric && !isHybrid) {
        return isElectricMetric || label === "fuel type";
      }
      if (!isElectric && !isHybrid) {
        return !isElectricMetric;
      }
      return true;
    });
  }, [get]);

  const kvFront = [
    { k: "Front head room (in)", v: get("front head room (in)") },
    { k: "Front hip room (in)", v: get("front hip room (in)") },
    { k: "Front leg room (in)", v: get("front leg room (in)") },
    { k: "Front shoulder room (in)", v: get("front shoulder room (in)") },
  ];

  const kvRear = [
    { k: "Rear head room (in)", v: get("rear head room (in)") },
    { k: "Rear hip room (in)", v: get("rear hip room (in)") },
    { k: "Rear leg room (in)", v: get("rear leg room (in)") },
    { k: "Rear shoulder room (in)", v: get("rear shoulder room (in)") },
  ];

  const handleDealerSearch = async (location: string) => {
    setDealerLocation(location);
    setIsSearchingDealers(true);
    try {
      const params = new URLSearchParams({
        make,
        model,
        year,
        location,
      });
      const res = await fetch(`/api/dealers/search?${params.toString()}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setDealerResults(data.results || []);
    } catch (err) {
      console.error(err);
    
    } finally {
      setIsSearchingDealers(false);
    }
  };

  const handleClearResults = () => {
    setDealerResults(null);
  };

  return (
    <div className={styles.details}>
      <div className={styles.detailsHeader}>
        <div className={styles.detailsTitle}>{title}</div>
        <div className={styles.detailsSubtitle}>{subtitle}</div>
        <div className={styles.tagCloud}>
          {origin ? <span className={styles.badge}>{origin}</span> : null}
          {tagItems.map(t => (
            <span key={t} className={styles.badge}>{t}</span>
          ))}
        </div>
      </div>

      <div className={`${styles.detailsLayout} ${!hasRealImage ? styles.detailsLayoutNoImage : ""}`}>
        <div className={styles.detailsColLeft}>
          <DetailsGallery images={images} title={title} compact={!hasRealImage} />
          <DetailsReview paragraphs={reviewParas} />
          <DetailsProsCons pros={pros} cons={cons} />
          {showLeftInfo ? (
            <>
              <DetailsKVSection title="Overview" items={kvMain} />
              <DetailsKVSection title="Engine" items={kvEngine} />
            </>
          ) : null}
        </div>

        <div className={`${styles.detailsColRight}`}>
          <button 
            className={styles.dealerBtn} 
            type="button"
            onClick={() => setIsDealerModalOpen(true)}
          >
            <svg className={styles.dealerBtnIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {dealerLocation ? `Searching near: ${dealerLocation}` : "Find Dealers Near Me"}
          </button>
          
          <button 
            className={styles.compareBtn} 
            type="button"
            onClick={() => {
              // Navigate to compare page with this car's ID
              const idIdx = idx["id"] ?? -1;
              const carId = idIdx >= 0 ? String(row?.[idIdx] ?? "") : "";
              if (carId) {
                window.location.href = `/compare?car1=${encodeURIComponent(carId)}`;
              }
            }}
          >
            <svg className={styles.dealerBtnIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Compare with Another Car
          </button>
          {showLeftInfo ? null : <DetailsKVSection title="Overview" items={kvMain} />}
          <DetailsKVSection title="Dimensions" items={kvDims} />
          {showLeftInfo ? null : <DetailsKVSection title="Engine" items={kvEngine} />}
          <DetailsKVSection title="Capacity" items={kvCapacity} />
          <DetailsKVSection title="Fuel & Efficiency" items={kvFuelFiltered} />
          <DetailsKVSection title="Front Seats" items={kvFront} />
          <DetailsKVSection title="Rear Seats" items={kvRear} />
        </div>
      </div>
      
      <DealerModal 
        isOpen={isDealerModalOpen} 
        onClose={() => setIsDealerModalOpen(false)} 
        onSearch={handleDealerSearch}
        onClearResults={handleClearResults}
        results={dealerResults}
        isLoading={isSearchingDealers}
        carInfo={{ make, model, trim }} 
      />
    </div>
  );
}
