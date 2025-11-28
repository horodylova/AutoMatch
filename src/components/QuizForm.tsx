'use client';
import { useState } from 'react';
import styles from './QuizForm.module.css';

type Props = {
  question: string;
  answers: string[];
  onSelect?: (index: number) => void;
  onNext?: (selectedIndex: number | null) => void;
  showActions?: boolean;
};

export default function QuizForm({ question, answers, onSelect, onNext, showActions = true }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (i: number) => {
    setSelected(i);
    if (onSelect) onSelect(i);
  };

  const handleNext = () => {
    if (onNext) onNext(selected);
  };

  return (
    <div className={styles.frame}>
      <div className={styles.card}>
        <div className={styles.question}>{question}</div>
        <div className={styles.answers}>
          {answers.map((a, i) => (
            <button
              key={i}
              className={selected === i ? styles.answerActive : styles.answer}
              onClick={() => handleSelect(i)}
            >
              <span className={styles.dot} />
              <span className={styles.answerText}>{a}</span>
            </button>
          ))}
        </div>
        {showActions && (
          <div className={styles.actions}>
            <button className={styles.next} onClick={handleNext}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
