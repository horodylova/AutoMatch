'use client';
import Image from 'next/image';
import styles from './QuizIntro.module.css';

type Props = { onNext?: () => void; imageSrc?: string };

export default function QuizIntro({ onNext, imageSrc }: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div className={styles.title}>Before We Begin</div>
        <div className={styles.subtitle}>A quick guide to your CarCupid Match Quiz</div>
      </div>
      <div className={styles.content}>
        <div className={styles.media}>
          <Image src={imageSrc || '/before-you-begin.jpg'} alt="intro" fill sizes="(max-width: 768px) 100vw, 50vw" className={styles.mediaImg} style={{ objectFit: 'cover' }} />
        </div>
        <div className={styles.list}>
          <div className={styles.item}><span className={styles.dot} /><span className={styles.itemText}>Takes about 8 minutes.</span></div>
          <div className={styles.item}><span className={styles.dot} /><span className={styles.itemText}>This is a game.</span></div>
          <div className={styles.item}><span className={styles.dot} /><span className={styles.itemText}>Follow your first instinct.</span></div>
          <div className={styles.item}><span className={styles.dot} /><span className={styles.itemText}>You can pause at any time.</span></div>
          <div className={styles.item}><span className={styles.dot} /><span className={styles.itemText}>Your progress is saved for 24h.</span></div>
          <div className={styles.item}><span className={styles.dot} /><span className={styles.itemText}>Get your match results at the end.</span></div>
        </div>
      </div>
      <div className={styles.actions}>
        <button className={styles.next} onClick={onNext}>Next</button>
      </div>
    </div>
  );
}
