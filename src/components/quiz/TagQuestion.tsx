'use client';
import styles from './TagQuestion.module.css';
import { setQuestionAnswer } from '../../utils/storage';
import formStyles from '../QuizForm.module.css';

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

export default function TagQuestion({ questionId, title, tip, tags, minSelect = 3, maxSelect = 5, selected = [], onChange }: Props) {
  const sel = new Set(selected);
  function toggle(tag: string) {
    const next = new Set(sel);
    if (next.has(tag)) next.delete(tag); else if (next.size < maxSelect) next.add(tag);
    const arr = Array.from(next);
    onChange?.(arr);
    setQuestionAnswer(questionId, { tags: arr, min: minSelect, max: maxSelect });
  }
  return (
    <div className={styles.wrap}>
      <div className={formStyles.card}>
        <div className={styles.head}>
          <div className={styles.title}>{title}</div>
          {tip && <div className={styles.subtitle}>{tip}</div>}
        </div>
        <div className={styles.cloud}>
          {tags.map(t => (
            <button key={t} className={sel.has(t) ? styles.tagActive : styles.tag} onClick={() => toggle(t)}>{t}</button>
          ))}
        </div>
        <div className={styles.counter}>{selected.length} selected • choose {minSelect}–{maxSelect}</div>
      </div>
    </div>
  );
}
