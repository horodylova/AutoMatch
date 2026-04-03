"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./partTwoIntake.module.css";

type Props = {
  onCompletionChange?: (complete: boolean) => void;
  onValuesChange?: (v: { budget: string; includeUpcoming?: boolean }) => void;
};

export default function IntakeForm({ onCompletionChange, onValuesChange }: Props) {
  const [budget, setBudget] = useState<string>("");
  const [timeframe, setTimeframe] = useState<string>("");
  const [financing, setFinancing] = useState<string>("");
  const [tradein, setTradein] = useState<string>("");
  const [readiness, setReadiness] = useState<string>("");

  useEffect(() => {
    const complete = !!budget && !!timeframe && !!financing && !!tradein && !!readiness;
    onCompletionChange?.(complete);
  }, [budget, timeframe, financing, tradein, readiness, onCompletionChange]);

  useEffect(() => {
    onValuesChange?.({ budget });
  }, [budget, onValuesChange]);

  return (
    <section className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.logoBox}>
          <Image src="/logos/logo.svg" alt="Logo" fill className={styles.logoImg} priority />
        </div>
        <div className={styles.headerText}>
          <h2 className={styles.title}>Part 1: Essentials</h2>
          <p className={styles.lead}>Answer five quick questions to build a strong starting list.</p>
        </div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label className={styles.label}>Budget</label>
          <div className={styles.options}>
            <label className={styles.option}><input type="radio" name="budget" value="under_35" checked={budget==="under_35"} onChange={(e) => setBudget(e.target.value)} /> Under $35k</label>
            <label className={styles.option}><input type="radio" name="budget" value="35_60" checked={budget==="35_60"} onChange={(e) => setBudget(e.target.value)} /> $35k–$60k</label>
            <label className={styles.option}><input type="radio" name="budget" value="60_120" checked={budget==="60_120"} onChange={(e) => setBudget(e.target.value)} /> $60k–$120k</label>
            <label className={styles.option}><input type="radio" name="budget" value="120_200" checked={budget==="120_200"} onChange={(e) => setBudget(e.target.value)} /> $120k–$200k</label>
            <label className={styles.option}><input type="radio" name="budget" value="200_350" checked={budget==="200_350"} onChange={(e) => setBudget(e.target.value)} /> $200k–$350k</label>
            <label className={styles.option}><input type="radio" name="budget" value="350_plus" checked={budget==="350_plus"} onChange={(e) => setBudget(e.target.value)} /> $350k+</label>
            <label className={styles.option}><input type="radio" name="budget" value="no_strict" checked={budget==="no_strict"} onChange={(e) => setBudget(e.target.value)} /> No strict budget</label>
          </div>
          <p className={styles.help}>Reflects real market distribution where most new vehicles are above $60k, preventing empty matches while keeping lower tiers available.</p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Timeframe</label>
          <div className={styles.options}>
            <label className={styles.option}><input type="radio" name="timeframe" value="month" checked={timeframe==="month"} onChange={(e) => setTimeframe(e.target.value)} /> Within a month</label>
            <label className={styles.option}><input type="radio" name="timeframe" value="1_3" checked={timeframe==="1_3"} onChange={(e) => setTimeframe(e.target.value)} /> 1–3 months</label>
            <label className={styles.option}><input type="radio" name="timeframe" value="3_6" checked={timeframe==="3_6"} onChange={(e) => setTimeframe(e.target.value)} /> 3–6 months</label>
            <label className={styles.option}><input type="radio" name="timeframe" value="browsing" checked={timeframe==="browsing"} onChange={(e) => setTimeframe(e.target.value)} /> Just browsing</label>
          </div>
          <p className={styles.help}>Indicates urgency, influencing how broad or focused the initial list should be.</p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Financing</label>
          <div className={styles.options}>
            <label className={styles.option}><input type="radio" name="financing" value="cash" checked={financing==="cash"} onChange={(e) => setFinancing(e.target.value)} /> Cash</label>
            <label className={styles.option}><input type="radio" name="financing" value="loan" checked={financing==="loan"} onChange={(e) => setFinancing(e.target.value)} /> Loan</label>
            <label className={styles.option}><input type="radio" name="financing" value="lease" checked={financing==="lease"} onChange={(e) => setFinancing(e.target.value)} /> Lease</label>
            <label className={styles.option}><input type="radio" name="financing" value="undecided" checked={financing==="undecided"} onChange={(e) => setFinancing(e.target.value)} /> Not decided</label>
          </div>
          <p className={styles.help}>Aligns payment structure with vehicles commonly available in that arrangement.</p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Trade‑in</label>
          <div className={styles.options}>
            <label className={styles.option}><input type="radio" name="tradein" value="yes" checked={tradein==="yes"} onChange={(e) => setTradein(e.target.value)} /> Yes</label>
            <label className={styles.option}><input type="radio" name="tradein" value="no" checked={tradein==="no"} onChange={(e) => setTradein(e.target.value)} /> No</label>
            <label className={styles.option}><input type="radio" name="tradein" value="unsure" checked={tradein==="unsure"} onChange={(e) => setTradein(e.target.value)} /> Not sure</label>
          </div>
          <p className={styles.help}>Marks whether we should consider offsetting purchase price with trade‑in value.</p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Readiness</label>
          <div className={styles.options}>
            <label className={styles.option}><input type="radio" name="readiness" value="exploring" checked={readiness==="exploring"} onChange={(e) => setReadiness(e.target.value)} /> Exploring</label>
            <label className={styles.option}><input type="radio" name="readiness" value="building" checked={readiness==="building"} onChange={(e) => setReadiness(e.target.value)} /> Building</label>
            <label className={styles.option}><input type="radio" name="readiness" value="buying" checked={readiness==="buying"} onChange={(e) => setReadiness(e.target.value)} /> Buying</label>
          </div>
          <p className={styles.help}>Your stage: Exploring = browsing, Building = comparing, Buying = ready soon.</p>
        </div>
      </div>
    </section>
  );
}
