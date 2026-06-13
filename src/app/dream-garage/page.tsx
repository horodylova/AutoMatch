import type { Metadata } from "next";
import DreamGarageClient from "@/components/dream-garage/DreamGarageClient";

export const metadata: Metadata = {
  title: "Dream Garage",
  description: "Build a multi-car garage inside one total budget using your existing AutoMatch vehicle data.",
};

export default function DreamGaragePage() {
  return <DreamGarageClient />;
}
