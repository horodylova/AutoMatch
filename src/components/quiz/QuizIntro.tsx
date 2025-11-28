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
          <Image src={imageSrc || '/images/quiz-intro.jpg'} alt="intro" fill sizes="(max-width: 768px) 100vw, 50vw" className={styles.mediaImg} style={{ objectFit: 'cover' }} />
        </div>
        <div className={styles.list}>
          <div className={styles.item}><span className={styles.dot} /><span className={styles.itemText}>The CarCupid Match Quiz contains 30+ thoughtful questions and usually takes about 10 minutes to complete.</span></div>
          <div className={styles.item}><span className={styles.dot} /><span className={styles.itemText}>This isn’t a test — it’s a game.</span></div>
          <div className={styles.item}><span className={styles.dot} /><span className={styles.itemText}>Follow your first instinct. There are no right or wrong answers; just choose what feels true in the moment.</span></div>
          <div className={styles.item}><span className={styles.dot} /><span className={styles.itemText}>You can pause at any time.</span></div>
          <div className={styles.item}><span className={styles.dot} /><span className={styles.itemText}>Your progress will be saved for 24 hours, so you can return and continue whenever you’re ready. If more than 24 hours pass, you’ll start fresh.</span></div>
          <div className={styles.item}><span className={styles.dot} /><span className={styles.itemText}>At the end, you’ll receive your personalized match results, with options to share on social media or email them to yourself.</span></div>
        </div>
      </div>
      <div className={styles.actions}>
        <button className={styles.next} onClick={onNext}>Next</button>
      </div>
    </div>
  );
}
