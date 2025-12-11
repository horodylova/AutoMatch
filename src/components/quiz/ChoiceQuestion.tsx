'use client';
import { useState } from 'react';
import formStyles from '../QuizForm.module.css';
import styles from './TagQuestion.module.css';
import { setQuestionAnswer } from '../../utils/storage';

type Props = {
  questionId: string;
  title: string;
  tip?: string;
  options: string[];
  selectedIndex?: number | null;
  onSelect?: (index: number) => void;
  showActions?: boolean;
};

export default function ChoiceQuestion({ questionId, title, tip, options, selectedIndex = null, onSelect, showActions = false }: Props) {
  const [selected, setSelected] = useState<number | null>(selectedIndex);
  const handleSelect = (i: number) => {
    setSelected(i);
    onSelect?.(i);
    setQuestionAnswer(questionId, { index: i, title: options[i] });
  };
  return (
    <div className={formStyles.frame}>
      <div className={formStyles.card}>
        <div className={styles.head}>
          <div className={styles.title}>{title}</div>
          {tip && (
            <div className={styles.tipBar}>
              <span className={styles.tipDot} />
              <span className={styles.tipText}>{tip}</span>
            </div>
          )}
        </div>
        <div className={formStyles.answers}>
          {options.map((a, i) => (
            <button key={i} className={selected === i ? formStyles.answerActive : formStyles.answer} onClick={() => handleSelect(i)}>
              <span className={formStyles.dot} />
              <span className={formStyles.answerText}>{a}</span>
            </button>
          ))}
        </div>
        {showActions && (
          <div className={formStyles.actions}>
            <button className={formStyles.next}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
