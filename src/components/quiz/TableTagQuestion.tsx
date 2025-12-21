'use client';
import styles from './TableTagQuestion.module.css';
import { setQuestionAnswer } from '../../utils/storage';

type TagOptionObj = {
  label: string;
  categories?: {
    primary: string;
    secondary: string;
  };
};

type TagOption = string | TagOptionObj;

type Props = {
  questionId: string;
  title: string;
  tip?: string;
  tags: TagOption[];
  minSelect?: number;
  maxSelect?: number;
  selected?: string[];
  onChange?: (selected: string[]) => void;
};

export default function TableTagQuestion({ questionId, title, tip, tags, minSelect = 2, maxSelect = 5, selected = [], onChange }: Props) {
  const sel = new Set(selected);
  
  function toggle(tagLabel: string) {
    const next = new Set(sel);
    if (next.has(tagLabel)) {
      next.delete(tagLabel);
    } else {
      if (next.size < maxSelect) {
        next.add(tagLabel);
      }
    }
    const arr = Array.from(next);
    onChange?.(arr);
    
    // Save full details including categories
    const selectedTagsDetails = arr.map(label => {
      const tagObj = tags.find(t => (typeof t === 'string' ? t : t.label) === label);
      if (typeof tagObj === 'string') return { label: tagObj };
      return tagObj; // This includes categories if present
    });

    setQuestionAnswer(questionId, { 
      tags: arr, 
      details: selectedTagsDetails,
      min: minSelect, 
      max: maxSelect 
    });
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
          {tags.map(t => {
            const label = typeof t === 'string' ? t : t.label;
            return (
              <div 
                key={label} 
                className={`${styles.cell} ${sel.has(label) ? styles.cellActive : ''}`}
                onClick={() => toggle(label)}
              >
                <span className={styles.cellText}>{label}</span>
              </div>
            );
          })}
        </div>

        <div className={styles.counter}>
          {selected.length} selected • choose {minSelect}–{maxSelect}
        </div>
      </div>
    </div>
  );
}
