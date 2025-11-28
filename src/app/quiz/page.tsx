"use client";
import { useEffect, useState } from "react";
import QuizProgress from "../../components/QuizProgress";
import QuizForm from "../../components/QuizForm";
import formStyles from "../../components/QuizForm.module.css";
// removed standalone QuizIntro; intro now inside QuizProgress

export default function Page() {
  const [total, setTotal] = useState<number>(10);
  const [current, setCurrent] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showIntro, setShowIntro] = useState<boolean>(true);
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return (
    <div style={{
      paddingLeft: "clamp(16px, 4vw, 32px)",
      paddingRight: "clamp(16px, 4vw, 32px)",
      paddingTop: isMobile ? "calc(clamp(88px, 12vw, 160px) + 24px)" : "clamp(88px, 12vw, 160px)",
      paddingBottom: isMobile ? "140px" : "160px",
      minHeight: isMobile ? "auto" : "100vh",
      color: "var(--kendo-color-on-app-surface)"
    }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <QuizProgress current={current} total={total} showIntro={showIntro} introImageSrc="/before-you-begin.jpg" />
        <div style={{ maxHeight: "min(70vh, 680px)", overflow: "auto", paddingRight: 4 }}>
          {!showIntro && (
          <QuizForm
            question={"What matters most in your next car?"}
            answers={[
              "Fuel efficiency and low running costs",
              "Sporty performance and sharp handling",
              "Family comfort, space and safety",
              "Utility, towing and off-road capability"
            ]}
            onNext={() => setCurrent(v => Math.min(total, v + 1))}
            showActions={false}
          />
          )}
        </div>
      </div>
      <div className={formStyles.floatingBar}>
        <div className={formStyles.barInner}>
          <button
            className={formStyles.next}
            onClick={() => {
              if (showIntro) setShowIntro(false); else setCurrent(v => Math.min(total, v + 1));
            }}
          >
            Next
          </button>
        </div>
      </div>
        
    </div>
  );
}
