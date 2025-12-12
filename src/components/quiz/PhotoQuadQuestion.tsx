'use client';
import Image from 'next/image';
import styles from './PhotoQuadQuestion.module.css';
import headStyles from './TagQuestion.module.css';
import { setQuestionAnswer } from '../../utils/storage';

type Props = {
  questionId: string;
  title: string;
  tip?: string;
  options: string[];
  selectedIndex?: number | null;
  onSelect?: (index: number) => void;
};

export default function PhotoQuadQuestion({ questionId, title, tip, options, selectedIndex = null, onSelect }: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={headStyles.head}>
          <div className={headStyles.title}>{title}</div>
          {tip && (
            <div className={headStyles.tipBar}>
              <span className={headStyles.tipDot} />
              <span className={headStyles.tipText}>{tip}</span>
            </div>
          )}
        </div>
        <div className={styles.grid}>
          {options.map((t, i) => {
            const active = selectedIndex === i;
            return (
              <button key={t} className={active ? styles.itemActive : styles.item} onClick={() => { onSelect?.(i); setQuestionAnswer(questionId, { index: i, title: t }); }}>
                <span className={`${styles.check} ${active ? styles.checkOn : ''}`} />
                <Image src={`/croped pictures/${i + 1}.jpeg`} alt={t} fill className={styles.img} sizes="(max-width: 900px) 50vw, 220px" />
                <div className={styles.labelPill}>{t}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
