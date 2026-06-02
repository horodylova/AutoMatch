"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HowItWorks = dynamic(() => import("./HowItWorks"), { ssr: false });
const AdviceBanner = dynamic(() => import("./AdviceBanner"), { ssr: false });
const Stats = dynamic(() => import("./Stats"), { ssr: false });
const CarPersonalities = dynamic(() => import("./CarPersonalities"), { ssr: false });

export default function HomeBelowFold() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const show = () => setMounted(true);
    if ("requestIdleCallback" in window) {
      (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(show, { timeout: 1500 });
    } else {
      setTimeout(show, 1200);
    }
  }, []);

  if (!mounted) return null;

  return (
    <>
      <HowItWorks />
      <AdviceBanner />
      <Stats />
      <CarPersonalities />
    </>
  );
}

