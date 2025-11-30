"use client";
import { useEffect, useState } from "react";
import QuizProgress from "../../components/QuizProgress";
import formStyles from "../../components/QuizForm.module.css";
import { PhotoQuestion, TagQuestion, ChoiceQuestion, SliderQuestion, SizeScaleQuestion } from "../../components/quiz";
 
export default function Page() {
  const stepIds = [
    "perfect_morning",
    "daily_values",
    "purchase_approach",
    "technology_comfort",
    "people_descriptors",
    "energy_vibe",
    "interior_feel",
    "emotional_expectation",
    "patience_level",
    "ideal_weekend",
    "ownership_duration",
    "car_size_scale"
  ];
  const total = stepIds.length;
  const [current, setCurrent] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [morningChoice, setMorningChoice] = useState<string | null>(null);
  const [dailyTags, setDailyTags] = useState<string[]>([]);
  const [purchaseChoice, setPurchaseChoice] = useState<number | null>(null);
  const [techComfort, setTechComfort] = useState<number | null>(null);
  const [weekendPhoto, setWeekendPhoto] = useState<string | null>(null);
  const [descriptorTags, setDescriptorTags] = useState<string[]>([]);
  const [energyChoice, setEnergyChoice] = useState<number | null>(null);
  const [interiorChoice, setInteriorChoice] = useState<number | null>(null);
  const [emotionChoice, setEmotionChoice] = useState<number | null>(null);
  const [patienceLevel, setPatienceLevel] = useState<number | null>(null);
  const [ownershipDuration, setOwnershipDuration] = useState<number | null>(null);
  const [sizeScaleIndex, setSizeScaleIndex] = useState<number | null>(null);
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
              title="Your perfect morning"
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
              title="How do you approach big purchases?"
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
          {!showIntro && current === 3 && (
            <SliderQuestion
              questionId="technology_comfort"
              title="Your Technology Comfort Level"
              tip="Tip: Slide to what matches your natural preference"
              min={0}
              max={100}
              step={1}
              value={techComfort}
              onChange={setTechComfort}
            />
          )}
          {!showIntro && current === 4 && (
            <TagQuestion
              questionId="people_descriptors"
              title="People close to you would describe you as…"
              tip="Tip: Select up to 3 that truly reflect how others see you"
              tags={[
                "Practical","Grounded","Down-to-earth","Reliable","Stable","Consistent","Organized","Structured","Responsible","Thoughtful",
                "Ambitious","Driven","Focused","Goal-oriented","Competitive","High-achieving","Confident","Assertive","Determined",
                "Adventurous","Spontaneous","Curious","Explorer","Bold","Risk-taking","Open-minded","Dynamic",
                "Creative","Imaginative","Innovative","Unconventional","Expressive","Visionary","Artistic","Inventive",
                "Minimalistic","Simple","Calm","Low-maintenance","Uncomplicated","Effortless","Streamlined","Pure",
                "Energetic","Lively","Active","Vibrant","Passionate","High-tempo","Enthusiastic","Motivated",
                "Detail-oriented","Analytical","Precise","Methodical","Logical","Careful","Accurate",
                "Warm","Friendly","Empathetic","Supportive","Patient","Family-minded",
                "Polished","Sophisticated","Refined","Stylish","Professional","Composed",
                "Hands-on","Capable","Resilient","Resourceful","Pragmatic","Prepared"
              ]}
              selected={descriptorTags}
              onChange={setDescriptorTags}
              minSelect={1}
              maxSelect={3}
            />
          )}
          {!showIntro && current === 5 && (
            <ChoiceQuestion
              questionId="energy_vibe"
              title="Which energy feels most like you?"
              tip="Tip: Choose the emotional vibe that matches you"
              options={[
                "Calm",
                "Bold",
                "Playful",
                "Focused",
                "Adventurous",
                "Minimalist",
              ]}
              selectedIndex={energyChoice}
              onSelect={setEnergyChoice}
            />
          )}
          {!showIntro && current === 6 && (
            <ChoiceQuestion
              questionId="interior_feel"
              title="How should your car feel inside?"
              tip="Tip: Imagine the interior you’d want to spend hours in — not just minutes. Choose the atmosphere that feels like a place you could genuinely live your life in, not just pass through"
              options={[
                "A clean, calming environment with uncluttered design and soft silence — a space that helps you breathe and think clearly.",
                "A tight, energetic cabin that sharpens your senses and puts you in command of every moment on the road.",
                "A smooth, elegant interior with premium textures, warm lighting, and details that feel intentionally crafted.",
                "A warm, intuitive space designed for comfort, connection, and the realities of everyday life.",
                "A modern, innovative cockpit filled with smart features, intuitive screens, and a sense of effortless progress.",
                "A strong, practical environment built to handle gear, weather, and daily tasks without hesitation.",
               
              ]}
              selectedIndex={interiorChoice}
              onSelect={setInteriorChoice}
            />
          )}
          {!showIntro && current === 7 && (
            <ChoiceQuestion
              questionId="emotional_expectation"
              title="What do you expect emotionally from a car?"
              tip="Think about the feeling you want every time you sit behind the wheel — choose the emotion that truly matters most to you."
              options={[
                "Stability & safety you can rely on",
                "Excitement & thrill that bring you alive",
                "Comfort & ease in every moment",
                "Confidence & status you instantly feel",
                "Simplicity & low-stress ownership",
                "Innovation & forward-thinking design",
              ]}
              selectedIndex={emotionChoice}
              onSelect={setEmotionChoice}
            />
          )}
          {!showIntro && current === 8 && (
            <SliderQuestion
              questionId="patience_level"
              title="How patient are you with everyday tasks?"
              tip="Don’t analyze it — slide toward the pace that feels natural to you in your day-to-day life."
              min={0}
              max={100}
              step={1}
              value={patienceLevel}
              onChange={setPatienceLevel}
              labels={[
                "0: I want everything fast",
                "50: I keep a balanced pace",
                "100: I take my time and move steadily",
              ]}
            />
          )}
          {!showIntro && current === 9 && (
            <PhotoQuestion
              questionId="ideal_weekend"
              title="Your ideal weekend"
              tip="Tip: Choose what you really do"
              options={[
                { key: "family_trip", title: "Family trip", src: "/weekend/Family trip.jpg" },
                { key: "outdoors_hiking", title: "Outdoors / hiking", src: "/weekend/Outdoors _ hiking.jpg" },
                { key: "city_nightlife", title: "City nightlife", src: "/weekend/City nightlife.jpg" },
                { key: "relaxing_home", title: "Relaxing at home", src: "/weekend/Relaxing at home.jpg" },
                { key: "road_trip", title: "Road trip", src: "/weekend/Road trip.jpg" },
                { key: "gym_active_day", title: "Gym / active day", src: "/weekend/Gym _ active day.jpg" },
              ]}
              selectedKey={weekendPhoto}
              onSelect={(k) => setWeekendPhoto(k)}
            />
          )}
          {!showIntro && current === 10 && (
            <ChoiceQuestion
              questionId="ownership_duration"
              title="How long do you usually keep a car?"
              tip="Think about your real habits, not your ideal ones — choose the option that reflects how you’ve actually owned cars in the past"
              options={[
                "Until it truly reaches the end",
                "Around 6–8 years before upgrading",
                "Typically 3–5 years, depending on the model",
                "Only 1–2 years — I like to switch often",
                "I change frequently whenever something new excites me",
              ]}
              selectedIndex={ownershipDuration}
              onSelect={setOwnershipDuration}
            />
          )}
          {!showIntro && current === 11 && (
            <SizeScaleQuestion
              questionId="car_size_scale"
              title="What size feels most natural for your next car?"
              tip="Don’t think about what you “should” drive — picture the size that feels effortless for your lifestyle, your roads, and your daily rhythm."
              value={sizeScaleIndex}
              onChange={setSizeScaleIndex}
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
              if (current === 3) { if (techComfort === null) { return; } setCurrent(4); return; }
              if (current === 4) { if (descriptorTags.length < 1 || descriptorTags.length > 3) { return; } setCurrent(5); return; }
              if (current === 5) { if (energyChoice === null) { return; } setCurrent(6); return; }
              if (current === 6) { if (interiorChoice === null) { return; } setCurrent(7); return; }
              if (current === 7) { if (emotionChoice === null) { return; } setCurrent(8); return; }
              if (current === 8) { if (patienceLevel === null) { return; } setCurrent(9); return; }
              if (current >= total - 1) { return; }
              setCurrent(v => Math.min(total - 1, v + 1));
            }}
            disabled={showIntro ? false : (
              current === 0 ? !morningChoice :
              current === 1 ? (dailyTags.length < 3 || dailyTags.length > 5) :
              current === 2 ? purchaseChoice === null :
              current === 3 ? techComfort === null :
              current === 4 ? (descriptorTags.length < 1 || descriptorTags.length > 3) :
              current === 5 ? energyChoice === null :
              current === 6 ? interiorChoice === null :
              current === 7 ? emotionChoice === null :
              current === 8 ? patienceLevel === null :
              current === 9 ? !weekendPhoto :
              current === 10 ? ownershipDuration === null :
              current === 11 ? sizeScaleIndex === null :
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
