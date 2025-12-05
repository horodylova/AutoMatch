"use client";
import styles from "./cars.module.css";
import { SvgIcon } from "@progress/kendo-react-common";
import { gridLayoutIcon, thumbnailsLeftIcon } from "@progress/kendo-svg-icons";

type ViewMode = "grid" | "list";
type SortMode = "none" | "new" | "priceAsc" | "priceDesc";

export default function ResultsToolbar({ count = 0, view, sort, onViewChange, onSortChange }: { count?: number; view: ViewMode; sort: SortMode; onViewChange: (v: ViewMode) => void; onSortChange: (s: SortMode) => void }) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.resultCount}>Showing {count} results</div>
      <div className={styles.toolbarRight}>
        <div className={styles.viewToggle}>
          <button className={view === "list" ? styles.iconBtnActive : styles.iconBtn} onClick={() => onViewChange("list")} aria-label="List view">
            <SvgIcon icon={thumbnailsLeftIcon} style={{ color: view === "list" ? "var(--kendo-color-on-primary)" : "rgba(230,214,180,0.85)" }} />
          </button>
          <button className={view === "grid" ? styles.iconBtnActive : styles.iconBtn} onClick={() => onViewChange("grid")} aria-label="Grid view">
            <SvgIcon icon={gridLayoutIcon} style={{ color: view === "grid" ? "var(--kendo-color-on-primary)" : "rgba(230,214,180,0.85)" }} />
          </button>
        </div>
        <div className={styles.sortRow}>
          <span className={styles.sortLabel}>Sort by:</span>
          <div className={styles.pills}>
            <button className={`${styles.pill} ${sort === "new" ? styles.pillActive : ""}`} onClick={() => onSortChange(sort === "new" ? "none" : "new")}>Newest</button>
            <button className={`${styles.pill} ${sort === "priceAsc" ? styles.pillActive : ""}`} onClick={() => onSortChange(sort === "priceAsc" ? "none" : "priceAsc")}>Price ↑</button>
            <button className={`${styles.pill} ${sort === "priceDesc" ? styles.pillActive : ""}`} onClick={() => onSortChange(sort === "priceDesc" ? "none" : "priceDesc")}>Price ↓</button>
          </div>
        </div>
      </div>
    </div>
  );
}
