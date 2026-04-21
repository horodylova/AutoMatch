'use client';
import Image from 'next/image';
import styles from './PhotoQuadQuestion.module.css';
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
  selectedIndex?: number | null;
  onSelect?: (index: number) => void;
  imageBasePath?: string;
  isMobile?: boolean;
  mobileSuffix?: string;
};

export default function PhotoQuadQuestion({ questionId, title, tip, options, selectedIndex = null, onSelect, imageBasePath, isMobile = false, mobileSuffix = 'm' }: Props) {
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
            const label = typeof t === 'string' ? t : t.label;
            return (
              <button 
                key={label} 
                className={active ? styles.itemActive : styles.item} 
                onClick={() => { 
                  onSelect?.(i); 
                  const answerData: { index: number; title: string; categories?: { primary: string; secondary: string } } = { index: i, title: label };
                  if (typeof t !== 'string' && t.categories) {
                    answerData.categories = t.categories;
                  }
                  setQuestionAnswer(questionId, answerData); 
                }}
              >
                <span className={`${styles.check} ${active ? styles.checkOn : ''}`} />
                <Image src={imageBasePath ? `${imageBasePath}/${i + 1}${isMobile ? mobileSuffix : ''}.jpeg` : `/CardImage3.png`} alt={label} fill className={styles.img} sizes="(max-width: 900px) 50vw, 220px" unoptimized />
                <div className={styles.labelPill}>{label}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
