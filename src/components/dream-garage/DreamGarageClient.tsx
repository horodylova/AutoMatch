"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import EmailModal from "./modals/EmailModal";
import ShareModal, { type ShareNetwork } from "./modals/ShareModal";
import Loader from "@/components/Loader";
import CustomSelect from "./CustomSelect";
import type {
  DreamGarageBay,
  DreamGarageResponse,
  DreamGarageRole,
  DreamGarageSignal,
} from "@/types/dream-garage";
import {
  buildPrefilledBaysFromSignals,
  createDefaultBays,
  DREAM_GARAGE_ROLES,
  getDreamGarageSignals,
  getRoleMeta,
  normalizeBays,
  redistributeAllocations,
} from "@/utils/dream-garage";
import styles from "./dream-garage.module.css";

const BUDGET_PRESETS = [
  { label: "Sensible", value: 110000 },
  { label: "Enthusiast", value: 200000 },
  { label: "Dream", value: 500000 },
];

const GAUGE_TONE_CLASSES = [
  styles.gaugeSegmentTone0,
  styles.gaugeSegmentTone1,
  styles.gaugeSegmentTone2,
  styles.gaugeSegmentTone3,
  styles.gaugeSegmentTone4,
];

function formatMoney(value: number) {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

type ShareableGarageCar = {
  id: string;
  image: string;
  make: string;
  model: string;
  year: string;
  price?: string;
  badges?: string[];
};



export default function DreamGarageClient() {
  const [ready, setReady] = useState(false);
  const [budget, setBudget] = useState(200000);
  const [bays, setBays] = useState<DreamGarageBay[]>(createDefaultBays());
  const [signals, setSignals] = useState<DreamGarageSignal[]>([]);
  const [result, setResult] = useState<DreamGarageResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedShareNetwork, setSelectedShareNetwork] = useState<ShareNetwork | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const detectedSignals = getDreamGarageSignals();
    setSignals(detectedSignals);
    if (detectedSignals.length > 0) {
      setBays(buildPrefilledBaysFromSignals(detectedSignals));
    }
    setReady(true);
  }, []);

  // Bring the cars into view the moment a garage is revealed.
  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const totalAllocatedPct = useMemo(
    () => bays.reduce((sum, bay) => sum + bay.allocationPct, 0),
    [bays]
  );
  const totalVisiblePct = Math.min(totalAllocatedPct, 100);
  const overAllocatedPct = Math.max(totalAllocatedPct - 100, 0);
  const shareableCars = useMemo<ShareableGarageCar[]>(
    () =>
      result?.garage.flatMap((item) =>
        item.car
          ? [
              {
                id: item.car.id,
                image: item.car.image || "/no-image-available.jpg",
                make: item.car.make,
                model: item.car.model,
                year: String(item.car.year),
                price: formatMoney(item.car.price),
                badges: [getRoleMeta(item.role).label],
              },
            ]
          : []
      ) ?? [],
    [result]
  );

  const canAddBay = bays.length < 5;
  const canReveal = totalAllocatedPct <= 100 && bays.length >= 2;

  const handleBudgetPreset = (value: number) => setBudget(value);

  const handleBayRoleChange = (bayId: string, role: DreamGarageRole) => {
    setBays((prev) => prev.map((bay) => (bay.id === bayId ? { ...bay, role } : bay)));
  };

  const handleBayAllocationChange = (bayId: string, allocationPct: number) => {
    setBays((prev) =>
      normalizeBays(
        prev.map((bay) => (bay.id === bayId ? { ...bay, allocationPct } : bay))
      )
    );
  };

  const handleAddBay = () => {
    setBays((prev) => {
      if (prev.length >= 5) return prev;
      const newCount = prev.length + 1;
      return redistributeAllocations(prev, newCount);
    });
  };

  const handleRemoveBay = (bayId: string) => {
    setBays((prev) => {
      if (prev.length <= 2) return prev;
      const newCount = prev.length - 1;
      const remainingBays = prev.filter((bay) => bay.id !== bayId);
      return redistributeAllocations(remainingBays, newCount);
    });
  };

  const handleUseQuizPrefill = () => {
    if (signals.length === 0) return;
    setBays(buildPrefilledBaysFromSignals(signals));
  };

  const handleReset = () => {
    setBudget(200000);
    setBays(createDefaultBays());
    setResult(null);
    setError(null);
    setIsEmailModalOpen(false);
    setSelectedShareNetwork(null);
  };

  const handleReveal = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/garage/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalBudget: budget, bays }),
      });

      const payload = (await response.json()) as DreamGarageResponse | { error?: string };
      if (!response.ok || "error" in payload) {
        throw new Error(("error" in payload && payload.error) || "Failed to build your garage.");
      }

      setResult(payload as DreamGarageResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to build your garage.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareClick = (network: ShareNetwork) => {
    if (shareableCars.length === 0) return;
    setSelectedShareNetwork(network);
  };

  if (!ready) {
    return <Loader label="Loading Dream Garage" />;
  }

  return (
    <div className={styles.page}>
      {/* HERO */}
      <header className={styles.hero}>
        <span className={styles.eyebrow}>Dream Garage</span>
        <h1 className={styles.title}>
          Build the garage you&apos;d actually <em>live with</em>.
        </h1>
        <p className={styles.subtitle}>
          One total budget. Two to five bays. Each bay gets a job, and the matcher
          pulls a real car from your inventory.
        </p>
      </header>

      {/* BUILDER — budget + bays in a single surface */}
      <section className={styles.builder}>
        <div className={styles.budgetBlock}>
          <div className={styles.budgetHead}>
            <div>
              <div className={styles.kicker}>Total budget</div>
              <div className={styles.budgetValue}>{formatMoney(budget)}</div>
            </div>
            <div className={styles.presetRow}>
              {BUDGET_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className={styles.presetButton}
                  aria-pressed={budget === preset.value}
                  onClick={() => handleBudgetPreset(preset.value)}
                >
                  <span>{preset.label}</span>
                  <small>{formatMoney(preset.value)}</small>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.sliderWrap}>
            <input
              className={styles.slider}
              type="range"
              min={50000}
              max={750000}
              step={5000}
              value={budget}
              onChange={(event) => setBudget(Number(event.target.value))}
            />
            <div className={styles.sliderScale}>
              <span>$50k</span>
              <span>$250k</span>
              <span>$500k</span>
              <span>$750k</span>
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.baysBlock}>
          <div className={styles.blockHead}>
            <div>
              <h2 className={styles.blockTitle}>Garage bays</h2>
              <p className={styles.blockText}>
                Give each bay a job and a slice of the budget. The matcher does the rest.
              </p>
            </div>
            <div className={styles.blockActions}>
              {signals.length > 0 && (
                <button type="button" className={styles.secondaryButton} onClick={handleUseQuizPrefill}>
                  Use quiz profile
                </button>
              )}
              <button type="button" className={styles.secondaryButton} onClick={handleReset}>
                Reset
              </button>
              {canAddBay && (
                <button type="button" className={styles.secondaryButton} onClick={handleAddBay}>
                  Add bay
                </button>
              )}
            </div>
          </div>

          <div className={styles.bayGrid}>
            {bays.map((bay, index) => {
              const allocationAmount = Math.round(budget * (bay.allocationPct / 100));
              const roleMeta = getRoleMeta(bay.role);
              return (
                <article key={bay.id} className={styles.bayCard}>
                  <div className={styles.bayTop}>
                    <div className={styles.bayMain}>
                      <div className={styles.bayNumber}>Bay {index + 1}</div>
                      <CustomSelect
                        value={bay.role}
                        onChange={(value) => handleBayRoleChange(bay.id, value as DreamGarageRole)}
                        options={DREAM_GARAGE_ROLES.map((role) => ({
                          value: role.key,
                          label: role.label,
                        }))}
                      />
                      <div className={styles.bayDescription}>{roleMeta.description}</div>
                    </div>
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => handleRemoveBay(bay.id)}
                      disabled={bays.length <= 2}
                    >
                      Remove
                    </button>
                  </div>

                  <div className={styles.allocationRow}>
                    <div className={styles.allocationMoney}>{formatMoney(allocationAmount)}</div>
                    <div className={styles.allocationPct}>{bay.allocationPct}% of total</div>
                  </div>

                  <input
                    className={styles.slider}
                    type="range"
                    min={5}
                    max={80}
                    step={5}
                    value={bay.allocationPct}
                    onChange={(event) =>
                      handleBayAllocationChange(bay.id, Number(event.target.value))
                    }
                  />
                </article>
              );
            })}
          </div>

          <div className={styles.gaugeWrap}>
            <div className={styles.gaugeTop}>
              <div>
                <div className={styles.gaugeEyebrow}>Budget rail</div>
                <div className={styles.gaugeValue}>{totalAllocatedPct}% allocated</div>
              </div>
              <div
                className={`${styles.gaugeStatus} ${totalAllocatedPct > 100 ? styles.gaugeStatusDanger : ""}`}
              >
                {totalAllocatedPct > 100 ? `Over by ${overAllocatedPct}%` : "Balanced and ready"}
              </div>
            </div>
            <div className={styles.gaugeTrack}>
              <div className={styles.gaugeTrackGlow} />
              <div className={styles.gaugeTrackGrid} />
              <div className={styles.gaugeTrackMarkers}>
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
              <div className={styles.gaugeRail} style={{ width: `${totalVisiblePct}%` }}>
                {bays.map((bay, index) => (
                  <div
                    key={bay.id}
                    className={`${styles.gaugeSegment} ${GAUGE_TONE_CLASSES[index % GAUGE_TONE_CLASSES.length]}`}
                    style={{
                      width: `${totalAllocatedPct > 0 ? (bay.allocationPct / totalAllocatedPct) * 100 : 0}%`,
                    }}
                  >
                    <span className={styles.gaugeSegmentText}>B{index + 1}</span>
                  </div>
                ))}
              </div>
              {overAllocatedPct > 0 && (
                <div className={styles.gaugeOverrun} style={{ width: `${Math.min(overAllocatedPct, 24)}%` }}>
                  <span>+{overAllocatedPct}%</span>
                </div>
              )}
            </div>
            <div className={styles.gaugeLegend}>
              {bays.map((bay, index) => (
                <div key={bay.id} className={styles.gaugeLegendItem}>
                  <span
                    className={`${styles.gaugeLegendSwatch} ${GAUGE_TONE_CLASSES[index % GAUGE_TONE_CLASSES.length]}`}
                  />
                  <span className={styles.gaugeLegendText}>
                    Bay {index + 1} · {getRoleMeta(bay.role).label} · {bay.allocationPct}%
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.gaugeMeta}>
              <span>{formatMoney(Math.round((budget * totalVisiblePct) / 100))} inside the rail</span>
              <span>
                {overAllocatedPct > 0
                  ? `${formatMoney(Math.round((budget * overAllocatedPct) / 100))} over the limit`
                  : `${formatMoney(Math.round((budget * (100 - totalAllocatedPct)) / 100))} still free`}
              </span>
            </div>
          </div>

          <div className={styles.ctaRow}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleReveal}
              disabled={!canReveal || isSubmitting}
            >
              {isSubmitting ? "Building..." : "Reveal my garage"}
            </button>
            {!canReveal && (
              <div className={styles.inlineWarning}>
                Keep total allocation at 100% or below and at least 2 bays active.
              </div>
            )}
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}
        </div>
      </section>

      {/* RESULTS — the payoff, directly under the builder */}
      <section className={styles.results} ref={resultsRef}>
        {result ? (
          <>
            <div className={styles.resultsHead}>
              <h2 className={styles.blockTitle}>Your garage</h2>
              <div className={styles.summaryStrip}>
                <div>
                  <span>Budget</span>
                  <strong>{formatMoney(result.totalBudget)}</strong>
                </div>
                <div>
                  <span>Spent</span>
                  <strong>{formatMoney(result.totalSpent)}</strong>
                </div>
                <div>
                  <span>Left over</span>
                  <strong>{formatMoney(result.budgetLeftover)}</strong>
                </div>
              </div>
            </div>

            <div className={styles.resultsGrid}>
              {result.garage.map((item) => (
                <article key={item.bayId} className={styles.resultCard}>
                  <div className={styles.resultHeader}>
                    <div>
                      <div className={styles.resultRole}>{getRoleMeta(item.role).label}</div>
                      <div className={styles.resultBudget}>
                        Bay budget: {formatMoney(item.allocationAmount)}
                      </div>
                    </div>
                    <div className={styles.resultStatus} data-status={item.status}>
                      {item.status === "matched" ? "Matched" : "Unfilled"}
                    </div>
                  </div>

                  {item.car ? (
                    <>
                      <div className={styles.resultImageWrap}>
                        <Image
                          src={item.car.image || "/no-image-available.jpg"}
                          alt={`${item.car.year} ${item.car.make} ${item.car.model}`}
                          fill
                          unoptimized
                          className={styles.resultImage}
                        />
                      </div>
                      <div className={styles.resultName}>
                        {item.car.year} {item.car.make} {item.car.model}
                      </div>
                      <div className={styles.resultTrim}>{item.car.trim || item.car.bodyType}</div>
                      <div className={styles.resultFacts}>
                        <span>{formatMoney(item.car.price)}</span>
                        <span>{item.car.driveType || "Drive n/a"}</span>
                        <span>{item.car.fuelType || "Fuel n/a"}</span>
                      </div>
                      <div className={styles.resultLeftover}>
                        Left in bay: {formatMoney(item.leftover)}
                      </div>
                    </>
                  ) : (
                    <div className={styles.unfilledBox}>
                      {item.reason || "No match returned for this bay yet."}
                    </div>
                  )}
                </article>
              ))}
            </div>

            {shareableCars.length > 0 && (
              <div className={styles.sharePanel}>
                <div className={styles.shareContent}>
                  <div className={styles.shareCopy}>
                    <span className={styles.shareEyebrow}>Share your lineup</span>
                    <h3 className={styles.shareTitle}>A cleaner way to flex the garage you actually built.</h3>
                    <p className={styles.shareText}>
                      Pick a hero car for social, or send the full garage to your inbox and come
                      back later.
                    </p>
                    <div className={styles.shareActions}>
                      <button
                        type="button"
                        className={styles.sharePrimaryButton}
                        onClick={() => setIsEmailModalOpen(true)}
                      >
                        Email this garage
                      </button>
                      <div className={styles.shareSocials} aria-label="Share your garage">
                        <button
                          type="button"
                          className={styles.shareIconButton}
                          onClick={() => handleShareClick("facebook")}
                          aria-label="Share on Facebook"
                        >
                          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className={styles.shareIconButton}
                          onClick={() => handleShareClick("linkedin")}
                          aria-label="Share on LinkedIn"
                        >
                          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className={styles.shareIconButton}
                          onClick={() => handleShareClick("threads")}
                          aria-label="Share on Threads"
                        >
                          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className={styles.shareIconButton}
                          onClick={() => handleShareClick("twitter")}
                          aria-label="Share on X"
                        >
                          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={styles.shareDeck}>
                    <div className={styles.shareDeckHeader}>
                      <div>
                        <div className={styles.shareDeckLabel}>Garage lineup</div>
                        <div className={styles.shareDeckValue}>{shareableCars.length} matched cars</div>
                      </div>
                      <div className={styles.shareDeckMeta}>
                        {formatMoney(result.totalSpent)} parked
                      </div>
                    </div>

                    <div className={styles.shareCarGrid}>
                      {result.garage
                        .filter((item) => item.car)
                        .map((item) => (
                          <article key={`${item.bayId}-share`} className={styles.shareCarCard}>
                            <div className={styles.shareCarImageWrap}>
                              <Image
                                src={item.car?.image || "/no-image-available.jpg"}
                                alt={`${item.car?.year} ${item.car?.make} ${item.car?.model}`}
                                fill
                                unoptimized
                                className={styles.shareCarImage}
                              />
                            </div>
                            <div className={styles.shareCarBody}>
                              <div className={styles.shareCarRole}>{getRoleMeta(item.role).label}</div>
                              <div className={styles.shareCarName}>
                                {item.car?.year} {item.car?.make} {item.car?.model}
                              </div>
                              <div className={styles.shareCarMeta}>
                                <span>{formatMoney(item.car?.price || 0)}</span>
                                <span>{item.car?.trim || item.car?.bodyType}</span>
                              </div>
                            </div>
                          </article>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.resultsPlaceholder}>
            Set your budget, give each bay a job, then hit <strong>Reveal my garage</strong> —
            your matched cars show up right here.
          </div>
        )}
      </section>

      {/* HOW IT WORKS — supporting context, moved to the bottom */}
      <section className={styles.how}>
        <h2 className={styles.howTitle}>How it works</h2>
        <ol className={styles.howSteps}>
          <li className={styles.howStep}>
            <span className={styles.howNum}>1</span>
            <div>
              <div className={styles.howStepTitle}>Set a budget</div>
              <p className={styles.howStepText}>
                Pick a preset or dial in an exact number. It&apos;s the ceiling for the whole
                garage, not per car.
              </p>
            </div>
          </li>
          <li className={styles.howStep}>
            <span className={styles.howNum}>2</span>
            <div>
              <div className={styles.howStepTitle}>Give each bay a job</div>
              <p className={styles.howStepText}>
                Daily, hauler, thrill, statement, explorer or project — plus how much of the
                budget that bay can spend.
              </p>
            </div>
          </li>
          <li className={styles.howStep}>
            <span className={styles.howNum}>3</span>
            <div>
              <div className={styles.howStepTitle}>Reveal the cars</div>
              <p className={styles.howStepText}>
                The matcher searches your inventory and parks a real car in each bay within its
                budget — flagging any bay nothing fits.
              </p>
            </div>
          </li>
        </ol>
      </section>

      {isEmailModalOpen && (
        <EmailModal onClose={() => setIsEmailModalOpen(false)} results={shareableCars} />
      )}

      {selectedShareNetwork && (
        <ShareModal
          results={shareableCars}
          network={selectedShareNetwork}
          onClose={() => setSelectedShareNetwork(null)}
        />
      )}
    </div>
  );
}