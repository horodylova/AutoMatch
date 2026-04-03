"use client";

import { useEffect, useState } from "react";
import ResultsGallery, { CarResult } from "../../components/ResultsGallery";
import QuizHeader from "../../components/quiz/QuizHeader";
import ExitModal from "../../components/quiz/modals/ExitModal";
import FeedbackModal from "../../components/quiz/modals/FeedbackModal";
import Loader from "../../components/Loader";
import { useRouter } from "next/navigation";
import { getPreliminarySnapshot, getPreliminaryCandidates } from "../../utils/storage";

export default function ResultsPage() {
  const [results, setResults] = useState<CarResult[]>([]);
  const [prelim, setPrelim] = useState<CarResult[]>([]);
  const [showPrelim, setShowPrelim] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('autoMatch_savedResults');
      const prelimData = getPreliminarySnapshot();
      if (prelimData?.items?.length) {
        const map = (t: { id: string; title: string; image: string; price?: string }): CarResult => {
          let make = t.title || "";
          let model = "";
          let year = "";
          const m = t.title.match(/(.*)\s(\d{4})$/);
          if (m) {
            year = m[2];
            const head = m[1].trim();
            const parts = head.split(/\s+/);
            make = parts[0] || head;
            model = parts.slice(1).join(" ");
          }
          return { id: t.id, image: t.image, make, model, year, price: t.price };
        };
        setPrelim(prelimData.items.map(map));
      }
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.expiresAt && parsed.expiresAt > new Date().getTime() && Array.isArray(parsed.results) && parsed.results.length > 0) {
          const prelimIds = (getPreliminaryCandidates()?.ids || []) as string[];
          const prelimSet = new Set(prelimIds);
          const enriched: CarResult[] = parsed.results.map((r: CarResult) => {
            const badges = prelimSet.has(r.id) ? ["From initial list"] : ["Outside initial list"];
            return { ...r, badges };
          });
          setResults(enriched);
          setShowPrelim(false);
          return;
        }
        // Expired or invalid
        router.replace('/quiz');
      } else {
        router.replace('/quiz');
      }
    } catch (e) {
      console.error("Failed to load results", e);
      router.replace('/quiz');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--kendo-color-app-surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader label="Finding your matches..." />
    </div>
  );

  if (results.length === 0) return null;

  return (
    <div style={{ paddingTop: "80px", minHeight: "100vh", background: "var(--kendo-color-app-surface)" }}>
      <QuizHeader onExit={() => setShowExitModal(true)} />
      
      {showPrelim && prelim.length > 0 ? (
        <ResultsGallery 
          results={prelim}
          onSaveProgress={() => router.push('/cars')}
        />
      ) : (
        <ResultsGallery 
          results={results} 
          onBack={() => {
            try {
              if (typeof window !== "undefined") {
                window.localStorage.setItem("autoMatch_openInterim", "results");
              }
            } catch {}
            router.push('/quiz');
          }}
          onSaveProgress={() => router.push('/cars')}
        />
      )}

      {showExitModal && (
        <ExitModal 
          onCancel={() => setShowExitModal(false)} 
          destination="/"
          onConfirm={() => {
            setShowExitModal(false);
            setShowFeedbackModal(true);
          }}
        />
      )}

      {showFeedbackModal && (
        <FeedbackModal 
          onClose={() => setShowFeedbackModal(false)} 
          destination="/" 
        />
      )}
    </div>
  );
}
