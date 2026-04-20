import React from "react";
import formStyles from "../QuizForm.module.css";

interface QuizControlsProps {
  showFinal: boolean;
  showIntro: boolean;
  showHalfway: boolean;
  handleNext: () => void;
  isNextDisabled: () => boolean;
  forceStatic?: boolean;
  nextLabel?: string;
  leftNote?: string;
}

export default function QuizControls({ showFinal, showIntro, showHalfway, handleNext, isNextDisabled, forceStatic, nextLabel, leftNote }: QuizControlsProps) {
  if (showFinal) return null;

  return (
    <div className={`${formStyles.floatingBar} ${(showIntro || forceStatic) ? formStyles.introBar : ''}`}>
      <div className={`${leftNote ? formStyles.barInnerSpread : formStyles.barInner}`}>
        {leftNote && (
          <div className={formStyles.noteLeft}>{leftNote}</div>
        )}
        <button
          className={formStyles.next}
          onClick={handleNext}
          disabled={isNextDisabled()}
        >
          {nextLabel ? nextLabel : showIntro ? "Start" : showHalfway ? "Continue" : "Next"}
        </button>
      </div>
    </div>
  );
}
