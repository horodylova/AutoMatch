"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ListingItem, { ListingItemData } from "./ListingItem";
import ListingRow, { ListingRowData } from "./ListingRow";
import DreamGarageListingBanner from "./DreamGarageListingBanner";
import ResultsToolbar from "./ResultsToolbar";
import Pagination from "./Pagination";
import Loader from "@/components/Loader";
import styles from "./cars.module.css";
import { FiltersData } from "./Filters";
import { getQuizAnswers } from "@/utils/storage";
import { event } from "@/lib/pixel";
import { trackQuizStart } from "@/lib/gtag";
import {
  CatalogItem,
  fetchCatalogPage,
  formatPrice,
  resolveImageUrl,
} from "@/lib/catalog-client";

const PAGE_SIZE = 15;

type SortMode = "none" | "new" | "priceAsc" | "priceDesc";

const SORT_PARAM: Record<SortMode, string | undefined> = {
  none: undefined,
  new: "year-desc",
  priceAsc: "price-asc",
  priceDesc: "price-desc",
};

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

function toItem(car: CatalogItem): ListingItemData {
  const title = [car.make, car.model, car.trim, String(car.year)].filter(Boolean).join(" ");
  const specs = [
    car.engineSizeL ? `${car.engineSizeL}L` : "",
    car.horsepower ? `${car.horsepower} HP` : "",
    car.seating ? `${car.seating} seats` : "",
  ].filter(Boolean);
  return {
    id: car.id,
    imageUrl: resolveImageUrl(car.imageUrl),
    title,
    subtitle: car.trimDescription ?? "",
    price: formatPrice(car.price),
    badges: [],
    specs,
  };
}

export default function ListingList({ filters, onReady }: { filters: FiltersData; onReady?: () => void }) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortMode>("none");
  const [view, setView] = useState<"grid" | "list">(() => {
    if (typeof window === "undefined") return "grid";
    const saved = window.localStorage.getItem("carsView");
    return saved === "list" ? "list" : "grid";
  });
  const [hasQuiz, setHasQuiz] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("carsView", view);
  }, [view]);

  useEffect(() => {
    const answers = getQuizAnswers();
    setHasQuiz(Boolean(answers && Object.keys(answers).length > 0));
    if (typeof window !== "undefined") {
      setHasResults(Boolean(window.localStorage.getItem("quizResults")));
    }
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filters, sort]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError(null);

    fetchCatalogPage(
      {
        makes: filters.makes,
        bodyTypes: filters.body,
        powertrains: filters.powertrains,
        driveTypes: filters.drive,
        transmissions: filters.transmission,
        cylinders: filters.cylinders,
        priceRanges: filters.priceRanges,
        efficiencyUnit: filters.efficiencyUnit,
        efficiencyRanges: filters.efficiencyRanges,
        query: filters.query,
        sort: SORT_PARAM[sort],
        page,
        pageSize: PAGE_SIZE,
      },
      controller.signal
    )
      .then(result => {
        if (!active) return;
        setItems(result.items);
        setTotal(result.total);
        setLoading(false);
        onReady?.();
      })
      .catch(err => {
        if (!active || err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load cars");
        setLoading(false);
        onReady?.();
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [filters, sort, page]);

  const quizLabel = hasResults
    ? "✨ Return to your quiz results"
    : hasQuiz
      ? "✨ Resume your quiz"
      : "💖 Find your true love with our quiz";

  const quizHref = hasResults ? "/results" : "/quiz";

  return (
    <div className={styles.panel}>
      <div className={styles.panelBody}>
        <ResultsToolbar
          count={total}
          view={view}
          sort={sort}
          onViewChange={setView}
          onSortChange={setSort}
          centerContent={
            <Link
              href={quizHref}
              onClick={() => {
                event("QuizStart");
                trackQuizStart();
              }}
              style={{
                backgroundColor: "rgba(229,72,63,0.1)",
                color: "var(--kendo-color-primary)",
                textDecoration: "none",
                padding: "8px 16px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 700,
                border: "1px solid rgba(229,72,63,0.25)",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 12px rgba(229,72,63,0.12)",
              }}
            >
              {quizLabel}
            </Link>
          }
        />

        {error && <div className={styles.loadingState}>{error}</div>}

        {loading && <Loader />}

        {!loading && !error && items.length === 0 && (
          <div className={styles.loadingState}>No cars match these filters.</div>
        )}

        {!loading && !error && items.length > 0 && (
          view === "grid" ? (
            <div className={styles.listGrid}>
              {(() => {
                const nodes: React.ReactNode[] = [];
                items.forEach((car, i) => {
                  if (i === 6) nodes.push(<DreamGarageListingBanner key="promo-dream-garage" />);
                  if (i === 12) nodes.push(<PromoBannerK9 key="promo-k9" />);
                  nodes.push(<ListingItem key={car.id} item={toItem(car)} />);
                });
                return nodes;
              })()}
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {items.map(car => {
                const item = toItem(car);
                const rowItem: ListingRowData = {
                  id: item.id,
                  imageUrl: item.imageUrl,
                  title: item.title,
                  subtitle: item.subtitle,
                  price: item.price,
                  specs: item.specs,
                };
                return <ListingRow key={car.id} item={rowItem} />;
              })}
            </div>
          )
        )}

        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      </div>
    </div>
  );
}
