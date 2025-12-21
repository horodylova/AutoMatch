"use client";
import { useState, useEffect } from "react";
import QuizProgress from "../../components/QuizProgress";
import { 
  PhotoQuestion, 
  ChoiceQuestion, 
  SliderQuestion, 
  MultiChoiceQuestion, 
  IconChoiceQuestion, 
  PhotoQuadQuestion, 
  TableTagQuestion, 
  MultiPhotoQuestion 
} from "../../components/quiz";
import ResultsGallery from "../../components/ResultsGallery";
import { useQuiz } from "../../hooks/useQuiz";
import ExitModal from "../../components/quiz/modals/ExitModal";
import ResumeModal from "../../components/quiz/modals/ResumeModal";
import QuizControls from "../../components/quiz/QuizControls";
import QuizHeader from "../../components/quiz/QuizHeader";
import { QUIZ_QUESTIONS } from "../../constants/quizQuestions";
import { parseCarData, matchCars, Row, ScoredCar, QuizFilters } from "../../utils/carScoring";
import { Categories, CategoryValue } from "../../constants/categories";
import { fetchDataset } from "../../lib/dataset";

export default function Page() {
  const quiz = useQuiz();
  const [exitDestination, setExitDestination] = useState("/");
  
  const [rows, setRows] = useState<Row[]>([]);
  const [idx, setIdx] = useState<Record<string, number>>({});
  const [topMatches, setTopMatches] = useState<ScoredCar[]>([]);

  // Load data
  useEffect(() => {
    async function load() {
      const ds = await fetchDataset();
      setIdx(ds.idx);
      // Dataset rows start at index 4 (row 5). Quiz originally sliced at 13 (row 14).
      // So we skip 9 more rows (4 + 9 = 13).
      setRows(ds.rows.slice(9));
    }
    load();
  }, []);

  // Calculate matches when final screen is shown
  useEffect(() => {
    if (quiz.showFinal && rows.length > 0 && Object.keys(idx).length > 0) {
      const prefs = Object.values(Categories).reduce((acc, cat) => {
        acc[cat] = 0;
        return acc;
      }, {} as Record<CategoryValue, number>);

      const add = (cat: CategoryValue, amount: number) => {
        prefs[cat] = (prefs[cat] || 0) + amount;
      };

      QUIZ_QUESTIONS.forEach(q => {
        const val = quiz.answers[q.id];
        if (val === undefined || val === null) return;

        if (q.type === "IconChoiceQuestion" || q.type === "ChoiceQuestion" || q.type === "PhotoQuadQuestion") {
           const idx = val as number;
           const opt = q.options[idx];
           if (typeof opt === 'object' && 'categories' in opt && opt.categories) {
              add(opt.categories.primary, 2);
              add(opt.categories.secondary, 1);
           }
        } else if (q.type === "PhotoQuestion") {
           const key = val as string;
           const opt = q.options.find(o => o.key === key);
           if (opt?.categories) {
              add(opt.categories.primary, 2);
              add(opt.categories.secondary, 1);
           }
        } else if (q.type === "MultiChoiceQuestion") {
           const idxs = val as number[];
           idxs.forEach(i => {
              const opt = q.options[i];
              if (typeof opt === 'object' && 'categories' in opt && opt.categories) {
                 add(opt.categories.primary, 2);
                 add(opt.categories.secondary, 1);
              }
           });
        } else if (q.type === "MultiPhotoQuestion") {
           const keys = val as string[];
           keys.forEach(k => {
              const opt = q.options.find(o => o.key === k);
              if (opt?.categories) {
                 add(opt.categories.primary, 2);
                 add(opt.categories.secondary, 1);
              }
           });
        } else if (q.type === "SliderQuestion") {
           const v = val as number;
           const range = q.categoryRanges.find(r => v >= r.min && v <= r.max);
           if (range?.categories) {
               add(range.categories.primary, 2);
               add(range.categories.secondary, 1);
           }
        } else if (q.type === "TableTagQuestion") {
           const tags = val as string[];
           tags.forEach(t => {
               const tagOpt = q.tags.find(o => (typeof o === 'string' ? o === t : o.label === t));
               if (typeof tagOpt === 'object' && tagOpt.categories) {
                   add(tagOpt.categories.primary, 2);
                   add(tagOpt.categories.secondary, 1);
               }
           });
        }
      });

      // Parse all cars
      const cars = rows.map((r) => parseCarData(r, idx));

      // Filter out cars without images (quiz only)
      const validCars = cars.filter(c => c.image && c.image !== "/placeholder-car.jpg");
      
      // Extract Filters
      const filters: QuizFilters = {};
      
      // Size
      const sizeVal = quiz.answers["car_size_scale"] as string;
      if (sizeVal === "small_agile") filters.sizePreference = "small";
      else if (sizeVal === "mid_size_balanced") filters.sizePreference = "mid";
      else if (sizeVal === "large_comfortable") filters.sizePreference = "large";
      else if (sizeVal === "oversized_powerful") filters.sizePreference = "oversized";

      // Fuel
      const fuelVal = quiz.answers["fuel_importance"] as number; // Index
      if (fuelVal === 3) filters.fuelPriority = "critical";
      else if (fuelVal === 2) filters.fuelPriority = "high";
      else if (fuelVal === 1) filters.fuelPriority = "medium";
      else filters.fuelPriority = "low";

      // Expenses
      const expenseVal = quiz.answers["car_expenses_preference"] as number; // Index
      // 0: Low, 1: Balanced, 2: High, 3: Unlimited, 4: Balanced, 5: High
      if (expenseVal === 0) filters.expensePreference = "low";
      else if (expenseVal === 1 || expenseVal === 4) filters.expensePreference = "balanced";
      else if (expenseVal === 2 || expenseVal === 5) filters.expensePreference = "high";
      else if (expenseVal === 3) filters.expensePreference = "unlimited";

      // Common Sense Filters
      
      // 1. Seats (freedom_feel)
      const passengers = quiz.answers["freedom_feel"] as string[];
      if (passengers) {
        const needsMoreSeats = passengers.some(p => 
          p === "children_car_seats_school_runs" || 
          p === "friends_passengers_often" || 
          p === "work_crew_clients"
        );
        filters.minSeats = needsMoreSeats ? 4 : 2;
      }

      // 2. Cargo (car_cargo_preference)
      const cargo = quiz.answers["car_cargo_preference"] as string;
      if (cargo === "large_items" || cargo === "work_equipment") {
        filters.cargoNeeds = "high";
      } else if (cargo === "sports_gear" || cargo === "luggage" || cargo === "kids_stuff") {
        filters.cargoNeeds = "medium";
      } else {
        filters.cargoNeeds = "low";
      }

      // 3. AWD & Transmission (bad_weather_focus)
      const weekend = quiz.answers["ideal_weekend"] as string;
      const weather = quiz.answers["bad_weather_focus"] as number; // Index
      // Weather: 0 (Simple/Safe), 1 (Stable/Reliable), 2 (Control)
      
      if (weekend === "outdoors_hiking" || weekend === "road_trip" || weather === 1) {
        filters.awdPreferred = true;
      }

      // Transmission Control
      const controlPref = quiz.answers["control_preference"] as number; // Index
      // 0: Automation, 1: Balanced, 2: Full Control
      if (controlPref === 2) {
         filters.transmissionPreference = "manual"; // Wants full control
      } else if (controlPref === 0) {
         filters.transmissionPreference = "automatic"; // Wants simple/safe
      }

      // 4. Sport Mode (Check for consistent sportiness)
      let sportCount = 0;
      
      // Explicit sport choices
      const sportKeys = [
        "joy_excitement", // emotional_expectation
        "engine_sound", // noise_level
        "low_connected", // driving_position_preference
        "full_control", // control_preference
        "active_gym", // ideal_weekend
        "Cockpit-like", // interior_space_relation (Label check if label is stored, or we need to check how it's stored. PhotoQuadQuestion usually stores index. Wait. 
        // Let's check typical usage. In `PhotoQuadQuestion`, we pass `onSelect(i)`. So it stores NUMBER index.)
      ];

      // Fix: Check index-based answers first
      if (quiz.answers["interior_space_relation"] === 3) sportCount++; // Cockpit-like
      if (quiz.answers["fuel_importance"] === 0) sportCount++; // Performance priority
      if (quiz.answers["interior_feel"] === 1) sportCount++; // Tight energetic cabin
      if (quiz.answers["bad_weather_focus"] === 2) sportCount++; // Enjoy control
      if (quiz.answers["control_preference"] === 2) sportCount++; // Full Control
      if (quiz.answers["driving_position_preference"] === 2) sportCount++; // Low & connected
      
      // Check string-based answers
      for (const val of Object.values(quiz.answers)) {
         if (typeof val === 'string' && sportKeys.includes(val)) sportCount++;
         if (Array.isArray(val) && val.some(v => sportKeys.includes(v))) sportCount++;
      }

      if (sportCount >= 2) {
         filters.forceSport = true;
      }

      // 5. Utility Mode (Work / Cargo focus)
      let utilityCount = 0;
      const utilityKeys = [
        "work_equipment", // car_cargo_preference
        "large_items", // car_cargo_preference
        "work_crew_clients", // freedom_feel
        "tow_hitch", // (hypothetical, checking tags)
        "Self-sufficient", // people_descriptors
        "Outdoorsy", // people_descriptors
        "Strong, practical environment", // interior_feel (label text part)
        "A strong, practical environment built to handle gear, weather, and daily tasks without hesitation." // full label
      ];

      if (quiz.answers["interior_feel"] === 5) utilityCount++; // Strong practical env
      
      // Check string-based answers
      for (const val of Object.values(quiz.answers)) {
         if (typeof val === 'string' && utilityKeys.includes(val)) utilityCount++;
         if (Array.isArray(val) && val.some(v => utilityKeys.includes(v))) utilityCount++;
      }

      // If user explicitly chose Work Equipment or Large Items, that counts double
      if (cargo === "work_equipment" || cargo === "large_items") utilityCount += 2;

      if (utilityCount >= 3) {
         filters.forceUtility = true;
      }

      // 6. Luxury Mode (Status / Comfort focus)
      let luxuryCount = 0;
      const luxuryKeys = [
        "status_achievement", // emotional_expectation
        "luxurious_detailed", // home_feel
        "Status-conscious", // people_descriptors
        "Luxury meal or indulgence", // hard_week_treat
        "Pay more for quality", // purchase_approach
        "Pay more if it improves quality and experience", // car_expenses_preference
        "A smooth, elegant interior with premium textures, warm lighting, and details that feel intentionally crafted.", // interior_feel
        "Near-Silence", // noise_level
        "near_silence"
      ];

      if (quiz.answers["interior_feel"] === 2) luxuryCount++; // Smooth elegant
      if (quiz.answers["car_expenses_preference"] === 2) luxuryCount++; // Pay more
      if (quiz.answers["emotional_expectation"] === "status_achievement") luxuryCount++;

      // Check string-based answers
      for (const val of Object.values(quiz.answers)) {
         if (typeof val === 'string' && luxuryKeys.includes(val)) luxuryCount++;
         if (Array.isArray(val) && val.some(v => luxuryKeys.includes(v))) luxuryCount++;
      }

      if (luxuryCount >= 2) {
         filters.forceLuxury = true;
      }

      // Match
      const matches = matchCars(validCars, prefs, filters);

      // Deduplicate matches by Make to ensure variety (one car per brand)
      const uniqueMatches: ScoredCar[] = [];
      const seenMakes = new Set<string>();

      for (const m of matches) {
        // Normalize make to ensure consistent keys
        const make = m.car.make.toLowerCase().trim();
        
        if (!seenMakes.has(make)) {
          seenMakes.add(make);
          uniqueMatches.push(m);
        }
        
        if (uniqueMatches.length >= 12) break;
      }

      setTopMatches(uniqueMatches);
    }
  }, [quiz.showFinal, rows, idx, quiz.answers]);

  const renderQuestion = () => {
    if (quiz.showIntro || quiz.showHalfway || quiz.showFinal) return null;
    
    const question = QUIZ_QUESTIONS[quiz.current];
    if (!question) return null;

    const value = quiz.answers[question.id];

    switch (question.type) {
      case "IconChoiceQuestion":
        return (
          <IconChoiceQuestion 
            key={question.id}
            {...question}
            questionId={question.id}
            selectedIndex={value as number} 
            onSelect={(val) => quiz.setAnswer(question.id, val)} 
          />
        );

      case "PhotoQuestion":
        return (
          <PhotoQuestion 
            key={question.id}
            {...question}
            questionId={question.id}
            selectedKey={value as string} 
            onSelect={(val) => quiz.setAnswer(question.id, val)} 
          />
        );

      case "ChoiceQuestion":
        return (
          <ChoiceQuestion 
            key={question.id}
            {...question}
            questionId={question.id}
            selectedIndex={value as number} 
            onSelect={(val) => quiz.setAnswer(question.id, val)} 
          />
        );

      case "MultiChoiceQuestion":
        return (
          <MultiChoiceQuestion 
            key={question.id}
            {...question}
            questionId={question.id}
            selected={value as number[]} 
            onChange={(val) => quiz.setAnswer(question.id, val)} 
          />
        );

      case "MultiPhotoQuestion":
        return (
          <MultiPhotoQuestion 
            key={question.id}
            {...question}
            questionId={question.id}
            selectedKeys={value as string[] || []} 
            onChange={(val) => quiz.setAnswer(question.id, val)} 
          />
        );

      case "PhotoQuadQuestion":
        return (
          <PhotoQuadQuestion 
            key={question.id}
            {...question}
            questionId={question.id}
            selectedIndex={value as number} 
            onSelect={(val) => quiz.setAnswer(question.id, val)}
            isMobile={quiz.isMobile}
          />
        );

      case "SliderQuestion":
        return (
          <SliderQuestion 
            key={question.id}
            {...question}
            questionId={question.id}
            value={value as number} 
            onChange={(val) => quiz.setAnswer(question.id, val)} 
          />
        );

      case "TableTagQuestion":
        return (
          <TableTagQuestion 
            key={question.id}
            {...question}
            questionId={question.id}
            selected={value as string[]} 
            onChange={(val) => quiz.setAnswer(question.id, val)} 
          />
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      paddingLeft: "clamp(16px, 4vw, 32px)",
      paddingRight: "clamp(16px, 4vw, 32px)",
      paddingTop: quiz.showGallery 
        ? (quiz.isMobile ? "30px" : "50px") 
        : (quiz.isMobile ? "calc(clamp(72px, 12vw, 140px) + 16px)" : "clamp(72px, 12vw, 140px)"),
      paddingBottom: quiz.showGallery ? "calc(40px + env(safe-area-inset-bottom, 0px))" : "calc(100px + env(safe-area-inset-bottom, 0px))",
      height: "100dvh",
      overflowY: quiz.showGallery ? "auto" : "hidden",
    }}>

      <QuizHeader onExit={() => { setExitDestination("/"); quiz.setShowExitModal(true); }} />

      {quiz.showExitModal && (
        <ExitModal onCancel={() => quiz.setShowExitModal(false)} destination={exitDestination} />
      )}

      {quiz.showResumeModal && (
        <ResumeModal 
            onResume={quiz.restoreProgress} 
            onStartFresh={quiz.handleStartFresh} 
        />
      )}

      {quiz.showGallery ? (
        <ResultsGallery 
          results={topMatches.map(m => ({
            id: m.car.id,
            image: m.car.image,
            make: m.car.make,
            model: m.car.model,
            year: String(m.car.year),
            price: `$${m.car.baseMsrp.toLocaleString()}`
          }))}
          onSaveProgress={() => { setExitDestination("/cars"); quiz.setShowExitModal(true); }} 
        />
      ) : (
        <>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <QuizProgress 
                current={quiz.current} 
                total={quiz.total} 
                showIntro={quiz.showIntro} 
                showHalfway={quiz.showHalfway} 
                showFinal={quiz.showFinal} 
                introImageSrc="/before-you-begin.jpg" 
                onShowResults={() => quiz.setShowGallery(true)}
            />
            
            <div style={{ maxHeight: "min(70vh, 680px)", overflow: "auto", paddingRight: 4 }}>
              {renderQuestion()}
            </div>
          </div>
          
          <QuizControls 
            showFinal={quiz.showFinal}
            showIntro={quiz.showIntro}
            showHalfway={quiz.showHalfway}
            handleNext={quiz.handleNext}
            isNextDisabled={quiz.isNextDisabled}
          />
        </>
      )}
        
    </div>
  );
}
