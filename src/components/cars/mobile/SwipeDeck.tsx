"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./CarsMobileExperience.module.css";
import { SwipeDeckItem } from "./types";

type Props = {
  items: SwipeDeckItem[];
  onLike: (item: SwipeDeckItem) => void;
  onNope: (item: SwipeDeckItem) => void;
  onEditFilters: () => void;
  onDropBroken: (itemId: string) => void;
  onPersist: () => void;
};

type DragState = {
  dx: number;
  dy: number;
  anim: "idle" | "settle" | "fly-left" | "fly-right";
};

function fmtUSD(value: number | null): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Price on request";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  return reduced;
}

export default function SwipeDeck({
  items,
  onLike,
  onNope,
  onEditFilters,
  onDropBroken,
  onPersist,
}: Props) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const topCardRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<DragState>({ dx: 0, dy: 0, anim: "idle" });
  const topItem = items[0] ?? null;
  const visibleItems = useMemo(() => items.slice(0, 3), [items]);

  useEffect(() => {
    if (!topItem) {
      setDrag({ dx: 0, dy: 0, anim: "idle" });
    }
  }, [topItem]);

  const triggerSwipe = useCallback((direction: 1 | -1) => {
    if (!topItem) return;

    if (reducedMotion) {
      setDrag({ dx: 0, dy: 0, anim: "idle" });
      if (direction > 0) onLike(topItem);
      else onNope(topItem);
      return;
    }

    setDrag({
      dx: direction * 520,
      dy: -40,
      anim: direction > 0 ? "fly-right" : "fly-left",
    });

    window.setTimeout(() => {
      if (direction > 0) onLike(topItem);
      else onNope(topItem);
      setDrag({ dx: 0, dy: 0, anim: "idle" });
    }, 420);
  }, [onLike, onNope, reducedMotion, topItem]);

  useEffect(() => {
    const el = topCardRef.current;
    if (!el || !topItem) return;

    let startX = 0;
    let startY = 0;
    let dx = 0;
    let dy = 0;
    let down = false;

    const begin = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".btn-det")) return;
      if (drag.anim !== "idle") return;
      down = true;
      const point = "touches" in event ? event.touches[0] : event;
      startX = point.clientX;
      startY = point.clientY;
      dx = 0;
      dy = 0;
      setDrag({ dx: 0, dy: 0, anim: "idle" });
    };

    const move = (event: MouseEvent | TouchEvent) => {
      if (!down) return;
      const point = "touches" in event ? event.touches[0] : event;
      dx = point.clientX - startX;
      dy = point.clientY - startY;
      setDrag({ dx, dy, anim: "idle" });
      if ("cancelable" in event && event.cancelable) event.preventDefault();
    };

    const finish = () => {
      if (!down) return;
      down = false;
      if (Math.abs(dx) > 95) {
        triggerSwipe(dx > 0 ? 1 : -1);
        return;
      }
      if (reducedMotion) {
        setDrag({ dx: 0, dy: 0, anim: "idle" });
        return;
      }
      setDrag({ dx: 0, dy: 0, anim: "settle" });
      window.setTimeout(() => setDrag({ dx: 0, dy: 0, anim: "idle" }), 300);
    };

    el.addEventListener("mousedown", begin);
    el.addEventListener("touchstart", begin, { passive: true });
    window.addEventListener("mousemove", move);
    el.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("mouseup", finish);
    el.addEventListener("touchend", finish);

    return () => {
      el.removeEventListener("mousedown", begin);
      el.removeEventListener("touchstart", begin);
      window.removeEventListener("mousemove", move);
      el.removeEventListener("touchmove", move);
      window.removeEventListener("mouseup", finish);
      el.removeEventListener("touchend", finish);
    };
  }, [drag.anim, reducedMotion, topItem, triggerSwipe]);

  const openDetails = () => {
    if (!topItem) return;
    onPersist();
    router.push(`/cars/${encodeURIComponent(topItem.id)}`);
  };

  return (
    <div className={styles.deck}>
      <div className={styles.deckBar}>
        <div className={styles.deckCount}>
          <strong>{items.length}</strong> models left
        </div>
        <button type="button" className={styles.deckSecondaryButton} onClick={onEditFilters}>
          Edit filters
        </button>
      </div>

      <div className={styles.stage}>
        {visibleItems.map((item, index) => {
          const isTop = index === 0;
          const stampOpacity = isTop ? Math.min(Math.abs(drag.dx) / 90, 1) : 0;
          const baseTransform = `translateY(${index * 9}px) scale(${1 - index * 0.04})`;
          let transform = baseTransform;
          let transition = reducedMotion ? "none" : "transform 0.42s cubic-bezier(.2,.7,.3,1), opacity 0.42s ease";
          let opacity = 1;

          if (isTop) {
            const rotation = reducedMotion ? 0 : drag.dx * 0.055;
            if (drag.anim === "idle") {
              transform = `translate(${drag.dx}px, ${drag.dy}px) rotate(${rotation}deg)`;
              transition = "none";
            } else if (drag.anim === "settle") {
              transform = "translate(0, 0) rotate(0deg)";
              transition = reducedMotion ? "none" : "transform 0.3s cubic-bezier(.2,.8,.3,1)";
            } else {
              const direction = drag.anim === "fly-right" ? 1 : -1;
              transform = reducedMotion
                ? "translate(0, 0) rotate(0deg)"
                : `translate(${direction * 520}px, -40px) rotate(${direction * 24}deg)`;
              opacity = reducedMotion ? 1 : 0;
            }
          }

          const detailLine = [item.year ?? "", item.trim].filter(Boolean).join(" ");
          const specs = [
            item.specs.engine ? `${item.specs.engine}L` : "",
            item.specs.hp ? `${item.specs.hp} HP` : "",
            item.specs.seats ? `${item.specs.seats} seats` : "",
          ].filter(Boolean);

          return (
            <div
              key={item.id}
              ref={isTop ? topCardRef : undefined}
              className={`${styles.card} ${isTop ? styles.cardTop : styles.cardUnder}`}
              style={{
                zIndex: 20 - index,
                transform,
                transition,
                opacity,
                willChange: isTop ? "transform" : "auto",
                display: index > 2 ? "none" : "block",
              }}
            >
              <div className={styles.photoWrap}>
                {/* Plain img is intentional here so dead scraped URLs can be dropped immediately on error. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={`${item.make} ${item.model}`}
                  className={styles.photo}
                  onError={() => onDropBroken(item.id)}
                />
                {item.versionCount > 1 ? (
                  <div className={styles.versionBadge}>{item.versionCount} versions</div>
                ) : null}
                <div className={`${styles.stamp} ${styles.stampLike}`} style={{ opacity: drag.dx > 0 && isTop ? stampOpacity : 0 }}>
                  LIKE
                </div>
                <div className={`${styles.stamp} ${styles.stampNope}`} style={{ opacity: drag.dx < 0 && isTop ? stampOpacity : 0 }}>
                  NOPE
                </div>
              </div>

              <div className={styles.cardBody}>
                <h2 className={styles.cardTitle}>
                  {item.make} {item.model}
                </h2>
                <p className={styles.cardTrim}>{detailLine}</p>
                <div className={styles.specs}>
                  {specs.map((spec) => (
                    <div key={spec} className={styles.spec}>
                      {spec}
                    </div>
                  ))}
                </div>
                <div className={styles.priceRow}>
                  <div>
                    <small className={styles.priceLabel}>From</small>
                    <strong className={styles.priceValue}>{fmtUSD(item.price)}</strong>
                  </div>
                  <button type="button" className={`${styles.detailsButton} btn-det`} onClick={openDetails}>
                    Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.actions}>
        <button type="button" className={`${styles.actionButton} ${styles.actionNo}`} aria-label="Pass" onClick={() => triggerSwipe(-1)}>
          <svg viewBox="0 0 24 24">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
        <button type="button" className={`${styles.actionButton} ${styles.actionYes}`} aria-label="Save to wishlist" onClick={() => triggerSwipe(1)}>
          <svg viewBox="0 0 24 24">
            <path d="M12 21s-8-5.2-8-10.4A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 3.6C20 15.8 12 21 12 21z" />
          </svg>
        </button>
      </div>

      <div className={styles.hint}>Drag the card or tap the buttons</div>
    </div>
  );
}
