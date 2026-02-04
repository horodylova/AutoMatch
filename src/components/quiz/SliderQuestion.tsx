'use client';
import { useState } from 'react';
import formStyles from '../QuizForm.module.css';
import styles from './TagQuestion.module.css';
import { setQuestionAnswer } from '../../utils/storage';

type CategoryRange = {
  min: number;
  max: number;
  categories: {
    primary: string;
    secondary: string;
  };
};

type Props = {
  questionId: string;
  title: string;
  tip?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number | null;
  onChange?: (value: number) => void;
  labels?: [string, string, string];
  categoryRanges?: CategoryRange[];
};

export default function SliderQuestion({ questionId, title, tip, min = 0, max = 100, step = 1, value = null, onChange, labels, categoryRanges }: Props) {
  const [val, setVal] = useState<number | null>(value);
  const handle = (v: number) => {
    setVal(v);
    onChange?.(v);
    
    const answerData: { value: number; min: number; max: number; categories?: { primary: string; secondary: string } } = { value: v, min, max };
    
    if (categoryRanges) {
      const selectedRange = categoryRanges.find(r => v >= r.min && v <= r.max);
      
      if (selectedRange) {
        answerData.categories = selectedRange.categories;
      }
    }
    
    setQuestionAnswer(questionId, answerData);
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
        <div style={{ padding: '12px 8px', display: 'grid', justifyItems: 'center' }}>
          <div style={{ width: 'min(100%, 600px)' }}>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={typeof val === 'number' ? val : Math.round((min + max) / 2)}
              onChange={(e) => handle(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--kendo-color-primary)' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginTop: 8, color: 'rgba(14,27,36,0.85)', fontSize: 14 }}>
              {labels ? (
                <>
                  <span>{labels[0]}</span>
                  <span style={{ textAlign: 'center' }}>{labels[1]}</span>
                  <span style={{ textAlign: 'right' }}>{labels[2]}</span>
                </>
              ) : (
                <>
                  <span>{min}</span>
                  <span style={{ textAlign: 'center' }}>{Math.round((min + max) / 2)}</span>
                  <span style={{ textAlign: 'right' }}>{max}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
