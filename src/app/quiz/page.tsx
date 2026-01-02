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
import FeedbackModal from "../../components/quiz/modals/FeedbackModal";
import QuizControls from "../../components/quiz/QuizControls";
import QuizHeader from "../../components/quiz/QuizHeader";
import { QUIZ_QUESTIONS } from "../../constants/quizQuestions";
import { parseCarData, matchCars, Row, ScoredCar, QuizFilters } from "../../utils/carScoring";
import { Categories, CategoryValue } from "../../constants/categories";
import { fetchDataset } from "../../lib/dataset";
import { saveResults } from "../../utils/storage";

export default function Page() {
  const quiz = useQuiz();
  const [exitDestination, setExitDestination] = useState("/");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  const [rows, setRows] = useState<Row[]>([]);
  const [idx, setIdx] = useState<Record<string, number>>({});
  const [topMatches, setTopMatches] = useState<ScoredCar[]>([]);

  useEffect(() => {
    async function load() {
      const ds = await fetchDataset();
      setIdx(ds.idx);
  
      setRows(ds.rows.slice(9));
    }
    load();
  }, []);

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

     
      const cars = rows.map((r) => parseCarData(r, idx));

      const validCars = cars.filter(c => c.image && c.image !== "/placeholder-car.jpg");
     
      const filters: QuizFilters = {};
      
    
      const sizeVal = quiz.answers["car_size_scale"] as string;
      if (sizeVal === "small_agile") filters.sizePreference = "small";
      else if (sizeVal === "mid_size_balanced") filters.sizePreference = "mid";
      else if (sizeVal === "large_comfortable") filters.sizePreference = "large";
      else if (sizeVal === "oversized_powerful") filters.sizePreference = "oversized";

    
      const fuelVal = quiz.answers["fuel_importance"] as number;
      if (fuelVal === 3) filters.fuelPriority = "critical";
      else if (fuelVal === 2) filters.fuelPriority = "high";
      else if (fuelVal === 1) filters.fuelPriority = "medium";
      else filters.fuelPriority = "low";

      const expenseVal = quiz.answers["car_expenses_preference"] as number; 
   
      if (expenseVal === 0) filters.expensePreference = "low";
      else if (expenseVal === 1 || expenseVal === 4) filters.expensePreference = "balanced";
      else if (expenseVal === 2 || expenseVal === 5) filters.expensePreference = "high";
      else if (expenseVal === 3) filters.expensePreference = "unlimited";

     
      const passengers = quiz.answers["freedom_feel"] as string[];
      if (passengers) {
        const needsMoreSeats = passengers.some(p => 
          p === "children_car_seats_school_runs" || 
          p === "friends_passengers_often" || 
          p === "work_crew_clients"
        );
        filters.minSeats = needsMoreSeats ? 4 : 2;
      }

      const cargo = quiz.answers["car_cargo_preference"] as string;
      if (cargo === "large_items" || cargo === "work_equipment") {
        filters.cargoNeeds = "high";
      } else if (cargo === "sports_gear" || cargo === "luggage" || cargo === "kids_stuff") {
        filters.cargoNeeds = "medium";
      } else {
        filters.cargoNeeds = "low";
      }

      const weekend = quiz.answers["ideal_weekend"] as string;
      const weather = quiz.answers["bad_weather_focus"] as number; 
  
      
      if (weekend === "outdoors_hiking" || weekend === "road_trip" || weather === 1) {
        filters.awdPreferred = true;
      }

      const controlPref = quiz.answers["control_preference"] as number; 
      if (controlPref === 2) {
         filters.transmissionPreference = "manual"; 
      } else if (controlPref === 0) {
         filters.transmissionPreference = "automatic";
      }

  
      let sportCount = 0;
      
      const sportKeys = [
        "joy_excitement", 
        "engine_sound", 
        "low_connected", 
        "full_control", 
        "active_gym", 
        "Cockpit-like", 
      ];

     
      if (quiz.answers["interior_space_relation"] === 3) sportCount++; 
      if (quiz.answers["fuel_importance"] === 0) sportCount++; 
      if (quiz.answers["interior_feel"] === 1) sportCount++;
      if (quiz.answers["bad_weather_focus"] === 2) sportCount++; 
      if (quiz.answers["control_preference"] === 2) sportCount++; 
      if (quiz.answers["driving_position_preference"] === 2) sportCount++; 
      
 
      for (const val of Object.values(quiz.answers)) {
         if (typeof val === 'string' && sportKeys.includes(val)) sportCount++;
         if (Array.isArray(val) && val.some(v => sportKeys.includes(v))) sportCount++;
      }

      if (sportCount >= 2) {
         filters.forceSport = true;
      }

      let utilityCount = 0;
      const utilityKeys = [
        "work_equipment", 
        "large_items",
        "work_crew_clients", 
        "tow_hitch",
        "Self-sufficient", 
        "Outdoorsy", 
        "Strong, practical environment", 
        "A strong, practical environment built to handle gear, weather, and daily tasks without hesitation." 
      ];

      if (quiz.answers["interior_feel"] === 5) utilityCount++; 
   
      for (const val of Object.values(quiz.answers)) {
         if (typeof val === 'string' && utilityKeys.includes(val)) utilityCount++;
         if (Array.isArray(val) && val.some(v => utilityKeys.includes(v))) utilityCount++;
      }

      if (cargo === "work_equipment" || cargo === "large_items") utilityCount += 2;

      if (utilityCount >= 3) {
         filters.forceUtility = true;
      }

      let luxuryCount = 0;
      const luxuryKeys = [
        "status_achievement",
        "luxurious_detailed",
        "Status-conscious",
        "Luxury meal or indulgence", 
        "Pay more for quality", 
        "Pay more if it improves quality and experience", 
        "A smooth, elegant interior with premium textures, warm lighting, and details that feel intentionally crafted.", 
        "Near-Silence", // noise_level
        "near_silence"
      ];

      if (quiz.answers["interior_feel"] === 2) luxuryCount++; 
      if (quiz.answers["car_expenses_preference"] === 2) luxuryCount++; 
      if (quiz.answers["emotional_expectation"] === "status_achievement") luxuryCount++;

      for (const val of Object.values(quiz.answers)) {
         if (typeof val === 'string' && luxuryKeys.includes(val)) luxuryCount++;
         if (Array.isArray(val) && val.some(v => luxuryKeys.includes(v))) luxuryCount++;
      }

      if (luxuryCount >= 2) {
         filters.forceLuxury = true;
      }

      const matches = matchCars(validCars, prefs, filters);


      const uniqueMatches: ScoredCar[] = [];
      const seenMakes = new Set<string>();

      for (const m of matches) {
   
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
            isMobile={quiz.isMobile}
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
            isMobile={quiz.isMobile}
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
      paddingBottom: (quiz.showGallery || quiz.showFinal)
        ? "calc(40px + env(safe-area-inset-bottom, 0px))" 
        : (quiz.isMobile ? "calc(240px + env(safe-area-inset-bottom, 0px))" : "60px"),
      height: "100dvh",
      overflowY: "auto",
    }}>

      <QuizHeader onExit={() => { setExitDestination("/"); quiz.setShowExitModal(true); }} />

      {quiz.showExitModal && (
        <ExitModal 
          onCancel={() => quiz.setShowExitModal(false)} 
          destination={exitDestination} 
          onConfirm={quiz.showGallery ? () => {
            const resultsToSave = topMatches.map(m => ({
              id: m.car.id,
              image: m.car.image,
              make: m.car.make,
              model: m.car.model,
              year: String(m.car.year),
              price: `$${m.car.baseMsrp.toLocaleString()}`
            }));
            saveResults(resultsToSave);
            quiz.setShowExitModal(false);
            setShowFeedbackModal(true);
          } : undefined}
        />
      )}

      {showFeedbackModal && (
        <FeedbackModal 
          onClose={() => setShowFeedbackModal(false)} 
          destination={exitDestination} 
        />
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
            
            <div style={{ paddingRight: 4 }}>
              {renderQuestion()}
            </div>

            <QuizControls 
              showFinal={quiz.showFinal}
              showIntro={quiz.showIntro}
              showHalfway={quiz.showHalfway}
              handleNext={quiz.handleNext}
              isNextDisabled={quiz.isNextDisabled}
            />
          </div>
        </>
      )}
        
    </div>
  );
}
