"use client";
import QuizProgress from "../../components/QuizProgress";
import { PhotoQuestion, ChoiceQuestion, SliderQuestion, MultiChoiceQuestion, IconChoiceQuestion, PhotoQuadQuestion, TableTagQuestion, MultiPhotoQuestion } from "../../components/quiz";
import { useQuiz } from "../../hooks/useQuiz";
import ExitModal from "../../components/quiz/modals/ExitModal";
import ResumeModal from "../../components/quiz/modals/ResumeModal";
import QuizControls from "../../components/quiz/QuizControls";
import QuizHeader from "../../components/quiz/QuizHeader";

export default function Page() {
  const quiz = useQuiz();

  return (
    <div style={{
      paddingLeft: "clamp(16px, 4vw, 32px)",
      paddingRight: "clamp(16px, 4vw, 32px)",
      paddingTop: quiz.isMobile ? "calc(clamp(72px, 12vw, 140px) + 16px)" : "clamp(72px, 12vw, 140px)",
      paddingBottom: "calc(100px + env(safe-area-inset-bottom, 0px))",
      minHeight: "100vh",
      overflow: "hidden",
    }}>

      <QuizHeader onExit={() => quiz.setShowExitModal(true)} />

      {quiz.showExitModal && (
        <ExitModal onCancel={() => quiz.setShowExitModal(false)} />
      )}

      {quiz.showResumeModal && (
        <ResumeModal 
            onResume={quiz.restoreProgress} 
            onStartFresh={quiz.handleStartFresh} 
        />
      )}

      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <QuizProgress 
            current={quiz.current} 
            total={quiz.total} 
            showIntro={quiz.showIntro} 
            showHalfway={quiz.showHalfway} 
            showFinal={quiz.showFinal} 
            introImageSrc="/before-you-begin.jpg" 
        />
        
        <div style={{ maxHeight: "min(70vh, 680px)", overflow: "auto", paddingRight: 4 }}>
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 0 && (
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
              selectedIndex={quiz.emotionChoice}
              onSelect={quiz.setEmotionChoice}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 1 && (
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
              selectedKey={quiz.morningChoice}
              onSelect={(k) => quiz.setMorningChoice(k)}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 2 && (
            <ChoiceQuestion
              questionId="bad_weather_focus"
              title="Imagine the weather suddenly turns bad while you need to drive. What do you focus on first?"
              options={[
                "I choose the simplest, safest way to get where I need to go",
                "I rely on the car to stay stable and predictable in all conditions",
                "I enjoy having full control and adapting my driving to the situation",
              ]}
              selectedIndex={quiz.badWeatherFocus}
              onSelect={quiz.setBadWeatherFocus}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 3 && (
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
              selected={quiz.unexpectedSel}
              onChange={quiz.setUnexpectedSel}
              minSelect={1}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 4 && (
            <IconChoiceQuestion
              questionId="noise_level"
              title="As You Drive, What Sound Feels Right to You?"
              tip="Focus on what relaxes or energizes you during drives."
              options={[
                { key: "near_silence", title: "Near-Silence", desc: "A serene cabin where you hear only whispers and refinement", icon: "/noise level icons/near-silence.svg" },
                { key: "natural_ambient", title: "Natural Ambient Sound", desc: "Balanced road noise that keeps you connected to the drive", icon: "/noise level icons/natural-ambient.svg" },
                { key: "engine_sound", title: "Engine Sound Energizes Me", desc: "The roar and rumble that makes every acceleration thrilling", icon: "/noise level icons/engine-sound.svg" },
              ]}
              selectedIndex={quiz.noiseLevelChoice}
              onSelect={quiz.setNoiseLevelChoice}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 5 && (
            <MultiPhotoQuestion
              questionId="freedom_feel"
              title="Who Will Regularly Ride in This Car With You?"
              tip="Think about who is actually in the car most weeks — not occasionally. You can select more than one option."
              options={[
                { key: "mostly_me", title: "Mostly just me", src: "/passengers/Mostly just me.jpg" },
                { key: "one_partner", title: "One partner", src: "/passengers/_One partner.jpg" },
                { key: "children_car_seats_school_runs", title: "Children", src: "/passengers/car seats.jpg" },
                { key: "dog_or_pets", title: "Pets", src: "/passengers/dog.jpg" },
                { key: "friends_passengers_often", title: "Friends", src: "/passengers/passengers.jpg" },
                { key: "work_crew_clients", title: "Work crew", src: "/passengers/client.jpg" },
              ]}
              selectedKeys={quiz.freedomPhotos}
              onChange={quiz.setFreedomPhotos}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 6 && (
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
              selectedIndex={quiz.parkingChoice}
              onSelect={quiz.setParkingChoice}
              imageBasePath="/croped pictures"
              isMobile={quiz.isMobile}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 7 && (
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
              selectedKey={quiz.homePhoto}
              onSelect={(k) => quiz.setHomePhoto(k)}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 8 && (
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
              selectedIndex={quiz.riskChoice}
              onSelect={quiz.setRiskChoice}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 9 && (
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
              selectedIndex={quiz.purchaseChoice}
              onSelect={quiz.setPurchaseChoice}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 10 && (
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
              selectedKey={quiz.cargoChoice}
              onSelect={(k) => quiz.setCargoChoice(k)}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 11 && (
            <SliderQuestion
              questionId="maintenance_involvement"
              title="How Involved Do You Want to Be in Car Maintenance?"
              tip="Think about servicing, repairs, and ongoing care."
              min={0}
              max={100}
              step={1}
              value={quiz.maintenanceInvolvement}
              onChange={quiz.setMaintenanceInvolvement}
              labels={[
                "I want minimal involvement",
                "I’m okay with routine care",
                "I like to stay fully involved",
              ]}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 12 && (
            <TableTagQuestion
              questionId="people_descriptors"
              title="People close to you would describe you as…"
              tip="Select up to 3 that truly reflect how others see you"
              tags={[
                "Responsive",
                "Urban-minded",
                "Taste-driven",
                "Efficient",
                "Adaptable",
                "Future-focused",
                "Self-sufficient",
                "Attentive",
                "Driven",
                "Routine-loving",
                "Cost-aware",
                "Outdoorsy",
                "Status-conscious",
                "Cautious",
                "Low-maintenance",
                "Decisive",
                "Curious",
                "Travel-oriented",
                "Relaxed",
                "Organized",
              ]}
              selected={quiz.descriptorTags}
              onChange={quiz.setDescriptorTags}
              minSelect={1}
              maxSelect={3}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 13 && (
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
              selected={quiz.hardWeekSel}
              onChange={quiz.setHardWeekSel}
              minSelect={1}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 14 && (
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
              selected={quiz.decisionStyleSel}
              onChange={quiz.setDecisionStyleSel}
              minSelect={1}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 15 && (
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
              selectedIndex={quiz.drivingPositionChoice}
              onSelect={quiz.setDrivingPositionChoice}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 16 && (
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
              selectedIndex={quiz.expensesPref}
              onSelect={quiz.setExpensesPref}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 17 && (
            <ChoiceQuestion
              questionId="fuel_importance"
              title="How Important Are Fuel Costs to You?"
              tip="Be honest about what you're comfortable spending monthly on fuel or charging."
              options={[
                "Not a concern — performance matters more",
                "I'd prefer efficiency, but it's not a dealbreaker",
                "Important — fuel costs should fit my budget",
                "Top priority — I want minimal fuel/energy costs",
              ]}
              selectedIndex={quiz.fuelImportance}
              onSelect={quiz.setFuelImportance}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 18 && (
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
              selectedIndex={quiz.interiorChoice}
              onSelect={quiz.setInteriorChoice}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 19 && (
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
              selectedIndex={quiz.spaceRelationChoice}
              onSelect={quiz.setSpaceRelationChoice}
              imageBasePath="/croped pictures 2"
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 20 && (
            <TableTagQuestion
              questionId="technology_relationship"
              title="You Wake Up and Technology Is Everywhere Around You — How Do You React?"
              tip="Select the tags you actually live by, not the ones that sound ideal."
              tags={[
                "Love futuristic tools",
                "Early adopter",
                "Cutting-edge matters",
                "Tech should simplify life",
                "Hands-off automation",
                "Smart assistants help",
                "Data-driven decisions",
                "Tech should be invisible",
                "Ease of use first",
                "Prefer simple systems",
                "Avoid complexity",
                "Prefer manual control",
                "Upgrade often",
                "Tech boosts productivity",
                "Tech can overwhelm me",
                "Value reliability",
                "Cost-conscious with tech",
                "Like personalization",
                "Enjoy privacy",
                "Human touch matters",
              ]}
              selected={quiz.techTags}
              onChange={quiz.setTechTags}
              minSelect={2}
              maxSelect={5}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 21 && (
            <IconChoiceQuestion
              questionId="control_preference"
              title="How Much Control Do You Want While Driving?"
              tip="Imagine the car reacting under your hands — what level feels right?"
              options={[
                { key: "prefer_automation", title: "Prefer Automation", desc: "Let the car handle the driving while you focus on other things", icon: "/control icons/radar.svg" },
                { key: "balanced_assist", title: "Balanced Assist", desc: "I want safety features but I still want to drive", icon: "/control icons/shared-responsibility.svg" },
                { key: "full_control", title: "Full Driver Control", desc: "I want to feel everything the car is doing without interference", icon: "/control icons/full-mechanical-feedback.svg" },
              ]}
              selectedIndex={quiz.controlPrefChoice}
              onSelect={quiz.setControlPrefChoice}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 22 && (
            <ChoiceQuestion
              questionId="patience_level"
              title="How Patient Are You in Traffic?"
              tip="Be honest — how do you really react when things slow down?"
              options={[
                "I get frustrated easily and want to move",
                "I stay calm and listen to music or podcasts",
                "I use the time to think or make calls",
                "I find alternate routes immediately",
                "I get frustrated easily and want to move",
                "I stay calm and listen to music or podcasts",
                "I use the time to think or make calls",
                "I find alternate routes immediately",
              ]}
              selectedIndex={quiz.patienceLevel}
              onSelect={quiz.setPatienceLevel}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 23 && (
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
              selectedKey={quiz.weekendPhoto}
              onSelect={(k) => quiz.setWeekendPhoto(k)}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 24 && (
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
              selectedIndex={quiz.ownershipDuration}
              onSelect={quiz.setOwnershipDuration}
            />
          )}
          {!quiz.showIntro && !quiz.showHalfway && !quiz.showFinal && quiz.current === 25 && (
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
              selectedIndex={quiz.sizeScaleIndex}
              onSelect={quiz.setSizeScaleIndex}
            />
          )}
        </div>
      </div>
      
      <QuizControls 
        showFinal={quiz.showFinal}
        showIntro={quiz.showIntro}
        showHalfway={quiz.showHalfway}
        handleNext={quiz.handleNext}
        isNextDisabled={quiz.isNextDisabled}
      />
        
    </div>
  );
}
