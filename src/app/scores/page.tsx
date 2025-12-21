"use client";

import styles from "./scores.module.css";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.articleHeader}>
        <h1 className={styles.title}>How We Built a Smart Car Matching Algorithm</h1>
        <p className={styles.subtitle}>From Simple Weights to a System of Common Sense</p>
      </header>

      <section className={styles.section}>
        <div className={styles.text}>
          When we first started designing our car quiz, the task seemed straightforward:
        </div>
        <div className={styles.highlightBox}>
          <div className={styles.quote}>ask users a few questions → assign weights to categories → rank cars.</div>
        </div>
        <div className={styles.text}>
          But very quickly, we realized something fundamental:
        </div>
        <div className={styles.text} style={{ fontWeight: 600, fontSize: "1.3rem", color: "#fff" }}>
          People don’t choose cars like spreadsheets.
        </div>
        <div className={styles.text}>
          They think in terms of real life:
        </div>
        <div className={styles.highlightBox}>
          <div className={styles.quote}>“I want a small car — not a truck.”</div>
          <div className={styles.quote}>“I don’t want to spend more than I’m comfortable with.”</div>
          <div className={styles.quote}>“I drive kids and clients — a two-seater is not an option.”</div>
          <div className={styles.quote}>“I care about emotion, status, or control.”</div>
        </div>
        <div className={styles.text}>
          If a system ignores those realities, it loses trust instantly. That realization led us to build a multi-layered matching algorithm that combines data-driven scoring, behavioral signals, and hard common-sense rules.
        </div>
      </section>

      <div className={styles.modesContainer} style={{ marginTop: "1rem", marginBottom: "4rem" }}>
        <div className={styles.modeCard}>
          <div className={styles.modeTitle}>1. Raw Data</div>
          <div className={styles.text} style={{ fontSize: "0.9rem", marginBottom: 0 }}>
            Hard specs: HP, MPG, Dimensions, Features.
          </div>
        </div>
        <div className={styles.modeCard}>
          <div className={styles.modeTitle}>2. Preferences</div>
          <div className={styles.text} style={{ fontSize: "0.9rem", marginBottom: 0 }}>
            User priorities, weights, and “nice-to-haves”.
          </div>
        </div>
        <div className={styles.modeCard}>
          <div className={styles.modeTitle}>3. Common Sense</div>
          <div className={styles.text} style={{ fontSize: "0.9rem", marginBottom: 0 }}>
            Hard constraints, logic rules, and deal-breakers.
          </div>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.stepNumber}>Step 1</span>
          Categories as a Foundation — Not the Truth
        </h2>
        <div className={styles.text}>
          At the core of our system are 10 stable categories:
        </div>
        <ul className={styles.list}>
          <li className={styles.listItem}>Practicality & Everyday Usability</li>
          <li className={styles.listItem}>Comfort & Cabin Experience</li>
          <li className={styles.listItem}>Performance & Driving Dynamics</li>
          <li className={styles.listItem}>Efficiency & Running Costs</li>
          <li className={styles.listItem}>Luxury & Status Feel</li>
          <li className={styles.listItem}>Technology & Innovation</li>
          <li className={styles.listItem}>Adventure & Capability</li>
          <li className={styles.listItem}>City-Friendly & Urban Life</li>
          <li className={styles.listItem}>Road-Trip & Long-Distance Comfort</li>
          <li className={styles.listItem}>Reliability & Ownership Confidence</li>
        </ul>
        <div className={styles.text}>
          Each car receives a 0–100 score in every category, derived strictly from real data: dimensions, horsepower, torque, fuel efficiency, pricing, towing capability, wheelbase, warranty coverage, and drivetrain.
        </div>
        <div className={styles.text}>
          This gives us an objective baseline. But categories alone are not enough.
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.stepNumber}>Step 2</span>
          One Answer ≠ One Signal
        </h2>
        <div className={styles.text}>
          We quickly learned that almost no user answer maps to a single dimension. For example:
        </div>
        <ul className={styles.bulletList}>
          <li className={styles.bulletItem}>
            <strong>“I want driving excitement”</strong> affects Performance, but also Comfort, Technology, and even City usability.
          </li>
          <li className={styles.bulletItem}>
            <strong>“I care about status”</strong> touches Luxury, Comfort, and Technology.
          </li>
          <li className={styles.bulletItem}>
            <strong>“I want reliability”</strong> blends Reliability with Practicality.
          </li>
        </ul>
        <div className={styles.text}>
          So each answer in our quiz emits a <strong>Primary</strong> category signal and a <strong>Secondary</strong> category signal (with reduced weight). This approach prevents extreme distortions, preserves nuance, and produces a smoother, more human preference profile.
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.stepNumber}>Step 3</span>
          Normalization and Noise Control
        </h2>
        <div className={styles.text}>
          Users answer different numbers of questions. Some preferences repeat more often than others. To prevent bias, we normalize category weights so that:
        </div>
        <ul className={styles.bulletList}>
          <li className={styles.bulletItem}>The total number of questions does not affect results</li>
          <li className={styles.bulletItem}>Strong opinions don’t overpower everything else</li>
          <li className={styles.bulletItem}>Every user ends up with a comparable preference vector</li>
        </ul>
        <div className={styles.text}>
          The outcome is a stable preference profile, not a pile of clicks.
        </div>
      </section>

      <div className={styles.highlightBox} style={{ margin: "3rem 0", borderLeftColor: "var(--kendo-color-subtle)" }}>
        <div className={styles.quote} style={{ fontStyle: "normal", fontWeight: 600, fontSize: "1.1rem" }}>
          The Goal: Mathematical Fairness. Whether you answer 5 questions or 50, your core preferences hold the same weight in the final score.
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.stepNumber}>Step 4 & 5</span>
          Why Weights Alone Don’t Work & The “Common Sense” Filters
        </h2>
        <div className={styles.text}>
          We ran into a classic recommendation problem: A user chooses “Small & Agile,” but still gets recommended trucks and large SUVs. Why? Because weights change ranking, but they don’t forbid bad matches.
        </div>
        <div className={styles.text}>
          That insight pushed us to the next layer: <strong>Hard “Common Sense” Filters</strong>. We identified a set of questions where being wrong is unacceptable.
        </div>
        
        <div className={styles.modesContainer}>
          <div className={styles.modeCard}>
            <div className={styles.modeTitle}>Size</div>
            <div className={styles.text} style={{ fontSize: "0.95rem" }}>
              If a user chooses “Small”:
              <ul className={styles.bulletList} style={{ marginTop: "0.5rem" }}>
                <li className={styles.bulletItem}>Vehicles longer than ~190 inches are heavily penalized</li>
                <li className={styles.bulletItem}>Trucks, vans, and full-size SUVs nearly disappear</li>
                <li className={styles.bulletItem}>Compact cars receive a meaningful boost</li>
              </ul>
            </div>
          </div>
          <div className={styles.modeCard}>
            <div className={styles.modeTitle}>Fuel Efficiency</div>
            <div className={styles.text} style={{ fontSize: "0.95rem" }}>
              If efficiency is critical:
              <ul className={styles.bulletList} style={{ marginTop: "0.5rem" }}>
                <li className={styles.bulletItem}>ICE vehicles below 30 MPG are almost eliminated</li>
                <li className={styles.bulletItem}>EVs and hybrids rise to the top</li>
              </ul>
            </div>
          </div>
          <div className={styles.modeCard}>
            <div className={styles.modeTitle}>Price</div>
            <div className={styles.text} style={{ fontSize: "0.95rem" }}>
              We adjusted thresholds for 2023–2025:
              <ul className={styles.bulletList} style={{ marginTop: "0.5rem" }}>
                <li className={styles.bulletItem}>“Low cost” no longer means $25k</li>
                <li className={styles.bulletItem}>Penalties start later and scale gradually</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.stepNumber}>Step 6</span>
          Non-Negotiables
        </h2>
        <div className={styles.text}>
          Some constraints are binary. In these cases, there are no trade-offs. A car either fits the lifestyle — or it doesn’t.
        </div>
        <ul className={styles.bulletList}>
          <li className={styles.bulletItem}>If you regularly drive kids or clients → <strong>Minimum 4 seats</strong></li>
          <li className={styles.bulletItem}>If you need cargo space → <strong>Tiny trunks won’t pass</strong></li>
          <li className={styles.bulletItem}>If you care about bad-weather stability → <strong>AWD matters</strong></li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.stepNumber}>Step 7</span>
          Behavioral Modes
        </h2>
        <div className={styles.text}>
          The biggest leap came when we stopped looking at answers individually and started looking for patterns. A person is not a single choice — they are a behavior profile. We introduced dynamic modes that activate only when multiple signals align.
        </div>

        <div className={styles.modesContainer}>
          <div className={styles.modeCard}>
            <div className={styles.modeTitle}>Sport Mode</div>
            <span className={styles.modeSub}>Triggered By</span>
            <div className={styles.text} style={{ fontSize: "0.9rem" }}>Excitement, sound, low driving position, control.</div>
            <span className={styles.modeSub}>Effect</span>
            <div className={styles.text} style={{ fontSize: "0.9rem" }}>Strong boosts for performance cars; penalties for utility-first vehicles.</div>
          </div>
          
          <div className={styles.modeCard}>
            <div className={styles.modeTitle}>Utility Mode</div>
            <span className={styles.modeSub}>Triggered By</span>
            <div className={styles.text} style={{ fontSize: "0.9rem" }}>Work equipment, tools, crew, autonomy.</div>
            <span className={styles.modeSub}>Effect</span>
            <div className={styles.text} style={{ fontSize: "0.9rem" }}>Trucks and vans gain priority; towing and payload matter more.</div>
          </div>

          <div className={styles.modeCard}>
            <div className={styles.modeTitle}>Luxury Mode</div>
            <span className={styles.modeSub}>Triggered By</span>
            <div className={styles.text} style={{ fontSize: "0.9rem" }}>Status, silence, premium interiors, quality.</div>
            <span className={styles.modeSub}>Effect</span>
            <div className={styles.text} style={{ fontSize: "0.9rem" }}>Luxury brands rise; mass-market vehicles de-emphasized.</div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.stepNumber}>Step 8</span>
          Conflict Resolution
        </h2>
        <div className={styles.text}>
          Real people are contradictory. So the system allows multiple modes at once, softens penalties when modes conflict, and enforces a safety floor to prevent soft penalties from erasing otherwise valid cars.
        </div>
        <div className={styles.text}>
          This keeps recommendations flexible, realistic, and non-aggressive.
        </div>
      </section>

      <div className={styles.conclusion}>
        <h2 className={styles.conclusionTitle}>A Matching System That Thinks Like a Human</h2>
        <p className={styles.conclusionText}>
          What we ended up with is not a filter and not a leaderboard. It’s a decision model. Enthusiasts see driver-focused cars. Families never see two-seat sports cars. Professionals get tools, not compromises.
        </p>
        <div className={styles.finalNote}>
          We stopped trying to find the best car. We started matching the right life.
        </div>
      </div>
    </div>
  );
}
