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
  selectedKeys: string[];
  onChange: (keys: string[]) => void;
};

export default function MultiPhotoQuestion({ questionId, title, tip, options, selectedKeys, onChange }: Props) {
  const handleSelect = (opt: Option) => {
    const isSelected = selectedKeys.includes(opt.key);
    let newKeys: string[];
    if (isSelected) {
      newKeys = selectedKeys.filter(k => k !== opt.key);
    } else {
      newKeys = [...selectedKeys, opt.key];
    }
    onChange(newKeys);
    
    // Store full objects for the selected keys with categories
    const selectedOptions = options
      .filter(o => newKeys.includes(o.key))
      .map(o => ({ 
        key: o.key, 
        title: o.title,
        categories: o.categories 
      }));
    setQuestionAnswer(questionId, selectedOptions);
  };

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
            const active = selectedKeys.includes(opt.key);
            return (
            <button key={opt.key} className={active ? styles.cardActive : styles.card} onClick={() => handleSelect(opt)}>
              <Image src={opt.src} alt={opt.title} fill sizes="(max-width: 768px) 50vw, 33vw" className={styles.img} style={{ objectFit: 'cover' }} />
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
