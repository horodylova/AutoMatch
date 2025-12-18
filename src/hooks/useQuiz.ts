import { useState, useEffect } from "react";
import { clearQuizAnswers, getQuizAnswers } from "../utils/storage";

export function useQuiz() {
  const stepIds = [
    "emotional_expectation",
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
    "fuel_importance",
    "interior_feel",
    "interior_space_relation",
    "technology_relationship",
    "control_preference",
    "patience_level",
    "ideal_weekend",
    "ownership_duration",
    "car_size_scale"
  ];

  const total = stepIds.length;
  const [current, setCurrent] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [showHalfway, setShowHalfway] = useState<boolean>(false);
  const [showFinal, setShowFinal] = useState<boolean>(false);
  const [showGallery, setShowGallery] = useState<boolean>(false);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [showResumeModal, setShowResumeModal] = useState<boolean>(false);

  // Question States
  const [emotionChoice, setEmotionChoice] = useState<number | null>(null);
  const [morningChoice, setMorningChoice] = useState<string | null>(null);
  const [badWeatherFocus, setBadWeatherFocus] = useState<number | null>(null);
  const [unexpectedSel, setUnexpectedSel] = useState<number[]>([]);
  const [noiseLevelChoice, setNoiseLevelChoice] = useState<number | null>(null);
  const [freedomPhotos, setFreedomPhotos] = useState<string[]>([]);
  const [parkingChoice, setParkingChoice] = useState<number | null>(null);
  const [homePhoto, setHomePhoto] = useState<string | null>(null);
  const [riskChoice, setRiskChoice] = useState<number | null>(null);
  const [purchaseChoice, setPurchaseChoice] = useState<number | null>(null);
  const [cargoChoice, setCargoChoice] = useState<string | null>(null);
  const [maintenanceInvolvement, setMaintenanceInvolvement] = useState<number | null>(null);
  const [descriptorTags, setDescriptorTags] = useState<string[]>([]);
  const [hardWeekSel, setHardWeekSel] = useState<number[]>([]);
  const [decisionStyleSel, setDecisionStyleSel] = useState<number[]>([]);
  const [drivingPositionChoice, setDrivingPositionChoice] = useState<number | null>(null);
  const [expensesPref, setExpensesPref] = useState<number | null>(null);
  const [fuelImportance, setFuelImportance] = useState<number | null>(null);
  const [interiorChoice, setInteriorChoice] = useState<number | null>(null);
  const [spaceRelationChoice, setSpaceRelationChoice] = useState<number | null>(null);
  const [techTags, setTechTags] = useState<string[]>([]);
  const [controlPrefChoice, setControlPrefChoice] = useState<number | null>(null);
  const [patienceLevel, setPatienceLevel] = useState<number | null>(null);
  const [weekendPhoto, setWeekendPhoto] = useState<string | null>(null);
  const [ownershipDuration, setOwnershipDuration] = useState<number | null>(null);
  const [sizeScaleIndex, setSizeScaleIndex] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const restoreProgress = () => {
    const saved = getQuizAnswers();
    if (!saved) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getVal = (id: string): any => saved[`q:${id}`];

    const q0 = getVal("emotional_expectation");
    if (q0) setEmotionChoice(q0.index);

    const q1 = getVal("perfect_morning");
    if (q1) setMorningChoice(q1.key);

    const q2 = getVal("bad_weather_focus");
    if (q2) setBadWeatherFocus(q2.index);

    const q3 = getVal("unexpected_changes");
    if (q3) setUnexpectedSel(q3.indexes);

    const q4 = getVal("noise_level");
    if (q4) setNoiseLevelChoice(q4.index);

    const q5 = getVal("freedom_feel");
    if (q5 && Array.isArray(q5)) setFreedomPhotos(q5.map((o: { key: string }) => o.key));

    const q6 = getVal("parking_location");
    if (q6) setParkingChoice(q6.index);

    const q7 = getVal("home_feel");
    if (q7) setHomePhoto(q7.key);

    const q8 = getVal("manage_risks");
    if (q8) setRiskChoice(q8.index);

    const q9 = getVal("purchase_approach");
    if (q9) setPurchaseChoice(q9.index);

    const q10 = getVal("car_cargo_preference");
    if (q10) setCargoChoice(q10.key);

    const q11 = getVal("maintenance_involvement");
    if (q11) setMaintenanceInvolvement(q11.value);

    const q12 = getVal("people_descriptors");
    if (q12) setDescriptorTags(q12.tags);

    const q13 = getVal("hard_week_treat");
    if (q13) setHardWeekSel(q13.indexes);

    const q14 = getVal("decision_style");
    if (q14) setDecisionStyleSel(q14.indexes);

    const q15 = getVal("driving_position_preference");
    if (q15) setDrivingPositionChoice(q15.index);

    const q16 = getVal("car_expenses_preference");
    if (q16) setExpensesPref(q16.index);

    const q17 = getVal("fuel_importance");
    if (q17) setFuelImportance(q17.index);

    const q18 = getVal("interior_feel");
    if (q18) setInteriorChoice(q18.index);

    const q19 = getVal("interior_space_relation");
    if (q19) setSpaceRelationChoice(q19.index);

    const q20 = getVal("technology_relationship");
    if (q20) setTechTags(q20.tags);

    const q21 = getVal("control_preference");
    if (q21) setControlPrefChoice(q21.index);

    const q22 = getVal("patience_level");
    if (q22) setPatienceLevel(q22.index);

    const q23 = getVal("ideal_weekend");
    if (q23) setWeekendPhoto(q23.key);

    const q24 = getVal("ownership_duration");
    if (q24) setOwnershipDuration(q24.index);

    const q25 = getVal("car_size_scale");
    if (q25) setSizeScaleIndex(q25.index);

    const finish = (step: number, half: boolean, fin: boolean) => {
      setCurrent(step);
      setShowHalfway(half);
      setShowFinal(fin);
      setShowIntro(false);
      setShowResumeModal(false);
    };

    if (!q0) { finish(0, false, false); return; }
    if (!q1) { finish(1, false, false); return; }
    if (!q2) { finish(2, false, false); return; }
    if (!q3) { finish(3, false, false); return; }
    if (!q4) { finish(4, false, false); return; }
    if (!q5) { finish(5, false, false); return; }
    if (!q6) { finish(6, false, false); return; }
    if (!q7) { finish(7, false, false); return; }
    if (!q8) { finish(8, false, false); return; }
    if (!q9) { finish(9, false, false); return; }
    if (!q10) { finish(10, false, false); return; }
    if (!q11) { finish(11, false, false); return; }
    if (!q12) { finish(12, false, false); return; }
    
    if (!q13) { finish(13, false, false); return; }
    if (!q14) { 
      finish(13, true, false); 
      return; 
    }

    if (!q15) { finish(15, false, false); return; }
    if (!q16) { finish(16, false, false); return; }
    if (!q17) { finish(17, false, false); return; }
    if (!q18) { finish(18, false, false); return; }
    if (!q19) { finish(19, false, false); return; }
    if (!q20) { finish(20, false, false); return; }
    if (!q21) { finish(21, false, false); return; }
    if (!q22) { finish(22, false, false); return; }
    if (!q23) { finish(23, false, false); return; }
    if (!q24) { finish(24, false, false); return; }
    if (!q25) { finish(25, false, false); return; }
    
    finish(25, false, true);
  };

  const handleNext = () => {
    if (showIntro) {
      const answers = getQuizAnswers();
      if (answers && Object.keys(answers).length > 0) {
        setShowResumeModal(true);
        return;
      }
      setShowIntro(false);
      return;
    }
    if (showHalfway) { setShowHalfway(false); setCurrent(14); return; }
    if (current === 0) { if (emotionChoice === null) { return; } setCurrent(1); return; }
    if (current === 1) { if (!morningChoice) { return; } setCurrent(2); return; }
    if (current === 2) { if (badWeatherFocus === null) { return; } setCurrent(3); return; }
    if (current === 3) { if (unexpectedSel.length < 1) { return; } setCurrent(4); return; }
    if (current === 4) { if (noiseLevelChoice === null) { return; } setCurrent(5); return; }
    if (current === 5) { if (freedomPhotos.length === 0) { return; } setCurrent(6); return; }
    if (current === 6) { if (parkingChoice === null) { return; } setCurrent(7); return; }
    if (current === 7) { if (!homePhoto) { return; } setCurrent(8); return; }
    if (current === 8) { if (riskChoice === null) { return; } setCurrent(9); return; }
    if (current === 9) { if (purchaseChoice === null) { return; } setCurrent(10); return; }
    if (current === 10) { if (!cargoChoice) { return; } setCurrent(11); return; }
    if (current === 11) { if (maintenanceInvolvement === null) { return; } setCurrent(12); return; }
    if (current === 12) { if (descriptorTags.length < 1 || descriptorTags.length > 3) { return; } setCurrent(13); return; }
    if (current === 13) { if (hardWeekSel.length < 1) { return; } setShowHalfway(true); return; }
    if (current === 14) { if (decisionStyleSel.length < 1) { return; } setCurrent(15); return; }
    if (current === 15) { if (drivingPositionChoice === null) { return; } setCurrent(16); return; }
    if (current === 16) { if (expensesPref === null) { return; } setCurrent(17); return; }
    if (current === 17) { if (fuelImportance === null) { return; } setCurrent(18); return; }
    if (current === 18) { if (interiorChoice === null) { return; } setCurrent(19); return; }
    if (current === 19) { if (spaceRelationChoice === null) { return; } setCurrent(20); return; }
    if (current === 20) { if (techTags.length < 2 || techTags.length > 5) { return; } setCurrent(21); return; }
    if (current === 21) { if (controlPrefChoice === null) { return; } setCurrent(22); return; }
    if (current === 22) { if (patienceLevel === null) { return; } setCurrent(23); return; }
    if (current === 23) { if (!weekendPhoto) { return; } setCurrent(24); return; }
    if (current === 24) { if (ownershipDuration === null) { return; } setCurrent(25); return; }
    if (current === 25) { if (sizeScaleIndex === null) { return; } setShowFinal(true); return; } 
    if (current >= total - 1) { return; }
    setCurrent(v => Math.min(total - 1, v + 1));
  };

  const isNextDisabled = () => {
    if (showIntro || showHalfway) return false;
    if (current === 0) return emotionChoice === null;
    if (current === 1) return !morningChoice;
    if (current === 2) return badWeatherFocus === null;
    if (current === 3) return unexpectedSel.length < 1;
    if (current === 4) return noiseLevelChoice === null;
    if (current === 5) return freedomPhotos.length === 0;
    if (current === 6) return parkingChoice === null;
    if (current === 7) return !homePhoto;
    if (current === 8) return riskChoice === null;
    if (current === 9) return purchaseChoice === null;
    if (current === 10) return !cargoChoice;
    if (current === 11) return maintenanceInvolvement === null;
    if (current === 12) return (descriptorTags.length < 1 || descriptorTags.length > 3);
    if (current === 13) return hardWeekSel.length < 1;
    if (current === 14) return decisionStyleSel.length < 1;
    if (current === 15) return drivingPositionChoice === null;
    if (current === 16) return expensesPref === null;
    if (current === 17) return fuelImportance === null;
    if (current === 18) return interiorChoice === null;
    if (current === 19) return spaceRelationChoice === null;
    if (current === 20) return (techTags.length < 2 || techTags.length > 5);
    if (current === 21) return controlPrefChoice === null;
    if (current === 22) return patienceLevel === null;
    if (current === 23) return !weekendPhoto;
    if (current === 24) return ownershipDuration === null;
    if (current === 25) return sizeScaleIndex === null;
    return false;
  };

  const handleStartFresh = () => {
    clearQuizAnswers();
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
    
    // State Setters & Values
    emotionChoice, setEmotionChoice,
    morningChoice, setMorningChoice,
    badWeatherFocus, setBadWeatherFocus,
    unexpectedSel, setUnexpectedSel,
    noiseLevelChoice, setNoiseLevelChoice,
    freedomPhotos, setFreedomPhotos,
    parkingChoice, setParkingChoice,
    homePhoto, setHomePhoto,
    riskChoice, setRiskChoice,
    purchaseChoice, setPurchaseChoice,
    cargoChoice, setCargoChoice,
    maintenanceInvolvement, setMaintenanceInvolvement,
    descriptorTags, setDescriptorTags,
    hardWeekSel, setHardWeekSel,
    decisionStyleSel, setDecisionStyleSel,
    drivingPositionChoice, setDrivingPositionChoice,
    expensesPref, setExpensesPref,
    fuelImportance, setFuelImportance,
    interiorChoice, setInteriorChoice,
    spaceRelationChoice, setSpaceRelationChoice,
    techTags, setTechTags,
    controlPrefChoice, setControlPrefChoice,
    patienceLevel, setPatienceLevel,
    weekendPhoto, setWeekendPhoto,
    ownershipDuration, setOwnershipDuration,
    sizeScaleIndex, setSizeScaleIndex,

    // Actions
    restoreProgress,
    handleNext,
    isNextDisabled,
    handleStartFresh
  };
}
