'use client';
import styles from './TableTagQuestion.module.css';
import { setQuestionAnswer } from '../../utils/storage';

type Props = {
  questionId: string;
  title: string;
  tip?: string;
  tags: string[];
  minSelect?: number;
  maxSelect?: number;
  selected?: string[];
  onChange?: (selected: string[]) => void;
};

export default function TableTagQuestion({ questionId, title, tip, tags, minSelect = 2, maxSelect = 5, selected = [], onChange }: Props) {
  const sel = new Set(selected);
  
  function toggle(tag: string) {
    const next = new Set(sel);
    if (next.has(tag)) {
      next.delete(tag);
    } else {
      if (next.size < maxSelect) {
        next.add(tag);
      }
    }
    const arr = Array.from(next);
    onChange?.(arr);
    setQuestionAnswer(questionId, { tags: arr, min: minSelect, max: maxSelect });
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.head}>
          <div className={styles.title}>{title}</div>
          {tip && (
            <div className={styles.tipBar}>
              <span className={styles.tipDot} />
              <span className={styles.tipText}>{tip}</span>
            </div>
          )}
        </div>
        
        <div className={styles.tableGrid}>
          {tags.map(t => (
            <div 
              key={t} 
              className={`${styles.cell} ${sel.has(t) ? styles.cellActive : ''}`}
              onClick={() => toggle(t)}
            >
              <span className={styles.cellText}>{t}</span>
            </div>
          ))}
        </div>

        <div className={styles.counter}>
          {selected.length} selected • choose {minSelect}–{maxSelect}
        </div>
      </div>
    </div>
  );
}
