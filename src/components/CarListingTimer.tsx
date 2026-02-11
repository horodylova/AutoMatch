"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { event } from "@/lib/pixel";

const TARGET_TIME_MS = 2 * 60 * 1000; // 2 minutes
const STORAGE_KEY_TIME = "pixel_cars_accumulated_ms";
const STORAGE_KEY_SENT = "pixel_cars_event_sent";

export default function CarListingTimer() {
  const pathname = usePathname();

  useEffect(() => {
    // Only track if we are in the cars section
    if (!pathname?.startsWith("/cars")) return;

    // If already sent in this session, do nothing
    if (typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEY_SENT)) return;

    const intervalId = setInterval(() => {
      // Safety check
      if (typeof window === "undefined") return;

      // Check again inside interval
      if (sessionStorage.getItem(STORAGE_KEY_SENT)) {
        clearInterval(intervalId);
        return;
      }

      // Increment time
      const current = parseInt(sessionStorage.getItem(STORAGE_KEY_TIME) || "0", 10);
      const updated = current + 1000;
      sessionStorage.setItem(STORAGE_KEY_TIME, updated.toString());

      // Check threshold
      if (updated >= TARGET_TIME_MS) {
        event("DeepInterest_Cars_2min");
        sessionStorage.setItem(STORAGE_KEY_SENT, "true");
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [pathname]);

  return null;
}
