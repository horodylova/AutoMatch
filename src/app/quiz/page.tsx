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
import { parseCarData, matchCars, Row, ScoredCar } from "../../utils/carScoring";
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
      
      // Match
      const matches = matchCars(validCars, prefs);

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
