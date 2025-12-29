"use client";

import { useEffect, useState } from "react";
import ResultsGallery, { CarResult } from "../../components/ResultsGallery";
import QuizHeader from "../../components/quiz/QuizHeader";
import ExitModal from "../../components/quiz/modals/ExitModal";
import FeedbackModal from "../../components/quiz/modals/FeedbackModal";
import { useRouter } from "next/navigation";

export default function ResultsPage() {
  const [results, setResults] = useState<CarResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('autoMatch_savedResults');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.expiresAt && parsed.expiresAt > new Date().getTime() && parsed.results) {
          setResults(parsed.results);
        } else {
          // Expired or invalid
          router.replace('/quiz');
        }
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

  if (loading) return <div style={{ minHeight: "100vh", background: "#0e1b24" }}></div>;

  if (results.length === 0) return null;

  return (
    <div style={{ paddingTop: "80px", minHeight: "100vh", background: "#0e1b24" }}>
      <QuizHeader onExit={() => setShowExitModal(true)} />
      
      <ResultsGallery results={results} />

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
