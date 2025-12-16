"use client";
import { useEffect, useState } from "react";
import QuizProgress from "../../components/QuizProgress";
import formStyles from "../../components/QuizForm.module.css";
import { PhotoQuestion, TagQuestion, ChoiceQuestion, SliderQuestion, MultiChoiceQuestion, IconChoiceQuestion, PhotoQuadQuestion } from "../../components/quiz";

export default function Page() {
  const stepIds = [
    "perfect_morning",
    "bad_weather_focus",
    "unexpected_changes",
    "noise_level",
    "freedom_feel",
    "parking_location",
    "home_feel",
    "manage_risks",
    "purchase_approach",
    "car_cargo_preference",
    "maintenance_involvement",
    "people_descriptors",
    "hard_week_treat",
    "decision_style",
    "driving_position_preference",
    "car_expenses_preference",
    "drains_energy",
    "interior_feel",
    "interior_space_relation",
    "technology_relationship",
    "control_preference",
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
  const [unexpectedSel, setUnexpectedSel] = useState<number[]>([]);
  const [freedomPhoto, setFreedomPhoto] = useState<string | null>(null);
  const [purchaseChoice, setPurchaseChoice] = useState<number | null>(null);
  const [maintenanceInvolvement, setMaintenanceInvolvement] = useState<number | null>(null);
  const [weekendPhoto, setWeekendPhoto] = useState<string | null>(null);
  const [homePhoto, setHomePhoto] = useState<string | null>(null);
  const [descriptorTags, setDescriptorTags] = useState<string[]>([]);
  const [drainsSel, setDrainsSel] = useState<number[]>([]);
  const [hardWeekSel, setHardWeekSel] = useState<number[]>([]);
  const [expensesPref, setExpensesPref] = useState<number | null>(null);
  const [interiorChoice, setInteriorChoice] = useState<number | null>(null);
  const [spaceRelationChoice, setSpaceRelationChoice] = useState<number | null>(null);
  const [techTags, setTechTags] = useState<string[]>([]);
  const [controlPrefChoice, setControlPrefChoice] = useState<number | null>(null);
  const [emotionChoice, setEmotionChoice] = useState<number | null>(null);
  const [patienceLevel, setPatienceLevel] = useState<number | null>(null);
  const [ownershipDuration, setOwnershipDuration] = useState<number | null>(null);
  const [sizeScaleIndex, setSizeScaleIndex] = useState<number | null>(null);
  const [drivingPositionChoice, setDrivingPositionChoice] = useState<number | null>(null);
  const [noiseLevelChoice, setNoiseLevelChoice] = useState<number | null>(null);
  const [riskChoice, setRiskChoice] = useState<number | null>(null);
  const [decisionStyleSel, setDecisionStyleSel] = useState<number[]>([]);
  const [badWeatherFocus, setBadWeatherFocus] = useState<number | null>(null);
  const [cargoChoice, setCargoChoice] = useState<string | null>(null);
  const [parkingChoice, setParkingChoice] = useState<number | null>(null);

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
              title="Which morning feels most like your real life?"
              tip="Which morning do you usually wake up to — pick what feels real"
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
              questionId="bad_weather_focus"
              title="Imagine the weather suddenly turns bad while you need to drive. What do you focus on first?"
              options={[
                "I choose the simplest, safest way to get where I need to go",
                "I rely on the car to stay stable and predictable in all conditions",
                "I enjoy having full control and adapting my driving to the situation",
              ]}
              selectedIndex={badWeatherFocus}
              onSelect={setBadWeatherFocus}
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
                "Keep going without pausing",
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
              title="Who Will Regularly Ride in This Car With You?"
              tip="Think about who is actually in the car most weeks — not occasionally."
              options={[
                { key: "mostly_me", title: "Mostly just me", src: "/passengers/Mostly just me.jpg" },
                { key: "one_partner", title: "One partner", src: "/passengers/_One partner.jpg" },
                { key: "children_car_seats_school_runs", title: "Children", src: "/passengers/car seats.jpg" },
                { key: "dog_or_pets", title: "Pets", src: "/passengers/dog.jpg" },
                { key: "friends_passengers_often", title: "Friends", src: "/passengers/passengers.jpg" },
                { key: "work_crew_clients", title: "Work crew", src: "/passengers/client.jpg" },
              ]}
              selectedKey={freedomPhoto}
              onSelect={(k) => setFreedomPhoto(k)}
            />
          )}
          {!showIntro && current === 5 && (
            <PhotoQuadQuestion
              questionId="parking_location"
              title="Where Do You Usually Park Your Car?"
              tip="Think about your most common parking situation."
              options={[
                "Street parking",
                "Garage at home",
                "Shared parking",
                "Various locations",
              ]}
              selectedIndex={parkingChoice}
              onSelect={setParkingChoice}
              imageBasePath="/croped pictures"
              isMobile={isMobile}
            />
          )}
          {!showIntro && current === 6 && (
            <PhotoQuestion
              questionId="home_feel"
              title="What Does Your Ideal Home Feel Like?"
              tip="Your car often reflects the same values as your home."
              options={[
                { key: "modern_minimalist", title: "Modern & Minimalist", src: "/home/Minimalist.jpg" },
                { key: "cozy_traditional", title: "Cozy & Traditional", src: "/home/cozy family home.jpg" },
                { key: "industrial_open", title: "Industrial & Open", src: "/home/_Urban apartment.jpg" },
                { key: "luxurious_detailed", title: "Luxurious & Detailed", src: "/home/Modern designer house.jpg" },
                { key: "eco_friendly_natural", title: "Eco-friendly & Natural", src: "/home/house near nature.jpg" },
                { key: "smart_tech_filled", title: "Smart & Tech-filled", src: "/home/Suburban house with driveway, garage, and practical layout .jpg" },
              ]}
              selectedKey={homePhoto}
              onSelect={(k) => setHomePhoto(k)}
            />
          )}
          {!showIntro && current === 7 && (
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
          {!showIntro && current === 8 && (
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
          {!showIntro && current === 9 && (
            <PhotoQuestion
              questionId="car_cargo_preference"
              title="What Will This Car Most Often Carry?"
              tip="Choose what realistically ends up inside the car, week after week."
              options={[
                { key: "groceries", title: "Groceries", src: "/stuff/car daily errands.jpg" },
                { key: "sports_gear", title: "Sports gear", src: "/stuff/bike.jpg" },
                { key: "large_items", title: "Oversized items", src: "/stuff/Things that don’t fit in most cars.jpg" },
                { key: "luggage", title: "Luggage for trips", src: "/stuff/_Luggage.jpg" },
                { key: "kids_stuff", title: "Kids’ stuff", src: "/stuff/Stroller.jpg" },
                { key: "work_equipment", title: "Work equipment", src: "/stuff/tools.jpg" },
              ]}
              selectedKey={cargoChoice}
              onSelect={(k) => setCargoChoice(k)}
            />
          )}
          {!showIntro && current === 10 && (
            <SliderQuestion
              questionId="maintenance_involvement"
              title="How Involved Do You Want to Be in Car Maintenance?"
              tip="Think about servicing, repairs, and ongoing care."
              min={0}
              max={100}
              step={1}
              value={maintenanceInvolvement}
              onChange={setMaintenanceInvolvement}
              labels={[
                "I want minimal involvement",
                "I’m okay with routine care",
                "I like to stay fully involved",
              ]}
            />
          )}
          {!showIntro && current === 11 && (
            <TagQuestion
              questionId="people_descriptors"
              title="People close to you would describe you as…"
              tip="Select up to 3 that truly reflect how others see you"
              tags={[
                "Responsive", "Urban-minded", "Risk-averse", "Taste-driven", "Efficient",
                "Adaptable", "Comfort-seeking", "Future-focused", "Self-sufficient", "Time-sensitive",
                "Attentive", "Load-capable", "Driven", "Routine-loving", "Cost-aware",
                "Outdoorsy", "System-oriented", "Status-conscious", "Resilient", "Cautious",
                "Image-aware", "Low-maintenance", "Space-aware", "Decisive", "Curious",
                "Travel-oriented", "Endurance-focused", "Long-term thinker", "Relaxed", "Organized",
              ]}
              selected={descriptorTags}
              onChange={setDescriptorTags}
              minSelect={1}
              maxSelect={3}
            />
          )}
          {!showIntro && current === 12 && (
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
          {!showIntro && current === 13 && (
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
          {!showIntro && current === 14 && (
            <IconChoiceQuestion
              questionId="driving_position_preference"
              title="What Driving Position Feels Right to You?"
              tip="Choose the position that makes you feel most at ease and in control."
              options={[
                { key: "high_commanding", title: "High & commanding", desc: "I like seeing over traffic and feeling in control", icon: "/commanding view icons/important.svg" },
                { key: "balanced_flexible", title: "Balanced & flexible", desc: "I’m comfortable either way, depending on the situation", icon: "/commanding view icons/helpful.svg" },
                { key: "low_connected", title: "Low & connected", desc: "I prefer feeling close to the road and the car", icon: "/commanding view icons/not-important.svg" },
                { key: "context_driven", title: "Context-driven", desc: "It depends on the drive, mood, and surroundings", icon: "/commanding view icons/depends.svg" },
              ]}
              selectedIndex={drivingPositionChoice}
              onSelect={setDrivingPositionChoice}
            />
          )}
          {!showIntro && current === 15 && (
            <ChoiceQuestion
              questionId="car_expenses_preference"
              title="How Do You Prefer to Handle Car Expenses?"
              tip="Think about fuel, maintenance, insurance, and unexpected costs."
              options={[
                "Keep costs as low as possible",
                "Balanced spending for comfort and reliability",
                "Pay more if it improves quality and experience",
                "Costs don’t worry me if the car fits my needs",
                "I plan expenses carefully long-term",
                "I’m fine with higher costs for performance or tech",
              ]}
              selectedIndex={expensesPref}
              onSelect={setExpensesPref}
            />
          )}
          {!showIntro && current === 16 && (
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
          {!showIntro && current === 17 && (
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
          {!showIntro && current === 18 && (
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
          {!showIntro && current === 19 && (
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
                "Enjoy privacy",
              ]}
              selected={techTags}
              onChange={setTechTags}
              minSelect={2}
              maxSelect={5}
            />
          )}
          {!showIntro && current === 20 && (
            <IconChoiceQuestion
              questionId="control_preference"
              title="How Much Control Do You Want While Driving?"
              tip="Imagine the car reacting under your hands — what level feels right?"
              options={[
                { key: "prefer_automation", title: "Prefer Automation", desc: "Let the car handle the driving while you focus on other things", icon: "/control icons/radar.svg" },
                { key: "balanced_assist", title: "Balanced Assist", desc: "I want safety features but I still want to drive", icon: "/control icons/shared-responsibility.svg" },
                { key: "full_control", title: "Full Driver Control", desc: "I want to feel everything the car is doing without interference", icon: "/control icons/full-mechanical-feedback.svg" },
              ]}
              selectedIndex={controlPrefChoice}
              onSelect={setControlPrefChoice}
            />
          )}
          {!showIntro && current === 21 && (
            <IconChoiceQuestion
              questionId="emotional_expectation"
              title="What One Feeling Do You Want Your Car to Give You?"
              tip="When you walk up to it and get in — what’s the dominant emotion?"
              options={[
                { key: "security_safety", title: "Security & Safety", desc: "I want to feel protected and shielded from the world", icon: "/commanding view icons/important.svg" },
                { key: "freedom_possibility", title: "Freedom & Possibility", desc: "I want to feel like I can go anywhere at any time", icon: "/commanding view icons/helpful.svg" },
                { key: "status_achievement", title: "Status & Achievement", desc: "I want to feel proud of what I’ve earned and show it", icon: "/commanding view icons/not-important.svg" },
                { key: "joy_excitement", title: "Joy & Excitement", desc: "I want to smile every time I start the engine", icon: "/commanding view icons/depends.svg" },
              ]}
              selectedIndex={emotionChoice}
              onSelect={setEmotionChoice}
            />
          )}
          {!showIntro && current === 22 && (
            <ChoiceQuestion
              questionId="patience_level"
              title="How Patient Are You in Traffic?"
              tip="Be honest — how do you really react when things slow down?"
              options={[
                "I get frustrated easily and want to move",
                "I stay calm and listen to music or podcasts",
                "I use the time to think or make calls",
                "I find alternate routes immediately",
              ]}
              selectedIndex={patienceLevel}
              onSelect={setPatienceLevel}
            />
          )}
          {!showIntro && current === 23 && (
            <PhotoQuestion
              questionId="ideal_weekend"
              title="It’s a Free Weekend — Where Are You Headed?"
              tip="Pick the scene that makes you feel most like yourself."
              options={[
                { key: "city_nightlife", title: "City Nightlife", src: "/weekend/City nightlife.jpg" },
                { key: "road_trip", title: "Road Trip", src: "/weekend/Road trip.jpg" },
                { key: "outdoors_hiking", title: "Outdoors / Hiking", src: "/weekend/Outdoors _ hiking.jpg" },
                { key: "relaxing_home", title: "Relaxing at Home", src: "/weekend/Relaxing at home.jpg" },
                { key: "family_trip", title: "Family Trip", src: "/weekend/Family trip.jpg" },
                { key: "active_gym", title: "Gym / Active Day", src: "/weekend/Gym _ active day.jpg" },
              ]}
              selectedKey={weekendPhoto}
              onSelect={(k) => setWeekendPhoto(k)}
            />
          )}
          {!showIntro && current === 24 && (
            <ChoiceQuestion
              questionId="ownership_duration"
              title="How Long Do You Usually Keep a Car?"
              tip="Think about your past history, not your intentions."
              options={[
                "I drive them until they stop running (10+ years)",
                "I keep them for a good run (5-7 years)",
                "I switch every few years (3-4 years)",
                "I lease or change often (1-2 years)",
                "I change frequently whenever something new excites me",
              ]}
              selectedIndex={ownershipDuration}
              onSelect={setOwnershipDuration}
            />
          )}
          {!showIntro && current === 25 && (
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
        </div>
      </div>
      <div className={formStyles.floatingBar}>
        <div className={formStyles.barInner}>
          <button
            className={formStyles.next}
            onClick={() => {
              if (showIntro) { setShowIntro(false); return; }
              if (current === 0) { if (!morningChoice) { return; } setCurrent(1); return; }
              if (current === 1) { if (badWeatherFocus === null) { return; } setCurrent(2); return; }
              if (current === 2) { if (unexpectedSel.length < 1) { return; } setCurrent(3); return; }
              if (current === 3) { if (noiseLevelChoice === null) { return; } setCurrent(4); return; }
              if (current === 4) { if (!freedomPhoto) { return; } setCurrent(5); return; }
              if (current === 5) { if (parkingChoice === null) { return; } setCurrent(6); return; }
              if (current === 6) { if (!homePhoto) { return; } setCurrent(7); return; }
              if (current === 7) { if (riskChoice === null) { return; } setCurrent(8); return; }
              if (current === 8) { if (purchaseChoice === null) { return; } setCurrent(9); return; }
              if (current === 9) { if (!cargoChoice) { return; } setCurrent(10); return; }
              if (current === 10) { if (maintenanceInvolvement === null) { return; } setCurrent(11); return; }
              if (current === 11) { if (descriptorTags.length < 1 || descriptorTags.length > 3) { return; } setCurrent(12); return; }
              if (current === 12) { if (hardWeekSel.length < 1) { return; } setCurrent(13); return; }
              if (current === 13) { if (decisionStyleSel.length < 1) { return; } setCurrent(14); return; }
              if (current === 14) { if (drivingPositionChoice === null) { return; } setCurrent(15); return; }
              if (current === 15) { if (expensesPref === null) { return; } setCurrent(16); return; }
              if (current === 16) { if (drainsSel.length < 1) { return; } setCurrent(17); return; }
              if (current === 17) { if (interiorChoice === null) { return; } setCurrent(18); return; }
              if (current === 18) { if (spaceRelationChoice === null) { return; } setCurrent(19); return; }
              if (current === 19) { if (techTags.length < 2 || techTags.length > 5) { return; } setCurrent(20); return; }
              if (current === 20) { if (controlPrefChoice === null) { return; } setCurrent(21); return; }
              if (current === 21) { if (emotionChoice === null) { return; } setCurrent(22); return; }
              if (current === 22) { if (patienceLevel === null) { return; } setCurrent(23); return; }
              if (current === 23) { if (!weekendPhoto) { return; } setCurrent(24); return; }
              if (current === 24) { if (ownershipDuration === null) { return; } setCurrent(25); return; }
              if (current === 25) { if (sizeScaleIndex === null) { return; } return; } // Last step
              if (current >= total - 1) { return; }
              setCurrent(v => Math.min(total - 1, v + 1));
            }}
            disabled={showIntro ? false : (
              current === 0 ? !morningChoice :
              current === 1 ? badWeatherFocus === null :
              current === 2 ? unexpectedSel.length < 1 :
              current === 3 ? noiseLevelChoice === null :
              current === 4 ? !freedomPhoto :
              current === 5 ? parkingChoice === null :
              current === 6 ? !homePhoto :
              current === 7 ? riskChoice === null :
              current === 8 ? purchaseChoice === null :
              current === 9 ? !cargoChoice :
              current === 10 ? maintenanceInvolvement === null :
              current === 11 ? (descriptorTags.length < 1 || descriptorTags.length > 3) :
              current === 12 ? hardWeekSel.length < 1 :
              current === 13 ? decisionStyleSel.length < 1 :
              current === 14 ? drivingPositionChoice === null :
              current === 15 ? expensesPref === null :
              current === 16 ? drainsSel.length < 1 :
              current === 17 ? interiorChoice === null :
              current === 18 ? spaceRelationChoice === null :
              current === 19 ? (techTags.length < 2 || techTags.length > 5) :
              current === 20 ? controlPrefChoice === null :
              current === 21 ? emotionChoice === null :
              current === 22 ? patienceLevel === null :
              current === 23 ? !weekendPhoto :
              current === 24 ? ownershipDuration === null :
              current === 25 ? sizeScaleIndex === null :
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
