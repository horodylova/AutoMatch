import { useState, useEffect } from "react";
import { clearQuizAnswers, getQuizAnswers } from "../utils/storage";
import { QUIZ_QUESTIONS } from "../constants/quizQuestions";

export function useQuiz() {
  const total = QUIZ_QUESTIONS.length;
  const [current, setCurrent] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [showHalfway, setShowHalfway] = useState<boolean>(false);
  const [showFinal, setShowFinal] = useState<boolean>(false);
  const [showGallery, setShowGallery] = useState<boolean>(false);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [showResumeModal, setShowResumeModal] = useState<boolean>(false);

  // Generic answers state: { [questionId]: value }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [answers, setAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setAnswer = (id: string, value: any) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const finish = (step: number, half: boolean, fin: boolean) => {
    setCurrent(step);
    setShowHalfway(half);
    setShowFinal(fin);
    setShowIntro(false);
    setShowResumeModal(false);
  };

  const restoreProgress = () => {
    const saved = getQuizAnswers();
    if (!saved) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newAnswers: Record<string, any> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getVal = (id: string): any => saved[`q:${id}`];

    QUIZ_QUESTIONS.forEach(q => {
      const val = getVal(q.id);
      if (!val) return;

      switch (q.type) {
        case "IconChoiceQuestion":
        case "ChoiceQuestion":
        case "PhotoQuadQuestion":
          if (typeof val.index === 'number') newAnswers[q.id] = val.index;
          break;
        case "PhotoQuestion":
          if (val.key) newAnswers[q.id] = val.key;
          break;
        case "MultiChoiceQuestion":
          if (val.indexes) newAnswers[q.id] = val.indexes;
          break;
        case "MultiPhotoQuestion":
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (Array.isArray(val)) newAnswers[q.id] = val.map((o: any) => o.key);
          break;
        case "SliderQuestion":
          if (typeof val.value === 'number') newAnswers[q.id] = val.value;
          break;
        case "TableTagQuestion":
          if (val.tags) newAnswers[q.id] = val.tags;
          break;
      }
    });

    if (Object.keys(newAnswers).length > 0) {
      setAnswers(newAnswers);
      
      // Determine where to resume
      for (let i = 0; i < total; i++) {
         const q = QUIZ_QUESTIONS[i];
         if (newAnswers[q.id] === undefined) {
             finish(i, false, false);
             return;
         }
         // Special handling for halfway point (after q13 hard_week_treat)
         if (i === 13 && newAnswers[QUIZ_QUESTIONS[13].id] && !newAnswers[QUIZ_QUESTIONS[14].id]) {
             finish(13, true, false);
             return;
         }
      }
      finish(total - 1, false, true);
    }
  };

  const validateQuestion = (index: number): boolean => {
      const q = QUIZ_QUESTIONS[index];
      if (!q) return false;
      
      const val = answers[q.id];
      
      if (val === undefined || val === null) return false;

      if (q.type === "MultiChoiceQuestion" || q.type === "TableTagQuestion" || q.type === "MultiPhotoQuestion") {
          if (!Array.isArray(val)) return false;
          if (q.minSelect && val.length < q.minSelect) return false;
          if (q.maxSelect && val.length > q.maxSelect) return false;
          return true;
      }
      
      // For string/number types (Choice, IconChoice, Photo, Slider), presence check is enough
      // Empty string check just in case
      if (typeof val === 'string' && val === '') return false;

      return true;
  };

  const handleNext = () => {
    if (showIntro) {
      const saved = getQuizAnswers();
      if (saved && Object.keys(saved).length > 0) {
        setShowResumeModal(true);
        return;
      }
      setShowIntro(false);
      return;
    }
    if (showHalfway) { setShowHalfway(false); setCurrent(14); return; }
    
    if (current >= total) return;
    
    if (!validateQuestion(current)) return;

    // Special case for halfway: after question 13 (hard_week_treat)
    if (current === 13) {
        setShowHalfway(true);
        return;
    }
    
    if (current === total - 1) {
        setShowFinal(true);
        return;
    }

    setCurrent(v => v + 1);
  };

  const isNextDisabled = () => {
    if (showIntro || showHalfway) return false;
    if (current >= total) return false;
    return !validateQuestion(current);
  };

  const handleStartFresh = () => {
    clearQuizAnswers();
    setAnswers({});
    setShowResumeModal(false);
    setShowIntro(false);
    setCurrent(0);
  };

  return {
    total,
    current,
    setCurrent,
    isMobile,
    showIntro,
    setShowIntro,
    showHalfway,
    setShowHalfway,
    showFinal,
    setShowFinal,
    showGallery,
    setShowGallery,
    showExitModal,
    setShowExitModal,
    showResumeModal,
    setShowResumeModal,
    
    answers,
    setAnswer,
    
    restoreProgress,
    handleNext,
    isNextDisabled,
    handleStartFresh
  };
}
