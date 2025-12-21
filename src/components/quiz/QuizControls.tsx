import React from "react";
import formStyles from "../QuizForm.module.css";

interface QuizControlsProps {
  showFinal: boolean;
  showIntro: boolean;
  showHalfway: boolean;
  handleNext: () => void;
  isNextDisabled: () => boolean;
  forceStatic?: boolean;
}

export default function QuizControls({ showFinal, showIntro, showHalfway, handleNext, isNextDisabled, forceStatic }: QuizControlsProps) {
  if (showFinal) return null;

  return (
    <div className={`${formStyles.floatingBar} ${(showIntro || forceStatic) ? formStyles.introBar : ''}`}>
      <div className={formStyles.barInner}>
        <button
          className={formStyles.next}
          onClick={handleNext}
          disabled={isNextDisabled()}
        >
          {showIntro ? "Start" : showHalfway ? "Continue" : "Next"}
        </button>
      </div>
    </div>
  );
}
