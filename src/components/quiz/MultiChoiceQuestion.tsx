'use client';
import { useMemo, useState } from 'react';
import formStyles from '../QuizForm.module.css';
import headStyles from './TagQuestion.module.css';
import { setQuestionAnswer } from '../../utils/storage';

type Props = {
  questionId: string;
  title: string;
  tip?: string;
  options: string[];
  selected?: number[];
  minSelect?: number;
  maxSelect?: number;
  onChange?: (selected: number[]) => void;
  showActions?: boolean;
};

export default function MultiChoiceQuestion({ questionId, title, tip, options, selected = [], minSelect = 1, maxSelect = options.length, onChange, showActions = false }: Props) {
  const [sel, setSel] = useState<number[]>(selected);
  const setAnswer = (arr: number[]) => {
    setSel(arr);
    onChange?.(arr);
    const titles = arr.map(i => options[i]);
    setQuestionAnswer(questionId, { indexes: arr, titles, min: minSelect, max: maxSelect });
  };
  const toggle = (i: number) => {
    const has = sel.includes(i);
    if (has) {
      const next = sel.filter(x => x !== i);
      setAnswer(next);
    } else {
      if (sel.length >= maxSelect) return;
      const next = [...sel, i];
      setAnswer(next);
    }
  };
  const counterLabel = useMemo(() => `${sel.length} selected • choose ${minSelect}${maxSelect < options.length ? `–${maxSelect}` : '+'}`, [sel.length, minSelect, maxSelect, options.length]);
  return (
    <div className={formStyles.frame}>
      <div className={formStyles.card}>
        <div className={headStyles.head}>
          <div className={headStyles.title}>{title}</div>
          {tip && (
            <div className={headStyles.tipBar}>
              <span className={headStyles.tipDot} />
              <span className={headStyles.tipText}>{tip}</span>
            </div>
          )}
        </div>
        <div className={formStyles.answers}>
          {options.map((a, i) => {
            const active = sel.includes(i);
            return (
              <button key={i} className={active ? formStyles.answerActive : formStyles.answer} onClick={() => toggle(i)}>
                <span className={formStyles.dot} />
                <span className={formStyles.answerText}>{a}</span>
              </button>
            );
          })}
        </div>
        <div className={headStyles.counter}>{counterLabel}</div>
        {showActions && (
          <div className={formStyles.actions}>
            <button className={formStyles.next}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
