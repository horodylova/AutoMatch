import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Car Comparison Tool – Side-by-Side Specs & Features | CarCupid",
  description:
    "Compare two cars side-by-side by horsepower, MPG, dimensions, cargo space, price and more. See key differences instantly to choose the right vehicle.",
};

export default function CompareLayout({ children }: { children: ReactNode }) {
  return children;
}

