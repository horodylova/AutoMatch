import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Car Database – Browse Cars by Make, Body Type & Price | CarCupid",
  description:
    "Explore our car catalog with detailed specs, body types, prices and dimensions. Filter by make, category and budget to discover cars that fit your life.",
};

export default function CarsLayout({ children }: { children: ReactNode }) {
  return children;
}

