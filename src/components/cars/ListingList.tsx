"use client";
import { useEffect, useRef, useState } from "react";
import ListingItem, { ListingItemData } from "./ListingItem";
import ListingRow, { ListingRowData } from "./ListingRow";
import ResultsToolbar from "./ResultsToolbar";
import Pagination from "./Pagination";
import styles from "./cars.module.css";
import { fetchDataset, getRowCount, Row } from "@/lib/dataset";
import { FiltersData } from "./Filters";
import Link from "next/link";
import { getQuizAnswers } from "@/utils/storage";
import { event } from "@/lib/pixel";
import { trackQuizStart } from "@/lib/gtag";
import Image from "next/image";

function num(v: unknown): number {
  const raw = String(v ?? "").trim();
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function fmtUSD(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function PromoBannerK9() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      entries => {
        const e = entries[0];
        if (!e) return;
        if (e.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <Link href="https://k9cupid.fit/" className={styles.promoBanner} target="_blank" rel="noopener noreferrer" prefetch={false} aria-label="Explore K9Cupid">
      <div className={styles.promoMedia}>
        <video
          ref={videoRef}
          playsInline
          muted
          loop
          autoPlay
          preload="auto"
          onError={() => setFallback(true)}
          className={styles.promoVideo}
          style={{ display: fallback ? "none" : "block" }}
        >
          <source src="/banner%20video/K9Cupid%205%20Sec%20Video-Picsart-BackgroundRemover.mp4" type="video/mp4" />
        </video>
        {fallback && (
          <Image
            src="/no-image-available.jpg"
            alt="K9Cupid"
            className={styles.promoPoster}
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            priority={false}
          />
        )}
      </div>
      <div className={styles.promoContent}>
        <div className={styles.promoEyebrow}>
          <span className={styles.promoEyebrowDot} />
          Partner
        </div>
        <h3 className={styles.promoTitle}>K9Cupid</h3>
        <p className={styles.promoSubtitle}>Love cars. Love dogs. Meet K9Cupid — find the breed that fits your life.</p>
        <div className={styles.promoFeatures}>
          <span className={styles.promoFeature}>⏱ 5-min quiz</span>
          <span className={styles.promoFeature}>🐕 Breed match</span>
          <span className={styles.promoFeature}>📰 Articles</span>
        </div>
        <span className={styles.promoCta}>Find Your K9 Companion →</span>
      </div>
    </Link>
  );
}

export default function ListingList({ filters }: { filters?: FiltersData }) {
  const [count, setCount] = useState<number>(0);
  const pageSize = 15;
  const [rows, setRows] = useState<Row[]>([]);
  const [idx, setIdx] = useState<Record<string, number>>({});
  const [view, setView] = useState<"grid" | "list">(() => {
    try {
      if (typeof window !== "undefined") {
        const v = window.sessionStorage.getItem("cars:view");
        if (v === "list" || v === "grid") return v;
      }
    } catch {}
    return "grid";
  });
  const didCount = useRef(false);
  useEffect(() => {
    if (didCount.current) return;
    didCount.current = true;
    const run = async () => {
      const ds = await fetchDataset();
      setCount(getRowCount(ds));
      setRows(ds.rows);
      setIdx(ds.idx);
    };
    run();
  }, []);
  const [sort, setSort] = useState<"none" | "new" | "priceAsc" | "priceDesc">("none");
  const [page, setPage] = useState<number>(() => {
    try {
      if (typeof window !== "undefined") {
        const p = Number(window.sessionStorage.getItem("cars:page") || "1");
        if (p >= 1) return p;
      }
    } catch {}
    return 1;
  });

  const [hasQuiz, setHasQuiz] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
       const saved = getQuizAnswers();
       if (saved && Object.keys(saved).length > 0) setHasQuiz(true);
       
       const results = localStorage.getItem('autoMatch_savedResults');
       if (results) {
         try {
           const parsed = JSON.parse(results);
           if (parsed.expiresAt && parsed.expiresAt > new Date().getTime() && parsed.results) {
             setHasResults(true);
           }
         } catch {}
       }
    }
  }, []);

  useEffect(() => {
    try { if (typeof window !== "undefined") window.sessionStorage.setItem("cars:view", view); } catch {}
  }, [view]);
  
  useEffect(() => {
    try { if (typeof window !== "undefined") window.sessionStorage.setItem("cars:page", String(page)); } catch {}
  }, [page]);

  const toItem = (r: Row): ListingItemData => {
    const get = (key: string): string => {
      const i = idx[key.toLowerCase()] ?? -1;
      if (i < 0) return "";
      return String(r[i] ?? "").trim();
    };
    const id = get("id");
    const make = get("make");
    const model = get("model");
    const trim = get("trim");
    const year = get("year");
    const msrp = num(get("base msrp"));
    const price = msrp > 0 ? fmtUSD(msrp) : "";
    const eng = get("engine size (l)");
    const hp = get("horsepower (hp)");
    const desc = get("trim (description)");
    const doors = get("doors");
    const imgStr = get("image url");
    // Align splitting logic with CarDetails: split by ; or ,
    const rawImgs = imgStr.split(/[;,]/).map(s => s.trim()).filter(Boolean);
    let img = rawImgs[0];
    
    // Fix for local images: if it's just a filename, assume it's in /photos-cars/
    if (img && !img.startsWith("/") && !img.startsWith("http")) {
      // Encode URI component to handle spaces in filenames
      img = `/photos-cars/${encodeURIComponent(img)}`;
    } else if (img) {
      // Ensure spaces in remote URLs are encoded too, similar to CarDetails
      img = img.replace(/\s+/g, "%20");
    }
    
    img = img || "/no-image-available.jpg";
    const title = [make, model, trim, year].filter(Boolean).join(" ");
    const specs = [eng ? `${eng}L` : "", hp ? `${hp} HP` : "", doors ? `${doors} seats` : ""].filter(Boolean);
    return { id, imageUrl: img, title, subtitle: desc, price, badges: [], specs };
  };

  const sortedRows = (() => {
    const msrpIdx = idx["base msrp"] ?? -1;
    const yearIdx = idx["year"] ?? -1;
    const arr = [...rows];
    const priceOf = (r: Row) => {
      const v = msrpIdx >= 0 ? num(r[msrpIdx]) : 0;
      return v > 0 ? v : undefined;
    };
    if (sort === "priceAsc" && msrpIdx >= 0) {
      arr.sort((a, b) => {
        const pa = priceOf(a);
        const pb = priceOf(b);
        const va = typeof pa === "number" ? pa : Number.POSITIVE_INFINITY;
        const vb = typeof pb === "number" ? pb : Number.POSITIVE_INFINITY;
        return va - vb;
      });
    } else if (sort === "priceDesc" && msrpIdx >= 0) {
      arr.sort((a, b) => {
        const pa = priceOf(a);
        const pb = priceOf(b);
        const va = typeof pa === "number" ? pa : Number.NEGATIVE_INFINITY;
        const vb = typeof pb === "number" ? pb : Number.NEGATIVE_INFINITY;
        return vb - va;
      });
    } else if (sort === "new" && yearIdx >= 0) {
      arr.sort((a, b) => num(b[yearIdx]) - num(a[yearIdx]));
    }
    return arr;
  })();

  
  const cIdx = idx["cylinders"] ?? -1;
  const allCylSet = (() => {
    const s = new Set<string>();
    if (cIdx < 0) return s;
    for (const rr of rows) {
      const raw = String(rr[cIdx] ?? "").trim().toLowerCase();
      if (raw) s.add(raw);
    }
    return s;
  })();
  const matchesFilters = (r: Row): boolean => {
    if (filters && filters.makes && filters.makes.length > 0) {
      const mkIdx = idx["make"] ?? -1;
      const mk = mkIdx >= 0 ? String(r[mkIdx] ?? "").trim().toLowerCase() : "";
      const ok = filters.makes.some(m => mk === m.toLowerCase());
      if (!ok) return false;
    }
    if (filters && Array.isArray(filters.priceRanges) && filters.priceRanges.length > 0) {
      const msIdx = idx["base msrp"] ?? -1;
      const val = msIdx >= 0 ? num(r[msIdx]) : 0;
      const ranges = filters.priceRanges as { min?: number; max?: number }[];
      const ok = ranges.some(range => {
        const min = typeof range.min === "number" ? range.min : undefined;
        const max = typeof range.max === "number" ? range.max : undefined;
        if (typeof min === "number" && val < min) return false;
        if (typeof max === "number" && val > max) return false;
        return true;
      });
      if (!ok) return false;
    } else if (filters && (typeof filters.priceMin !== "undefined" || typeof filters.priceMax !== "undefined")) {
      const msIdx = idx["base msrp"] ?? -1;
      const val = msIdx >= 0 ? num(r[msIdx]) : 0;
      const min = typeof filters.priceMin === "number" ? filters.priceMin : undefined;
      const max = typeof filters.priceMax === "number" ? filters.priceMax : undefined;
      if (typeof min === "number" && val < min) return false;
      if (typeof max === "number" && val > max) return false;
    }
    if (filters && filters.body && filters.body.length > 0) {
      const bIdx = idx["body type"] ?? -1;
      const body = bIdx >= 0 ? String(r[bIdx] ?? "").trim().toLowerCase() : "";
      const ok = filters.body.some(lbl => body === lbl.trim().toLowerCase());
      if (!ok) return false;
    }
    if (filters && filters.fuel && filters.fuel.length > 0) {
      const fIdx = idx["fuel type"] ?? -1;
      const fuel = fIdx >= 0 ? String(r[fIdx] ?? "").trim().toLowerCase() : "";
      const matchFuel = (label: string): boolean => {
        const l = label.toLowerCase();
        if (l === "electric") return fuel.includes("electric") || fuel.includes("bev");
        if (l === "hydrogen") return fuel.includes("hydrogen");
        if (l === "diesel") return fuel.includes("diesel");
        if (l === "hybrid") return fuel.includes("hybrid") || fuel.includes("plug-in") || fuel.includes("phev");
        if (l === "flex-fuel") return fuel.includes("flex") || fuel.includes("e85");
        if (l === "gasoline") {
          const isGas = fuel.includes("gasoline") || fuel.includes("petrol") || fuel.includes("unleaded");
          const isHybrid = fuel.includes("hybrid") || fuel.includes("plug-in") || fuel.includes("phev");
          const isFlex = fuel.includes("flex") || fuel.includes("e85");
          return isGas && !isHybrid && !isFlex;
        }
        return fuel.includes(l);
      };
      const ok = filters.fuel.some(matchFuel);
      if (!ok) return false;
    }
    if (filters && filters.drive && filters.drive.length > 0) {
      const dIdx = idx["drive type"] ?? -1;
      const drive = dIdx >= 0 ? String(r[dIdx] ?? "").trim().toLowerCase() : "";
      const ok = filters.drive.some(lbl => drive === lbl.trim().toLowerCase());
      if (!ok) return false;
    }
    if (filters && filters.transmission && filters.transmission.length > 0) {
      const tIdx = idx["transmission"] ?? -1;
      const raw = tIdx >= 0 ? String(r[tIdx] ?? "").trim().toLowerCase() : "";
      const cleaned = raw.replace(/\b\d+\s*-?\s*speed\s*/g, "").trim();
      const a = cleaned.includes("automatic") || cleaned.includes("direct drive") || cleaned.includes("cvt");
      const m = cleaned.includes("manual");
      const mix = cleaned.includes("automated") || cleaned.includes("dual") || cleaned.includes("semi") || cleaned.includes("sequential") || (a && m);
      let label = "Automatic";
      if (mix) label = "Mixed";
      else if (m && !mix && !a) label = "Manual";
      const ok = filters.transmission.some(x => x.trim().toLowerCase() === label.toLowerCase());
      if (!ok) return false;
    }
    if (filters && filters.efficiencyRanges && filters.efficiencyRanges.length > 0) {
      const unit = filters.efficiencyUnit;
      const mpgIdx = idx["epa combined mpg"] ?? -1;
      const mpgeIdx = idx["epa combined mpge"] ?? -1;
      const i = unit === "mpg" ? mpgIdx : unit === "mpge" ? mpgeIdx : -1;
      if (i < 0) return false;
      const val = num(r[i]);
      const ok = (filters.efficiencyRanges as { min?: number; max?: number }[]).some(range => {
        const min = typeof range.min === "number" ? range.min : undefined;
        const max = typeof range.max === "number" ? range.max : undefined;
        if (typeof min === "number" && val < min) return false;
        if (typeof max === "number" && val > max) return false;
        return true;
      });
      if (!ok) return false;
    }
    if (filters && filters.cylinders && filters.cylinders.length > 0) {
      const allSelected = allCylSet.size > 0 && filters.cylinders.length >= allCylSet.size;
      if (!allSelected) {
        const lbl = cIdx >= 0 ? String(r[cIdx] ?? "").trim().toLowerCase() : "";
        const ok = lbl ? filters.cylinders.some(x => x.trim().toLowerCase() === lbl) : false;
        if (!ok) return false;
      }
    }
    if (filters && filters.query) {
      const q = String(filters.query || "").trim().toLowerCase();
      if (q) {
        const mk = String(r[idx["make"] ?? -1] ?? "").toLowerCase();
        const md = String(r[idx["model"] ?? -1] ?? "").toLowerCase();
        const tr = String(r[idx["trim"] ?? -1] ?? "").toLowerCase();
        const yr = String(r[idx["year"] ?? -1] ?? "").toLowerCase();
        const hay = `${mk} ${md} ${tr} ${yr}`.trim();
        const tokens = q.split(/\s+/).filter(Boolean);
        const ok = tokens.every(t => hay.includes(t));
        if (!ok) return false;
      }
    }
    return true;
  };
  const filteredRows = sortedRows.filter(matchesFilters);
  const total = filteredRows.length;
  const emptyFilters = !filters || (
    (!filters.makes || filters.makes.length === 0) &&
    (!filters.body || filters.body.length === 0) &&
    (!filters.fuel || filters.fuel.length === 0) &&
    (!filters.drive || filters.drive.length === 0) &&
    (!filters.transmission || filters.transmission.length === 0) &&
    (!filters.cylinders || filters.cylinders.length === 0) &&
    (typeof filters.priceMin === "undefined") &&
    (typeof filters.priceMax === "undefined") &&
    (!filters.query)
  );
  const countLabel = emptyFilters ? count : total;
  const firstPageSampleRef = useRef<Row[] | null>(null);
  useEffect(() => { firstPageSampleRef.current = null; }, [rows]);
  useEffect(() => { if (sort !== "none" || !emptyFilters || page !== 1) firstPageSampleRef.current = null; }, [sort, emptyFilters, page]);
  useEffect(() => { setPage(1); }, [filters, sort]);
  useEffect(() => { const maxPage = Math.max(1, Math.ceil(total / pageSize)); if (page > maxPage) setPage(1); }, [total, page]);
  const start = Math.max(0, (page - 1) * pageSize);
  const pageRows = (() => {
    if (emptyFilters && page === 1 && sort === "none") {
      if (!firstPageSampleRef.current) {
        if (filteredRows.length === 0) return [];
        const pool = [...filteredRows];
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const t = pool[i];
          pool[i] = pool[j];
          pool[j] = t;
        }
        firstPageSampleRef.current = pool.slice(0, Math.min(pageSize, pool.length));
      }
      return firstPageSampleRef.current as Row[];
    }
    return filteredRows.slice(start, start + pageSize);
  })();
  return (
    <div className={styles.panel}>
  
      <div className={styles.panelBody}>
        <ResultsToolbar 
          count={countLabel} 
          view={view} 
          sort={sort} 
          onViewChange={setView} 
          onSortChange={setSort} 
          centerContent={
            <Link 
              href={hasResults ? "/results" : "/quiz"} 
              onClick={() => {
                if (!hasResults && !hasQuiz) {
                  trackQuizStart();
                  event("StartQuiz");
                }
              }}
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(229,72,63,0.1)', 
                color: 'var(--kendo-color-primary)', 
                textDecoration: 'none', 
                padding: '8px 16px',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: 700,
                border: '1px solid rgba(229,72,63,0.25)',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(229,72,63,0.12)'
              }}
            >
              {hasResults ? "✨ Return to your quiz results" : (hasQuiz ? "✨ Resume your quiz" : "💖 Find your true love with our quiz")}
            </Link>
          }
        />
        {(() => {
          return view === "grid" ? (
            <div className={styles.listGrid}>
              {(() => {
                const items = pageRows.map(r => toItem(r));
                const nodes: React.ReactNode[] = [];
                const insertAt = 6;
                items.forEach((item, i) => {
                  if (i === insertAt) nodes.push(<PromoBannerK9 key="promo-k9" />);
                  const key = item.id || `g-${start + i}`;
                  nodes.push(<ListingItem key={key} item={item} />);
                });
                return nodes;
              })()}
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {pageRows.map(r => toItem(r)).map((item, i) => {
                const rowItem: ListingRowData = {
                  id: item.id,
                  imageUrl: item.imageUrl,
                  title: item.title,
                  subtitle: item.subtitle,
                  price: item.price,
                  specs: item.specs,
                };
                const key = item.id || `l-${start + i}`;
                return <ListingRow key={key} item={rowItem} />;
              })}
            </div>
          );
        })()}
        {view === "grid" ? (
          <></>
        ) : (
          <></>
        )}
        <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
      </div>
    </div>
  );
}
