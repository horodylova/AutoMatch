'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import formStyles from '../QuizForm.module.css';
import headStyles from './TagQuestion.module.css';
import styles from './SizeScaleQuestion.module.css';
import { setQuestionAnswer } from '../../utils/storage';
 
 type Props = {
   questionId: string;
   title: string;
   tip?: string;
   value?: number | null;
   onChange?: (index: number) => void;
 };
 
  export default function SizeScaleQuestion({ questionId, title, tip, value = null, onChange }: Props) {
   const [index, setIndex] = useState<number | null>(value);
   const boxRef = useRef<HTMLDivElement | null>(null);
   const [dragging, setDragging] = useState<boolean>(false);
   const [hoverI, setHoverI] = useState<number | null>(null);
   const labels = useMemo(() => [
     'Small & agile — easy to park, quick to move',
     'Mid-size & balanced — spacious but not overwhelming',
     'Large & comfortable — plenty of room for Life',
     'Oversized & powerful — presence you can feel',
   ], []);
   useEffect(() => { setIndex(value); }, [value]);
   const setVal = (i: number) => {
     setIndex(i);
     onChange?.(i);
     setQuestionAnswer(questionId, { index: i, label: labels[i] });
   };
   const onPointerMove = (clientX: number) => {
     const el = boxRef.current;
     if (!el) return;
     const rect = el.getBoundingClientRect();
     const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
     const nearest = Math.round(x * 3);
     setIndex(nearest);
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
         <div className={styles.scaleBox}>
           <div
             ref={boxRef}
             className={styles.scale}
             onMouseDown={(e) => { setDragging(true); onPointerMove(e.clientX); }}
             onMouseMove={(e) => { if (dragging) onPointerMove(e.clientX); }}
             onMouseUp={() => { setDragging(false); if (typeof index === 'number') setVal(index); }}
             onMouseLeave={() => { if (dragging) setDragging(false); }}
             onTouchStart={(e) => { const t = e.touches[0]; setDragging(true); onPointerMove(t.clientX); }}
             onTouchMove={(e) => { const t = e.touches[0]; if (dragging) onPointerMove(t.clientX); }}
             onTouchEnd={() => { setDragging(false); if (typeof index === 'number') setVal(index); }}
           >
             <div className={styles.rail}></div>
             <div className={styles.railGlow}></div>
             <div className={styles.stops}>
               {[0,1,2,3].map(i => {
                 const active = typeof index === 'number' ? i === index : false;
                 const fill = active ? 'var(--kendo-color-primary)' : 'rgba(14,27,36,0.65)';
                 const stroke = active ? 'rgba(201,71,45,0.95)' : 'rgba(14,27,36,0.8)';
                 const scale = 0.9 + i * 0.1;
                 return (
                   <div
                     key={i}
                     className={styles.stop}
                     onMouseEnter={() => { setHoverI(i); }}
                     onMouseLeave={() => { setHoverI(null); }}
                   >
                     <div className={`${styles.circle} ${active ? styles.circleActive : ''}`}>
                       <svg className={styles.car} viewBox="0 0 200 80">
                         <g transform={`translate(0,0) scale(${scale})`}>
                           <path d="M20 54 C30 34, 60 24, 100 24 C140 24, 160 34, 180 50 L180 60 L20 60 Z" fill={fill} stroke={stroke} strokeWidth={2} />
                           <rect x={52} y={20} width={96} height={16} rx={8} fill={fill} stroke={stroke} strokeWidth={2} />
                           <circle cx={60} cy={60} r={9} fill={stroke} />
                           <circle cx={140} cy={60} r={9} fill={stroke} />
                         </g>
                       </svg>
                     </div>
                     {hoverI === i && (
                       <div className={styles.tooltip}>{labels[i]}</div>
                     )}
                   </div>
                 );
               })}
             </div>
           </div>
         </div>
       </div>
     </div>
   );
 }
