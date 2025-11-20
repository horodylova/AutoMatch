'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import headerStyles from './Header.module.css';
import styles from './DatingHero.module.css';

export default function DatingHero() {
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{x:number;y:number}>({x:0,y:0});
  const [isDragging, setIsDragging] = useState(false);
  const start = useRef<{x:number;y:number}>({x:0,y:0});

  function down(e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {
    setIsDragging(true);
    const p = 'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
    start.current = p;
  }
  function move(e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {
    if (!isDragging) return;
    const p = 'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
    setDrag({ x: p.x - start.current.x, y: p.y - start.current.y });
  }
  function up() {
    setIsDragging(false);
    setDrag({ x: 0, y: 0 });
  }

  const rot = Math.max(-18, Math.min(18, drag.x / 12));
  const tx = drag.x;
  const ty = drag.y / 2;

  return (
    <section className={styles.section}>
      {/* <div className={styles.inner}>
        <div className={styles.cardWrap}>
          <div
            ref={ref}
            className={styles.card}
            onMouseDown={down}
            onMouseMove={move}
            onMouseUp={up}
            onMouseLeave={up}
            onTouchStart={down}
            onTouchMove={move}
            onTouchEnd={up}
            style={{ transform: `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg)` }}
          >
            <div className={styles.imgBox}>
              <Image
                src="/CardImage3.png"
                alt="car"
                fill
                className={styles.cardImg}
                sizes="(max-width: 768px) 90vw, 420px"
                priority
              />
            </div>
          </div>
          <div className={styles.actions}>
            <button className={styles.actionBtn} aria-label="Pass"><span className={styles.cross}>✖️</span></button>
            <button className={styles.actionBtn} aria-label="Like"><span className={styles.heart}>❤️</span></button>
          </div>
        </div> */}
        <div className={styles.ctaRow}>
          <Link href="/#how-it-works" className={headerStyles.contactButton}>Start Quiz</Link>
        </div>
      {/* </div> */}
    </section>
  );
}