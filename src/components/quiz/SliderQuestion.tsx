'use client';
import { useState } from 'react';
import { Slider } from '@progress/kendo-react-inputs';
import formStyles from '../QuizForm.module.css';
import styles from './TagQuestion.module.css';
import { setQuestionAnswer } from '../../utils/storage';

type Props = {
  questionId: string;
  title: string;
  tip?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number | null;
  onChange?: (value: number) => void;
};

export default function SliderQuestion({ questionId, title, tip, min = 0, max = 100, step = 1, value = null, onChange }: Props) {
  const [val, setVal] = useState<number | null>(value);
  const handle = (v: number) => {
    setVal(v);
    onChange?.(v);
    setQuestionAnswer(questionId, { value: v, min, max });
  };
  return (
    <div className={formStyles.frame}>
      <div className={formStyles.card}>
        <div className={styles.head}>
          <div className={styles.title}>{title}</div>
          {tip && <div className={styles.subtitle}>{tip}</div>}
        </div>
        <div style={{ padding: '12px 8px', display: 'grid', justifyItems: 'center' }}>
          <div style={{ width: 'min(100%, 600px)' }}>
            <Slider
              min={min}
              max={max}
              step={step}
              value={typeof val === 'number' ? val : Math.round((min + max) / 2)}
              onChange={(e) => handle(e.value)}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginTop: 8, color: 'rgba(14,27,36,0.85)', fontSize: 14 }}>
              <span>{min}</span>
              <span style={{ textAlign: 'center' }}>{Math.round((min + max) / 2)}</span>
              <span style={{ textAlign: 'right' }}>{max}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
