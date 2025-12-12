"use client";
import { useEffect, useState } from "react";
import QuizProgress from "../../components/QuizProgress";
import formStyles from "../../components/QuizForm.module.css";
import { PhotoQuestion, TagQuestion, ChoiceQuestion, SliderQuestion, MultiChoiceQuestion, IconChoiceQuestion, PhotoQuadQuestion } from "../../components/quiz";
 
export default function Page() {
  const stepIds = [
    "perfect_morning",
    "new_project_reaction",
    "unexpected_changes",
    "noise_level",
    "freedom_feel",
    "manage_risks",
    "purchase_approach",
    "ideal_pace_of_life",
    "people_descriptors",
    "decision_style",
    "drains_energy",
    "hard_week_treat",
    "energy_vibe",
    "interior_feel",
    "interior_space_relation",
    "technology_relationship",
    "control_preference",
    "emotional_expectation",
    "patience_level",
    "ideal_weekend",
    "home_feel",
    "ownership_duration",
    "car_size_scale",
    "driving_height_preference"
  ];
  const total = stepIds.length;
  const [current, setCurrent] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [morningChoice, setMorningChoice] = useState<string | null>(null);
  const [dailyTags, setDailyTags] = useState<string[]>([]);
  const [unexpectedSel, setUnexpectedSel] = useState<number[]>([]);
  const [freedomPhoto, setFreedomPhoto] = useState<string | null>(null);
  const [purchaseChoice, setPurchaseChoice] = useState<number | null>(null);
  const [idealPace, setIdealPace] = useState<number | null>(null);
  const [weekendPhoto, setWeekendPhoto] = useState<string | null>(null);
  const [homePhoto, setHomePhoto] = useState<string | null>(null);
  const [descriptorTags, setDescriptorTags] = useState<string[]>([]);
  const [drainsSel, setDrainsSel] = useState<number[]>([]);
  const [hardWeekSel, setHardWeekSel] = useState<number[]>([]);
  const [energyChoice, setEnergyChoice] = useState<number | null>(null);
  const [interiorChoice, setInteriorChoice] = useState<number | null>(null);
  const [spaceRelationChoice, setSpaceRelationChoice] = useState<number | null>(null);
  const [techTags, setTechTags] = useState<string[]>([]);
  const [controlPrefChoice, setControlPrefChoice] = useState<number | null>(null);
  const [emotionChoice, setEmotionChoice] = useState<number | null>(null);
  const [patienceLevel, setPatienceLevel] = useState<number | null>(null);
  const [ownershipDuration, setOwnershipDuration] = useState<number | null>(null);
  const [sizeScaleIndex, setSizeScaleIndex] = useState<number | null>(null);
  const [drivingHeightChoice, setDrivingHeightChoice] = useState<number | null>(null);
  const [noiseLevelChoice, setNoiseLevelChoice] = useState<number | null>(null);
  const [riskChoice, setRiskChoice] = useState<number | null>(null);
  const [decisionStyleSel, setDecisionStyleSel] = useState<number[]>([]);
  const [newProjectReaction, setNewProjectReaction] = useState<number | null>(null);
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
      paddingTop: isMobile ? "calc(clamp(72px, 12vw, 140px) + 16px)" : "clamp(72px, 12vw, 140px)",
      paddingBottom: "calc(100px + env(safe-area-inset-bottom, 0px))",
      minHeight: "100vh",
      overflow: "hidden",
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
              tip="Choose what feels closest to your real life"
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
            <ChoiceQuestion
              questionId="new_project_reaction"
              title="Imagine you join a new project at work. There are many tools, workflows, rules, and decisions to make from day one. What is your natural reaction?"
              options={[
                "I strip things down and focus only on what’s strictly necessary",
                "I learn the key processes that help me work smoothly and reliably",
                "I dive deep into the system and enjoy mastering its full complexity",
              ]}
              selectedIndex={newProjectReaction}
              onSelect={setNewProjectReaction}
            />
          )}
          {!showIntro && current === 2 && (
            <MultiChoiceQuestion
              questionId="unexpected_changes"
              title="How do you handle unexpected changes?"
              tip="Choose what feels automatic — you can select one or more options"
              options={[
                "Adapt quickly and take charge",
                "Pause, analyze, create structure",
                "Stay calm and keep things steady",
                "Ask for support and coordinate together",
                "Feel energized by unpredictability",
              ]}
              selected={unexpectedSel}
              onChange={setUnexpectedSel}
              minSelect={1}
            />
          )}
          {!showIntro && current === 3 && (
            <IconChoiceQuestion
              questionId="noise_level"
              title="As You Drive, What Sound Feels Right to You?"
              tip="Focus on what relaxes or energizes you during drives."
              options={[
                { key: "near_silence", title: "Near-Silence", desc: "A serene cabin where you hear only whispers and refinement", icon: "/noise level icons/near-silence.svg" },
                { key: "natural_ambient", title: "Natural Ambient Sound", desc: "Balanced road noise that keeps you connected to the drive", icon: "/noise level icons/natural-ambient.svg" },
                { key: "engine_sound", title: "Engine Sound Energizes Me", desc: "The roar and rumble that makes every acceleration thrilling", icon: "/noise level icons/engine-sound.svg" },
              ]}
              selectedIndex={noiseLevelChoice}
              onSelect={setNoiseLevelChoice}
            />
          )}
          {!showIntro && current === 4 && (
            <PhotoQuestion
              questionId="freedom_feel"
              title="What Does “Freedom” Feel Like to You?"
              tip="Pick the image that gives you the strongest internal “yes.”"
              options={[
                { key: "open_highway", title: "Open highway", src: "/freedom/Open highway.jpg" },
                { key: "minimal_quiet_space", title: "Quiet space", src: "/freedom/Minimal, quiet space.jpg" },
                { key: "wild_nature_forest_trails", title: "Wild nature", src: "/freedom/forest trails.jpg" },
                { key: "futuristic_environments_clean_tech_architecture", title: "Futuristic environments", src: "/freedom/ tech architecture.jpg" },
                { key: "dense_energetic_city_at_night", title: "City at night", src: "/freedom/energetic city at night.jpg" },
                { key: "wide_open_desert_endless_horizon", title: "Endless horizon", src: "/freedom/open desert.jpg" },
              ]}
              selectedKey={freedomPhoto}
              onSelect={(k) => setFreedomPhoto(k)}
            />
          )}
          {!showIntro && current === 5 && (
            <ChoiceQuestion
              questionId="manage_risks"
              title="How Do You Manage Risks?"
              tip="Think about financial, emotional, and practical risks in real life."
              options={[
                "Avoid them when possible",
                "Prepare with research",
                "Take calculated risks",
                "Follow instinct in the moment",
                "Seek support or consensus",
              ]}
              selectedIndex={riskChoice}
              onSelect={setRiskChoice}
            />
          )}
          {!showIntro && current === 6 && (
            <ChoiceQuestion
              questionId="purchase_approach"
              title="How do you approach big purchases?"
              tip="Think of your real habits"
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
          {!showIntro && current === 7 && (
            <SliderQuestion
              questionId="ideal_pace_of_life"
              title="Imagine a Typical Day in Your Life. How Does It Usually Feel?"
              tip="Slide to how your life feels most of the time, not occasionally."
              min={0}
              max={100}
              step={1}
              value={idealPace}
              onChange={setIdealPace}
              labels={[
                "0: fast, decisive",
                "50: steady, intentional",
                "100: slow, spacious",
              ]}
            />
          )}
          {!showIntro && current === 8 && (
            <TagQuestion
              questionId="people_descriptors"
              title="People close to you would describe you as…"
              tip="Select up to 3 that truly reflect how others see you"
              tags={[
                "Practical","Grounded","Down-to-earth","Reliable","Stable","Consistent", "Structured","Responsible","Thoughtful",
                "Ambitious", "Focused","Goal-oriented","Competitive","High-achieving","Confident","Assertive","Determined",
                "Adventurous","Spontaneous","Curious","Explorer","Bold","Risk-taking","Open-minded","Dynamic",
                "Creative","Imaginative", "Unconventional","Expressive","Visionary","Artistic","Inventive",
                "Minimalistic","Simple","Calm", "Uncomplicated","Effortless","Streamlined","Pure",
                "Energetic","Lively","Active","Vibrant","Passionate","High-tempo","Enthusiastic","Motivated",
                "Analytical","Precise","Methodical","Logical","Careful","Accurate",
                "Friendly","Empathetic","Supportive","Patient","Family-minded",
                "Polished","Sophisticated","Refined","Stylish","Professional","Composed",
                "Hands-on","Capable","Resilient","Resourceful","Pragmatic",
              ]}
              selected={descriptorTags}
              onChange={setDescriptorTags}
              minSelect={1}
              maxSelect={3}
            />
          )}
          {!showIntro && current === 9 && (
            <MultiChoiceQuestion
              questionId="hard_week_treat"
              title="How Do You Treat Yourself After a Hard Week?"
              tip="Choose what you do regularly, not what you wish you did."
              options={[
                "Luxury meal or indulgence",
                "Long reflective drive",
                "Outdoor physical adventure",
                "Resting quietly at home",
                "Keeping things simple and low-cost",
              ]}
              selected={hardWeekSel}
              onChange={setHardWeekSel}
              minSelect={1}
            />
          )}
          {!showIntro && current === 10 && (
            <MultiChoiceQuestion
              questionId="decision_style"
              title="How Do You Usually Make Important Decisions?"
              tip="Think about your last three important decisions."
              options={[
                "I compare options, look at data, and choose what makes the most sense",
                "I trust my gut feeling and decide based on what feels right",
                "I focus on real-world usefulness and long-term value",
                "I consider how my choice affects others and shared comfort",
                "I choose what moves me forward and reflects my goals",
              ]}
              selected={decisionStyleSel}
              onChange={setDecisionStyleSel}
              minSelect={1}
            />
          )}
          {!showIntro && current === 11 && (
            <ChoiceQuestion
              questionId="energy_vibe"
              title="Which energy feels most like you?"
              tip="Choose the emotional vibe that matches you"
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
          {!showIntro && current === 12 && (
            <MultiChoiceQuestion
              questionId="drains_energy"
              title="What Drains Your Energy Most?"
              tip="Think about the last month — what tired you most consistently?"
              options={[
                "Noise, chaos, clutter",
                "Slowness or inefficiency",
                "Too many rules or overplanning",
                "Unexpected expenses",
                "Feeling stuck in one place",
              ]}
              selected={drainsSel}
              onChange={setDrainsSel}
              minSelect={1}
            />
          )}
          {!showIntro && current === 13 && (
            <ChoiceQuestion
              questionId="interior_feel"
              title="How should your car feel inside?"
              tip="Imagine the interior you’d want to spend hours in — not just minutes. Choose the atmosphere that feels like a place you could genuinely live your life in, not just pass through"
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
          {!showIntro && current === 14 && (
            <PhotoQuadQuestion
              questionId="interior_space_relation"
              title="Your Preferred Relationship With Space Inside a Car"
              tip="Consider your longest weekly drive — which space feels right?"
              options={[
                "Spacious",
                "Compact",
                "Flexible",
                "Cockpit-like",
              ]}
              selectedIndex={spaceRelationChoice}
              onSelect={setSpaceRelationChoice}
              imageBasePath="/croped pictures"
            />
          )}
          {!showIntro && current === 15 && (
            <TagQuestion
              questionId="technology_relationship"
              title="You Wake Up and Technology Is Everywhere Around You — How Do You React?"
              tip="Select the tags you actually live by, not the ones that sound ideal."
              tags={[
                "Love futuristic tools",
                "Early adopter",
                "Enjoy new tech",
                "Cutting-edge matters",
                "Tech should simplify life",
                "Automation helps me",
                "Hands-off automation",
                "Smart assistants help",
                "Data-driven decisions",
                "Tech should be invisible",
                "Ease of use first",
                "Prefer simple systems",
                "Minimal interfaces",
                "Avoid complexity",
                "Prefer manual control",
                "Human touch matters",
                "Upgrade often",
                "Always want the latest",
                "Tech boosts productivity",
                "Rely on digital tools",
                "Tech can overwhelm me",
                "Too many updates",
                "Value reliability",
                "Hate bugs",
                "Cost-conscious with tech",
                "Think long-term value",
                "Like personalization",
                "Enjoy customization",
              ]}
              selected={techTags}
              onChange={setTechTags}
              minSelect={2}
              maxSelect={5}
            />
          )}
          {!showIntro && current === 16 && (
            <IconChoiceQuestion
              questionId="control_preference"
              title="How Much Control Do You Want While Driving?"
              tip="Imagine the car reacting under your hands — what level feels right?"
              options={[
                { key: "prefer_automation", title: "Prefer Automation", desc: "Let the car handle the driving while you focus on other things", icon: "/control icons/radar.svg" },
                { key: "shared_responsibility", title: "Shared Responsibility", desc: "Balance between driver input and automated assistance", icon: "/control icons/shared-responsibility.svg" },
                { key: "full_mechanical_feedback", title: "Full Mechanical Feedback", desc: "Direct connection and complete control over every aspect", icon: "/control icons/full-mechanical-feedback.svg" },
              ]}
              selectedIndex={controlPrefChoice}
              onSelect={setControlPrefChoice}
            />
          )}
          {!showIntro && current === 17 && (
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
          {!showIntro && current === 18 && (
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
          {!showIntro && current === 19 && (
            <PhotoQuestion
              questionId="ideal_weekend"
              title="Your Weekend Is Finally Yours — What Do You Do First?"
              tip="Choose what you really do"
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
          {!showIntro && current === 20 && (
            <PhotoQuestion
              questionId="home_feel"
              title="What Kind of Home Feels Most Like You?"
              tip="Choose the home you instinctively imagine yourself living in — not the one you think you should choose."
              options={[
                { key: "modern_designer_house", title: "Modern designer house", src: "/home/Modern designer house.jpg" },
                { key: "near_nature_cabin_house", title: "House near nature", src: "/home/house near nature.jpg" },
                { key: "urban_apartment_lively_city", title: "City apartment", src: "/home/_Urban apartment.jpg" },
                { key: "cozy_family_home_warm_lighting", title: "Cozy family home", src: "/home/cozy family home.jpg" },
                { key: "minimal_uncluttered_home", title: "Uncluttered home", src: "/home/Minimalist.jpg" },
                { key: "suburban_house_practical_layout", title: "Practical living", src: "/home/Suburban house with driveway, garage, and practical layout .jpg" },
              ]}
              selectedKey={homePhoto}
              onSelect={(k) => setHomePhoto(k)}
            />
          )}
          {!showIntro && current === 21 && (
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
          {!showIntro && current === 22 && (
            <IconChoiceQuestion
              questionId="car_size_scale"
              title="What size feels most natural for your next car?"
              tip="Don’t think about what you “should” drive — picture the size that feels effortless for your lifestyle, your roads, and your daily rhythm."
              options={[
                { key: "small_agile", title: "Small & Agile", desc: "Easy to park, quick to move", icon: "/size-car icons/small.svg" },
                { key: "mid_size_balanced", title: "Mid-Size & Balanced", desc: "Spacious but not overwhelming", icon: "/size-car icons/mid-size.svg" },
                { key: "large_comfortable", title: "Large & Comfortable", desc: "Plenty of room for life", icon: "/size-car icons/large.svg" },
                { key: "oversized_powerful", title: "Oversized & Powerful", desc: "Presence you can feel", icon: "/size-car icons/oversized.svg" },
              ]}
              selectedIndex={sizeScaleIndex}
              onSelect={setSizeScaleIndex}
            />
          )}
          {!showIntro && current === 23 && (
            <PhotoQuadQuestion
              questionId="driving_height_preference"
              title="When You’re Driving, How High Do You Like to Sit?"
              tip="Think about what makes you feel confident behind the wheel."
              options={[
                "High view",
                "Nice to have",
                "Low position",
                "Depends",
              ]}
              selectedIndex={drivingHeightChoice}
              onSelect={setDrivingHeightChoice}
              imageBasePath="/croped pictures 2"
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
              if (current === 1) { if (newProjectReaction === null) { return; } setCurrent(2); return; }
              if (current === 2) { if (unexpectedSel.length < 1) { return; } setCurrent(3); return; }
              if (current === 3) { if (noiseLevelChoice === null) { return; } setCurrent(4); return; }
              if (current === 4) { if (!freedomPhoto) { return; } setCurrent(5); return; }
              if (current === 5) { if (riskChoice === null) { return; } setCurrent(6); return; }
              if (current === 6) { if (purchaseChoice === null) { return; } setCurrent(7); return; }
              if (current === 7) { if (idealPace === null) { return; } setCurrent(8); return; }
              if (current === 8) { if (descriptorTags.length < 1 || descriptorTags.length > 3) { return; } setCurrent(9); return; }
              if (current === 9) { if (hardWeekSel.length < 1) { return; } setCurrent(10); return; }
              if (current === 10) { if (decisionStyleSel.length < 1) { return; } setCurrent(11); return; }
              if (current === 11) { if (energyChoice === null) { return; } setCurrent(12); return; }
              if (current === 12) { if (drainsSel.length < 1) { return; } setCurrent(13); return; }
              if (current === 13) { if (interiorChoice === null) { return; } setCurrent(14); return; }
              if (current === 14) { if (spaceRelationChoice === null) { return; } setCurrent(15); return; }
              if (current === 15) { if (techTags.length < 2 || techTags.length > 5) { return; } setCurrent(16); return; }
              if (current === 16) { if (controlPrefChoice === null) { return; } setCurrent(17); return; }
              if (current === 17) { if (emotionChoice === null) { return; } setCurrent(18); return; }
              if (current === 18) { if (patienceLevel === null) { return; } setCurrent(19); return; }
              if (current >= total - 1) { return; }
              setCurrent(v => Math.min(total - 1, v + 1));
            }}
            disabled={showIntro ? false : (
              current === 0 ? !morningChoice :
              current === 1 ? newProjectReaction === null :
              current === 2 ? unexpectedSel.length < 1 :
              current === 3 ? noiseLevelChoice === null :
              current === 4 ? !freedomPhoto :
              current === 5 ? riskChoice === null :
              current === 6 ? purchaseChoice === null :
              current === 7 ? idealPace === null :
              current === 8 ? (descriptorTags.length < 1 || descriptorTags.length > 3) :
              current === 9 ? hardWeekSel.length < 1 :
              current === 10 ? decisionStyleSel.length < 1 :
              current === 11 ? energyChoice === null :
              current === 12 ? drainsSel.length < 1 :
              current === 13 ? interiorChoice === null :
              current === 14 ? spaceRelationChoice === null :
              current === 15 ? (techTags.length < 2 || techTags.length > 5) :
              current === 16 ? controlPrefChoice === null :
              current === 17 ? emotionChoice === null :
              current === 18 ? patienceLevel === null :
              current === 19 ? !weekendPhoto :
              current === 20 ? !homePhoto :
              current === 21 ? ownershipDuration === null :
              current === 22 ? sizeScaleIndex === null :
              current === 23 ? drivingHeightChoice === null :
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
