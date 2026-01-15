import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Smart Car Matching Algorithm – How It Works | CarCupid",
  description:
    "Learn how our multi-layered algorithm combines data, behavior, and common sense to match cars to your lifestyle beyond basic filters.",
};

export default function ScoresLayout({ children }: { children: ReactNode }) {
  return children;
}

