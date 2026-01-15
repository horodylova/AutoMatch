import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Car Match Quiz – Find Your Perfect Car in Minutes | CarCupid",
  description:
    "Answer a few questions and get car matches based on behavior, lifestyle and real specs – not just filters. No signup required.",
};

export default function QuizLayout({ children }: { children: ReactNode }) {
  return children;
}

