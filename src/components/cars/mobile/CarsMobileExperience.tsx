"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./CarsMobileExperience.module.css";
import { fetchDataset, getBodyTypes, getCylinderCounts, getDriveTypes, getFuelTypes, getMakes, getTransmissionTypes } from "@/lib/dataset";
import { addWishlistItem, getWishlist, getWishlistCount } from "@/utils/storage";
import { FiltersData } from "../Filters";
import { SwipeDeckItem, SwipeDeckResponse } from "./types";

const SwipeDeck = dynamic(() => import("./SwipeDeck"), {
  ssr: false,
  loading: () => (
    <div className={styles.loading}>
      <div className={styles.loadingSpinner} />
      <p>Loading cards...</p>
    </div>
  ),
});

const DISMISSED_KEY = "cc_dismissed";
const SESSION_KEY = "cars:mobileDeck:v1";
const RESTORE_ON_RETURN_KEY = "cars:mobileDeck:restore-on-return";

type Step = "gate" | "deck" | "end";
type Options = {
  makes: string[];
  body: string[];
  fuel: string[];
  drive: string[];
  transmission: string[];
  cylinders: string[];
};

type PersistedState = {
  step: Step;
  filters: FiltersData;
  items: SwipeDeckItem[];
  totalGroups: number;
  showStartOver: boolean;
};

const EMPTY_FILTERS: FiltersData = {
  makes: [],
  priceRanges: [],
  body: [],
  fuel: [],
  drive: [],
  transmission: [],
  cylinders: [],
};

const PRICE_GROUPS: Array<{ label: string; min?: number; max?: number }> = [
  { label: "Under $20k", min: 0, max: 20000 },
  { label: "$20k-$35k", min: 20000, max: 35000 },
  { label: "$35k-$50k", min: 35000, max: 50000 },
  { label: "$50k-$75k", min: 50000, max: 75000 },
  { label: "$75k-$120k", min: 75000, max: 120000 },
  { label: "$120k+", min: 120000 },
];

function normalizeModelKey(make?: string, model?: string): string {
  return `${String(make || "").trim().toLowerCase()}|${String(model || "").trim().toLowerCase()}`;
}

function readDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed)) return new Set<string>();
    return new Set(parsed.map((value) => String(value || "").trim()).filter(Boolean));
  } catch {
    return new Set<string>();
  }
}

function writeDismissed(values: Set<string>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(values.values())));
}

function wishlistMatches(item: SwipeDeckItem): boolean {
  const current = getWishlist();
  const items = current?.items || [];
  const modelKey = normalizeModelKey(item.make, item.model);
  return items.some((wishlistItem) => {
    if (wishlistItem.id === item.id) return true;
    if (normalizeModelKey(wishlistItem.make, wishlistItem.model) === modelKey) return true;
    const title = String(wishlistItem.title || "").toLowerCase();
    return title.includes(item.make.toLowerCase()) && title.includes(item.model.toLowerCase());
  });
}

function filtersToParams(filters: FiltersData): URLSearchParams {
  const params = new URLSearchParams();
  filters.makes?.forEach((value) => params.append("make", value));
  filters.body?.forEach((value) => params.append("body", value));
  filters.fuel?.forEach((value) => params.append("fuel", value));
  filters.drive?.forEach((value) => params.append("drive", value));
  filters.transmission?.forEach((value) => params.append("transmission", value));
  filters.cylinders?.forEach((value) => params.append("cylinders", value));
  filters.priceRanges?.forEach((range) => {
    params.append("priceRange", `${range.min ?? ""}:${range.max ?? ""}`);
  });
  if (typeof filters.priceMin === "number") params.set("priceMin", String(filters.priceMin));
  if (typeof filters.priceMax === "number") params.set("priceMax", String(filters.priceMax));
  if (filters.query) params.set("query", filters.query);
  return params;
}

function scrollAppToTop(): void {
  if (typeof document !== "undefined") {
    const scrollRoot = document.getElementById("app-scroll");
    if (scrollRoot) {
      scrollRoot.scrollTo({ top: 0, left: 0, behavior: "auto" });
      scrollRoot.scrollTop = 0;
    }
  }
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }
}

export default function CarsMobileExperience({
  filters,
  onFiltersChange,
}: {
  filters: FiltersData;
  onFiltersChange: (next: FiltersData) => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("gate");
  const [draft, setDraft] = useState<FiltersData>(filters);
  const [options, setOptions] = useState<Options | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingDeck, setLoadingDeck] = useState(false);
  const [deckItems, setDeckItems] = useState<SwipeDeckItem[]>([]);
  const [totalGroups, setTotalGroups] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showStartOver, setShowStartOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const shouldSnapToTopRef = useRef(false);

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const dataset = await fetchDataset();
        if (!active) return;
        setOptions({
          makes: getMakes(dataset),
          body: getBodyTypes(dataset),
          fuel: getFuelTypes(dataset),
          drive: getDriveTypes(dataset),
          transmission: getTransmissionTypes(dataset),
          cylinders: getCylinderCounts(dataset),
        });
      } finally {
        if (active) setLoadingOptions(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const apply = () => setWishlistCount(getWishlistCount());
    apply();
    window.addEventListener("autoMatch_wishlist_updated", apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener("autoMatch_wishlist_updated", apply);
      window.removeEventListener("storage", apply);
    };
  }, []);

  const persistSession = useCallback(
    (
      nextStep: Step = step,
      nextItems: SwipeDeckItem[] = deckItems,
      nextFilters: FiltersData = filters,
      nextShowStartOver = showStartOver,
      nextTotalGroups = totalGroups
    ) => {
      if (typeof window === "undefined") return;
      const payload: PersistedState = {
        step: nextStep,
        filters: nextFilters,
        items: nextItems,
        totalGroups: nextTotalGroups,
        showStartOver: nextShowStartOver,
      };
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    },
    [deckItems, filters, showStartOver, step, totalGroups]
  );

  const clearSession = useCallback(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(SESSION_KEY);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const shouldRestore = window.sessionStorage.getItem(RESTORE_ON_RETURN_KEY) === "1";
      window.sessionStorage.removeItem(RESTORE_ON_RETURN_KEY);
      if (!shouldRestore) {
        clearSession();
        onFiltersChange(EMPTY_FILTERS);
        setDraft(EMPTY_FILTERS);
        setDeckItems([]);
        setTotalGroups(0);
        setShowStartOver(false);
        setStep("gate");
        setRestored(true);
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            scrollAppToTop();
          });
        });
        return;
      }
      const raw = window.sessionStorage.getItem(SESSION_KEY);
      if (!raw) {
        setRestored(true);
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            scrollAppToTop();
          });
        });
        return;
      }
      const parsed = JSON.parse(raw) as PersistedState;
      if (!parsed || !Array.isArray(parsed.items)) {
        setRestored(true);
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            scrollAppToTop();
          });
        });
        return;
      }
      onFiltersChange(parsed.filters || EMPTY_FILTERS);
      setDraft(parsed.filters || EMPTY_FILTERS);
      setDeckItems(parsed.items);
      setTotalGroups(parsed.totalGroups || 0);
      setShowStartOver(Boolean(parsed.showStartOver));
      setStep(parsed.step === "deck" || parsed.step === "end" ? parsed.step : "gate");
    } catch {
      // Ignore invalid session state.
    } finally {
      setRestored(true);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          scrollAppToTop();
        });
      });
    }
  }, [clearSession, onFiltersChange]);

  const goToGate = useCallback((clearStoredState = false) => {
    setError(null);
    setStep("gate");
    if (clearStoredState) {
      clearSession();
    }
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          scrollAppToTop();
        });
      });
    }
  }, [clearSession]);

  const buildDeck = useCallback(
    async (nextFilters: FiltersData) => {
      setLoadingDeck(true);
      setError(null);
      setShowStartOver(false);
      try {
        let cursor: string | null = null;
        let allItems: SwipeDeckItem[] = [];
        let serverTotal = 0;

        do {
          const params = filtersToParams(nextFilters);
          if (cursor) params.set("cursor", cursor);
          const response = await fetch(`/api/cars/deck?${params.toString()}`, { cache: "no-store" });
          if (!response.ok) {
            throw new Error("Failed to build swipe deck.");
          }
          const payload = (await response.json()) as SwipeDeckResponse;
          allItems = allItems.concat(payload.items || []);
          cursor = payload.nextCursor;
          serverTotal = payload.totalGroups || serverTotal;
        } while (cursor);

        const dismissed = readDismissed();
        const filteredLocal = allItems.filter((item) => {
          if (dismissed.has(normalizeModelKey(item.make, item.model))) return false;
          if (wishlistMatches(item)) return false;
          return true;
        });

        const needsStartOver = allItems.length > 0 && filteredLocal.length === 0 && dismissed.size > 0;
        setDeckItems(filteredLocal);
        setTotalGroups(serverTotal);
        setShowStartOver(needsStartOver);
        setStep(filteredLocal.length > 0 ? "deck" : "end");
        persistSession(filteredLocal.length > 0 ? "deck" : "end", filteredLocal, nextFilters, needsStartOver, serverTotal);
      } catch (buildError) {
        setError(buildError instanceof Error ? buildError.message : "Failed to build swipe deck.");
      } finally {
        setLoadingDeck(false);
      }
    },
    [persistSession]
  );

  const startDeck = useCallback(
    async (nextFilters: FiltersData) => {
      shouldSnapToTopRef.current = true;
      if (typeof document !== "undefined") {
        const active = document.activeElement;
        if (active instanceof HTMLElement) {
          active.blur();
        }
      }
      onFiltersChange(nextFilters);
      setDraft(nextFilters);
      await buildDeck(nextFilters);
    },
    [buildDeck, onFiltersChange]
  );

  useEffect(() => {
    if (!shouldSnapToTopRef.current || loadingDeck || step !== "deck") return;
    shouldSnapToTopRef.current = false;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollAppToTop();
      });
    });
  }, [loadingDeck, step]);

  const handleToggleList = (key: keyof FiltersData, value: string) => {
    setDraft((prev) => {
      const current = Array.isArray(prev[key]) ? ([...(prev[key] as string[])] as string[]) : [];
      const nextValues = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
      return { ...prev, [key]: nextValues };
    });
  };

  const handleTogglePrice = (label: string) => {
    setDraft((prev) => {
      const current = prev.priceRanges || [];
      const group = PRICE_GROUPS.find((item) => item.label === label);
      if (!group) return prev;
      const exists = current.some((range) => range.min === group.min && range.max === group.max);
      return {
        ...prev,
        priceRanges: exists
          ? current.filter((range) => !(range.min === group.min && range.max === group.max))
          : [...current, { min: group.min, max: group.max }],
      };
    });
  };

  const handleLike = (item: SwipeDeckItem) => {
    const nextItems = deckItems.slice(1);
    addWishlistItem({
      id: item.id,
      make: item.make,
      model: item.model,
      trim: item.trim,
      year: item.year ?? undefined,
      title: `${item.make} ${item.model}`,
      subtitle: [item.year ?? "", item.trim].filter(Boolean).join(" "),
      image: item.imageUrl,
    });
    setDeckItems(nextItems);
    if (nextItems.length === 0) {
      setStep("end");
      persistSession("end", nextItems, filters, showStartOver);
      return;
    }
    persistSession("deck", nextItems, filters, showStartOver);
  };

  const handleNope = (item: SwipeDeckItem) => {
    const nextItems = deckItems.slice(1);
    const dismissed = readDismissed();
    dismissed.add(normalizeModelKey(item.make, item.model));
    writeDismissed(dismissed);
    setDeckItems(nextItems);
    if (nextItems.length === 0) {
      setStep("end");
      persistSession("end", nextItems, filters, showStartOver);
      return;
    }
    persistSession("deck", nextItems, filters, showStartOver);
  };

  const handleDropBroken = (itemId: string) => {
    const nextItems = deckItems.filter((item) => item.id !== itemId);
    setDeckItems(nextItems);
    if (nextItems.length === 0) {
      setStep("end");
      persistSession("end", nextItems, filters, showStartOver);
      return;
    }
    persistSession("deck", nextItems, filters, showStartOver);
  };

  const resetDismissed = async () => {
    writeDismissed(new Set<string>());
    setShowStartOver(false);
    await buildDeck(filters);
  };

  const selectedPriceLabels = useMemo(
    () =>
      PRICE_GROUPS.filter((group) =>
        (draft.priceRanges || []).some((range) => range.min === group.min && range.max === group.max)
      ).map((group) => group.label),
    [draft.priceRanges]
  );

  if (!restored) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Loading mobile listings...</p>
      </div>
    );
  }

  if (loadingDeck) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Dealing your cards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2 className={styles.endTitle}>Couldn&apos;t build the deck</h2>
        <p className={styles.endText}>{error}</p>
        <div className={styles.buttonStack}>
          <button type="button" className={styles.primaryButton} onClick={() => startDeck(draft)}>
            Try again
          </button>
          <button type="button" className={styles.ghostButton} onClick={() => goToGate()}>
            Back to filters
          </button>
        </div>
      </div>
    );
  }

  if (step === "deck" && deckItems.length > 0) {
    return (
      <SwipeDeck
        items={deckItems}
        onLike={handleLike}
        onNope={handleNope}
        onDropBroken={handleDropBroken}
        onEditFilters={() => {
          goToGate(true);
        }}
        onPersist={() => {
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem(RESTORE_ON_RETURN_KEY, "1");
          }
          persistSession("deck", deckItems, filters, showStartOver);
        }}
      />
    );
  }

  if (step === "end") {
    return (
      <div className={styles.end}>
        <div className={styles.endIcon}>🏁</div>
        <h2 className={styles.endTitle}>That&apos;s the whole deck</h2>
        <p className={styles.endText}>You went through every model matching your filters.</p>
        <div className={styles.buttonStack}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => {
              goToGate(true);
            }}
          >
            Widen my filters
          </button>
          <button type="button" className={styles.ghostButton} onClick={() => router.push("/wishlist")}>
            View wishlist ({wishlistCount})
          </button>
          {showStartOver ? (
            <button type="button" className={styles.ghostButton} onClick={resetDismissed}>
              Start over
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <div className={styles.gate}>
        <div className={styles.eyebrow}>Step 1 of 2</div>
        <h1 className={styles.title}>Tell us your type</h1>
        <p className={styles.sub}>
          Pick what matters. We&apos;ll deal you a stack of deduped matches. Swipe right to save, left to pass.
        </p>

        {loadingOptions ? (
          <div className={styles.loadingNote} aria-live="polite">
            Loading more filter options...
          </div>
        ) : null}

        <div className={styles.group}>
          <div className={styles.groupLabel}>Price</div>
          <div className={styles.chips}>
            {PRICE_GROUPS.map((group) => (
              <button
                key={group.label}
                type="button"
                className={`${styles.chip} ${selectedPriceLabels.includes(group.label) ? styles.chipSelected : ""}`}
                onClick={() => handleTogglePrice(group.label)}
              >
                {group.label}
              </button>
            ))}
          </div>
        </div>

        {options ? (
          <>
            <div className={styles.group}>
              <div className={styles.groupLabel}>Make</div>
              <div className={styles.chips}>
                {options.makes.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.chip} ${(draft.makes || []).includes(value) ? styles.chipSelected : ""}`}
                    onClick={() => handleToggleList("makes", value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.group}>
              <div className={styles.groupLabel}>Body type</div>
              <div className={styles.chips}>
                {options.body.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.chip} ${(draft.body || []).includes(value) ? styles.chipSelected : ""}`}
                    onClick={() => handleToggleList("body", value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.group}>
              <div className={styles.groupLabel}>Fuel</div>
              <div className={styles.chips}>
                {options.fuel.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.chip} ${(draft.fuel || []).includes(value) ? styles.chipSelected : ""}`}
                    onClick={() => handleToggleList("fuel", value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.group}>
              <div className={styles.groupLabel}>Drive type</div>
              <div className={styles.chips}>
                {options.drive.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.chip} ${(draft.drive || []).includes(value) ? styles.chipSelected : ""}`}
                    onClick={() => handleToggleList("drive", value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.group}>
              <div className={styles.groupLabel}>Transmission</div>
              <div className={styles.chips}>
                {options.transmission.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.chip} ${(draft.transmission || []).includes(value) ? styles.chipSelected : ""}`}
                    onClick={() => handleToggleList("transmission", value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.group}>
              <div className={styles.groupLabel}>Cylinders</div>
              <div className={styles.chips}>
                {options.cylinders.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.chip} ${(draft.cylinders || []).includes(value) ? styles.chipSelected : ""}`}
                    onClick={() => handleToggleList("cylinders", value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : loadingOptions ? (
          <div className={styles.loadingGroups} aria-hidden="true">
            {["Make", "Body type", "Fuel", "Drive type", "Transmission", "Cylinders"].map((label) => (
              <div key={label} className={styles.group}>
                <div className={styles.groupLabel}>{label}</div>
                <div className={styles.chips}>
                  <span className={styles.loadingChip} />
                  <span className={styles.loadingChip} />
                  <span className={styles.loadingChip} />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className={styles.gateFooter}>
          <button type="button" className={styles.primaryButton} onClick={() => startDeck(draft)}>
            Deal my cards
          </button>
          <button type="button" className={styles.secondaryButton} onClick={() => startDeck(EMPTY_FILTERS)}>
            Skip - show me everything
          </button>
        </div>
      </div>
    </div>
  );
}
