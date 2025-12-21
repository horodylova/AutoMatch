'use client';
import { useState } from 'react';
import formStyles from '../QuizForm.module.css';
import styles from './TagQuestion.module.css';
import { setQuestionAnswer } from '../../utils/storage';

type OptionObj = {
  label: string;
  categories?: {
    primary: string;
    secondary: string;
  };
};

type Props = {
  questionId: string;
  title: string;
  tip?: string;
  options: (string | OptionObj)[];
  selectedIndex?: number | null;
  onSelect?: (index: number) => void;
  showActions?: boolean;
};

export default function ChoiceQuestion({ questionId, title, tip, options, selectedIndex = null, onSelect, showActions = false }: Props) {
  const [selected, setSelected] = useState<number | null>(selectedIndex);
  const handleSelect = (i: number) => {
    setSelected(i);
    onSelect?.(i);
    
    const opt = options[i];
    if (typeof opt === 'string') {
      setQuestionAnswer(questionId, { index: i, title: opt });
    } else {
      setQuestionAnswer(questionId, { 
        index: i, 
        title: opt.label,
        categories: opt.categories 
      });
    }
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
          {options.map((a, i) => {
            const label = typeof a === 'string' ? a : a.label;
            return (
              <button key={i} className={selected === i ? formStyles.answerActive : formStyles.answer} onClick={() => handleSelect(i)}>
                <span className={formStyles.dot} />
                <span className={formStyles.answerText}>{label}</span>
              </button>
            );
          })}
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
