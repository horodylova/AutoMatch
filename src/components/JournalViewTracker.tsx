"use client";

import { useEffect } from "react";
import { event } from "@/lib/pixel";

export default function JournalViewTracker() {
  useEffect(() => {
    event("JournalView");
  }, []);

  return null;
}
