 'use client';
import Image from 'next/image';
import formStyles from '../QuizForm.module.css';
 import headStyles from './TagQuestion.module.css';
 import styles from './IconChoiceQuestion.module.css';
 import { setQuestionAnswer } from '../../utils/storage';
 
 type Option = { 
  key: string; 
  title: string; 
  desc: string; 
  icon: string;
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
  selectedIndex?: number | null;
  onSelect?: (index: number) => void;
};

export default function IconChoiceQuestion({ questionId, title, tip, options, selectedIndex = null, onSelect }: Props) {
  const handleSelect = (i: number) => {
    onSelect?.(i);
    const opt = options[i];
    setQuestionAnswer(questionId, { 
      index: i, 
      key: opt.key, 
      title: opt.title,
      categories: opt.categories 
    });
  };
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
        <div className={options.length === 3 ? styles.grid3 : styles.grid4}>
        {options.map((opt, i) => {
          const active = selectedIndex === i;
          return (
             <button key={opt.key} className={active ? styles.cardActive : styles.card} onClick={() => handleSelect(i)}>
               <div className={`${styles.check} ${active ? styles.checkOn : ''}`} />
              <Image 
                src={opt.icon} 
                alt={opt.title} 
                className={styles.icon} 
                width={58} 
                height={58} 
              />
              <div className={styles.title}>{opt.title}</div>
               <div className={styles.desc}>{opt.desc}</div>
             </button>
           );
         })}
        </div>
      </div>
    </div>
  );
}
