"use client";
import { useEffect, useState } from "react";
import QuizProgress from "../../components/QuizProgress";
import QuizForm from "../../components/QuizForm";

export default function Page() {
  const [total, setTotal] = useState<number>(10);
  const [current, setCurrent] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
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
      paddingBottom: isMobile ? "clamp(56px, 10vw, 88px)" : "clamp(88px, 12vw, 160px)",
      minHeight: isMobile ? "auto" : "100vh",
      color: "var(--kendo-color-on-app-surface)"
    }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <QuizProgress current={current} total={total} />
        <QuizForm
          question={"What matters most in your next car?"}
          answers={[
            "Fuel efficiency and low running costs",
            "Sporty performance and sharp handling",
            "Family comfort, space and safety",
            "Utility, towing and off-road capability"
          ]}
          onNext={() => setCurrent(v => Math.min(total, v + 1))}
        />
        
      </div>
    </div>
  );
}
