"use client";
import { Button } from "@progress/kendo-react-buttons";
import styles from "./cars.module.css";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
};

export default function Pagination({ page, pageSize, total, onChange }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const prev = () => onChange(Math.max(1, page - 1));
  const next = () => onChange(Math.min(pages, page + 1));
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const end = Math.min(pages, start + 4);
  const nums = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  return (
    <div className={styles.pager}>
      <Button onClick={prev} disabled={page <= 1} className={styles.pagerBtn}>Prev</Button>
      <div className={styles.pagerNums}>
        {nums.map(n => (
          <button key={n} className={n === page ? styles.pagerBtnActive : styles.pagerBtn} onClick={() => onChange(n)}>{n}</button>
        ))}
      </div>
      <Button onClick={next} disabled={page >= pages} className={styles.pagerBtn}>Next</Button>
    </div>
  );
}
