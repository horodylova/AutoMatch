'use client';
import Image from 'next/image';
import styles from './PhotoQuestion.module.css';
import formStyles from '../QuizForm.module.css';
import introStyles from './QuizIntro.module.css';
import tipStyles from './PhotoQuestion.module.css';
import { setQuestionAnswer } from '../../utils/storage';

type Option = { 
  key: string; 
  title: string; 
  src: string;
  categories?: {
    primary: string;
    secondary: string;
  };
};

type Props = {
  questionId: string;
  title: string;
  tip?: string;
  options: Option[];
  selectedKey?: string | null;
  onSelect?: (key: string) => void;
};

export default function PhotoQuestion({ questionId, title, tip, options, selectedKey, onSelect }: Props) {
  return (
    <div className={styles.wrap}>
      <div className={formStyles.card}>
        <div className={`${introStyles.head} ${styles.headSpacing}`}>
          <div className={styles.titleFix}>{title}</div>
          {tip && (
            <div className={tipStyles.tipBar}>
              <span className={tipStyles.tipDot} />
              <span className={tipStyles.tipText}>{tip}</span>
            </div>
          )}
        </div>
        <div className={styles.grid}>
          {options.map(opt => {
            const active = selectedKey === opt.key;
            return (
            <button key={opt.key} className={active ? styles.cardActive : styles.card} onClick={() => { 
              onSelect?.(opt.key); 
              setQuestionAnswer(questionId, { 
                key: opt.key, 
                title: opt.title,
                categories: opt.categories
              }); 
            }}>
              <Image src={opt.src} alt={opt.title} fill sizes="(max-width: 768px) 50vw, 33vw" className={styles.img} style={{ objectFit: 'cover' }} priority={opt.key === options[0].key} />
              <div className={styles.labelBar}>
                <div className={styles.labelTitle}>{opt.title}</div>
              </div>
            </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
