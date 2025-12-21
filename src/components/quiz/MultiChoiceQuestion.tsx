'use client';
import { useMemo, useState } from 'react';
import formStyles from '../QuizForm.module.css';
import headStyles from './TagQuestion.module.css';
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
    
    const titles: string[] = [];
    const categories: Record<number, { primary: string; secondary: string }> = {};

    arr.forEach(i => {
      const opt = options[i];
      if (typeof opt === 'string') {
        titles.push(opt);
      } else {
        titles.push(opt.label);
        if (opt.categories) {
          categories[i] = opt.categories;
        }
      }
    });

    setQuestionAnswer(questionId, { 
      indexes: arr, 
      titles, 
      categories,
      min: minSelect, 
      max: maxSelect 
    });
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
            const label = typeof a === 'string' ? a : a.label;
            return (
              <button key={i} className={active ? formStyles.answerActive : formStyles.answer} onClick={() => toggle(i)}>
                <span className={formStyles.dot} />
                <span className={formStyles.answerText}>{label}</span>
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
