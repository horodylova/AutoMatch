"use client";
import { useEffect, useState } from "react";
import QuizProgress from "../../components/QuizProgress";
import formStyles from "../../components/QuizForm.module.css";
import { PhotoQuestion, TagQuestion, ChoiceQuestion } from "../../components/quiz";
 
export default function Page() {
  const [total, setTotal] = useState<number>(10);
  const [current, setCurrent] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [morningChoice, setMorningChoice] = useState<string | null>(null);
  const [dailyTags, setDailyTags] = useState<string[]>([]);
  const [purchaseChoice, setPurchaseChoice] = useState<number | null>(null);
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
      color: "var(--kendo-color-on-app-surface)",
      backgroundColor: "var(--kendo-color-surface)"
    }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <QuizProgress current={current} total={total} showIntro={showIntro} introImageSrc="/before-you-begin.jpg" />
        <div style={{ maxHeight: "min(70vh, 680px)", overflow: "auto", paddingRight: 4 }}>
          {!showIntro && current === 0 && (
            <PhotoQuestion
              questionId="perfect_morning"
              title="Your Perfect Morning"
              tip="Tip: Choose what feels closest to your real life"
              options={[
                { key: "calm_breakfast", title: "Calm breakfast", src: "/perfect morning-quiz/Calm breakfast.jpg" },
                { key: "fast_commute", title: "Fast-paced commute", src: "/perfect morning-quiz/Fast-paced commute.jpg" },
                { key: "gym_workout", title: "Gym or early workout", src: "/perfect morning-quiz/Gym or early workout.jpg" },
                { key: "outdoor_walk", title: "Outdoor walk / dog", src: "/perfect morning-quiz/Outdoor walk : dog.jpg" },
                { key: "quiet_coffee", title: "Quiet coffee alone", src: "/perfect morning-quiz/Quiet coffee alone.jpg" },
                { key: "family_chaos", title: "Family chaos morning", src: "/perfect morning-quiz/Family chaos morning.jpg" }
              ]}
              selectedKey={morningChoice}
              onSelect={(k) => setMorningChoice(k)}
            />
          )}
          {!showIntro && current === 1 && (
            <TagQuestion
              questionId="daily_values"
              title="What matters most in your daily life?"
              tip="Tip: Pick 3–5 values that genuinely guide your everyday decisions"
              tags={[
                "Comfort","Ease","Harmony","Warmth","Security","Safety","Protection","Stability","Balance","Peace of mind",
                "Efficiency","Clarity","Momentum","Focus","Productivity","Flow","Organization","Structure","Simplicity","Minimalism",
                "Performance","Power","Responsiveness","Precision","Agility","Control","Intensity","Energy","Speed",
                "Adventure","Spontaneity","Exploration","Freedom","Discovery","Boldness","Nature","Challenge","Movement",
                "Practicality","Functionality","Reliability","Durability","Consistency","Routine","Everyday ease","Versatility",
                "Status","Elegance","Presence","Sophistication","Confidence","Refinement","Aesthetics","Style",
                "Innovation","Technology","Progress","Sustainability","Curiosity","Future-forward thinking","Modernity","Efficiency through tech"
              ]}
              selected={dailyTags}
              onChange={setDailyTags}
              minSelect={3}
              maxSelect={5}
            />
          )}
          {!showIntro && current === 2 && (
            <ChoiceQuestion
              questionId="purchase_approach"
              title="How Do You Approach Big Purchases?"
              tip="Tip: Think of your real habits"
              options={[
                "Value & low long-term cost",
                "Balanced price/features",
                "Pay more for quality",
                "Emotional purchases",
                "Research deeply",
              ]}
              selectedIndex={purchaseChoice}
              onSelect={setPurchaseChoice}
            />
          )}
        </div>
      </div>
      <div className={formStyles.floatingBar}>
        <div className={formStyles.barInner}>
          <button
            className={formStyles.next}
            onClick={() => {
              if (showIntro) { setShowIntro(false); return; }
              if (current === 0) { if (!morningChoice) { return; } setCurrent(1); return; }
              if (current === 1) { if (dailyTags.length < 3 || dailyTags.length > 5) { return; } setCurrent(2); return; }
              if (current === 2) { if (purchaseChoice === null) { return; } setCurrent(3); return; }
              setCurrent(v => Math.min(total, v + 1));
            }}
            disabled={showIntro ? false : (
              current === 0 ? !morningChoice :
              current === 1 ? (dailyTags.length < 3 || dailyTags.length > 5) :
              current === 2 ? purchaseChoice === null :
              false
            )}
          >
            Next
          </button>
        </div>
      </div>
        
    </div>
  );
}
