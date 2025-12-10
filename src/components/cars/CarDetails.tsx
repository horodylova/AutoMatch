"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { fetchDataset, Row } from "@/lib/dataset";
import styles from "./cars.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";

type Props = { id: string };

function splitList(s: string): string[] {
  return s.split(/[;,\n]/).map(x => x.trim()).filter(Boolean);
}

export default function CarDetails({ id }: Props) {
  const [row, setRow] = useState<Row | null>(null);
  const [idx, setIdx] = useState<Record<string, number>>({});
  const [filteredImages, setFilteredImages] = useState<string[]>([]);
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

  useEffect(() => {
    let active = true;
    const run = async () => {
      const list = images.slice(0, 8);
      if (list.length === 0) {
        if (active) setFilteredImages([]);
        return;
      }
      const tasks = list.map(url => new Promise<string | null>((resolve) => {
        if (typeof window === "undefined") return resolve(url);
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        const timer = setTimeout(() => resolve(null), 2500);
        img.onload = () => { clearTimeout(timer); resolve((img.naturalWidth >= 800 && img.naturalHeight >= 450) ? url : null); };
        img.onerror = () => { clearTimeout(timer); resolve(null); };
      }));
      const results = await Promise.all(tasks);
      const ok = results.filter((x): x is string => !!x);
      if (active) setFilteredImages(ok);
    };
    run();
    return () => { active = false; };
  }, [images]);

  const make = get("make");
  const model = get("model");
  const year = get("year");
  const trim = get("trim");
  const title = [make, model, trim, year].filter(Boolean).join(" ");
  const subtitle = get("trim (description)");
  const origin = get("country of origin");
  const review = get("review");
  const pros = splitList(get("pros"));
  const cons = splitList(get("cons"));
  const whatsNew = splitList(get("what's new -"));

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
    { k: "Horsepower (rpm)", v: get("horsepower (rpm)") },
    { k: "Torque (ft-lbs)", v: get("torque (ft-lbs)") },
    { k: "Torque (rpm)", v: get("torque (rpm)") },
    { k: "Valves", v: get("valves") },
    { k: "Valve timing", v: get("valve timing") },
    { k: "Cam type", v: get("cam type") },
    { k: "Drive type", v: get("drive type") },
    { k: "Transmission", v: get("transmission") },
  ];

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

      <div className={styles.detailsLayout}>
        <div className={styles.detailsGallery}>
          <Swiper slidesPerView={1} spaceBetween={12} modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }}>
            {(filteredImages.length > 0 ? filteredImages : images.slice(0, 1)).map((src, i) => (
              <SwiperSlide key={`${src}-${i}`}>
                <div className={styles.gallerySlide}>
                  <Image 
                    src={src} 
                    alt={title || "car"} 
                    fill 
                    className={styles.galleryImg} 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 820px" 
                    quality={95}
                    priority={i === 0}
                    unoptimized
                    style={{ objectFit: "contain" }} 
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.sectionTitle}>Overview</div>
          <div className={styles.kvGrid}>
            {kvMain.filter(x => x.v).map(({ k, v }) => (
              <div key={k} className={styles.kvItem}><span className={styles.kvKey}>{k}</span><span className={styles.kvVal}>{v}</span></div>
            ))}
          </div>
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.sectionTitle}>Dimensions</div>
          <div className={styles.kvGrid}>
            {kvDims.filter(x => x.v).map(({ k, v }) => (
              <div key={k} className={styles.kvItem}><span className={styles.kvKey}>{k}</span><span className={styles.kvVal}>{v}</span></div>
            ))}
          </div>
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.sectionTitle}>Capacity</div>
          <div className={styles.kvGrid}>
            {kvCapacity.filter(x => x.v).map(({ k, v }) => (
              <div key={k} className={styles.kvItem}><span className={styles.kvKey}>{k}</span><span className={styles.kvVal}>{v}</span></div>
            ))}
          </div>
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.sectionTitle}>Engine</div>
          <div className={styles.kvGrid}>
            {kvEngine.filter(x => x.v).map(({ k, v }) => (
              <div key={k} className={styles.kvItem}><span className={styles.kvKey}>{k}</span><span className={styles.kvVal}>{v}</span></div>
            ))}
          </div>
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.sectionTitle}>Fuel & Efficiency</div>
          <div className={styles.kvGrid}>
            {kvFuel.filter(x => x.v).map(({ k, v }) => (
              <div key={k} className={styles.kvItem}><span className={styles.kvKey}>{k}</span><span className={styles.kvVal}>{v}</span></div>
            ))}
          </div>
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.sectionTitle}>Front Seats</div>
          <div className={styles.kvGrid}>
            {kvFront.filter(x => x.v).map(({ k, v }) => (
              <div key={k} className={styles.kvItem}><span className={styles.kvKey}>{k}</span><span className={styles.kvVal}>{v}</span></div>
            ))}
          </div>
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.sectionTitle}>Rear Seats</div>
          <div className={styles.kvGrid}>
            {kvRear.filter(x => x.v).map(({ k, v }) => (
              <div key={k} className={styles.kvItem}><span className={styles.kvKey}>{k}</span><span className={styles.kvVal}>{v}</span></div>
            ))}
          </div>
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.sectionTitle}>Review</div>
          <div className={styles.reviewText}>{review || "No review available"}</div>
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.sectionTitle}>Pros</div>
          <div className={styles.tagCloud}>
            {(pros.length > 0 ? pros : ["None"]).map(p => (
              <span key={p} className={styles.badge}>{p}</span>
            ))}
          </div>
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.sectionTitle}>Cons</div>
          <div className={styles.tagCloud}>
            {(cons.length > 0 ? cons : ["None"]).map(c => (
              <span key={c} className={styles.badge}>{c}</span>
            ))}
          </div>
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.sectionTitle}>What&apos;s new</div>
          <div className={styles.tagCloud}>
            {(whatsNew.length > 0 ? whatsNew : ["None"]).map(w => (
              <span key={w} className={styles.badge}>{w}</span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
