"use client";

import React from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import HeaderVisibility from "./HeaderVisibility";
import StyledComponentsRegistry from "@/lib/styled-registry";
import DeferredGoogleAnalytics from "./DeferredGoogleAnalytics";
import DeferredFacebookPixel from "./DeferredFacebookPixel";

const Footer = dynamic(() => import("./Footer"), { ssr: false });
const PromoModal = dynamic(() => import("./PromoModal"), { ssr: false });
const CarListingTimer = dynamic(() => import("./CarListingTimer"), { ssr: false });

type ConsentChoice = "accepted" | "rejected";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/studio");
  const isResults = pathname === "/results";
  const isCars = pathname?.startsWith("/cars");
  const [allowAnalytics, setAllowAnalytics] = React.useState(false);
  const [allowMarketing, setAllowMarketing] = React.useState(false);
  const [consentChoice, setConsentChoice] = React.useState<ConsentChoice | null>(null);
  const [gpcEnabled, setGpcEnabled] = React.useState(false);
  const [afterHydration, setAfterHydration] = React.useState(false);
  const [deferredUI, setDeferredUI] = React.useState(false);

  React.useEffect(() => {
    setAfterHydration(true);
    const schedule = () => setDeferredUI(true);
    if ("requestIdleCallback" in window) {
      (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(schedule, { timeout: 1500 });
    } else {
      setTimeout(schedule, 1200);
    }
    const gpc = typeof navigator !== "undefined" && (navigator as unknown as { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
    setGpcEnabled(gpc);
    const syncConsent = () => {
      try {
        const raw = window.localStorage.getItem("cc_consent_v1");
        if (raw === "accepted" || raw === "rejected") {
          setConsentChoice(raw);
        } else {
          setConsentChoice(null);
        }
      } catch {
        setConsentChoice(null);
      }
    };
    syncConsent();
    window.addEventListener("cc_consent_changed", syncConsent);
    window.addEventListener("storage", syncConsent);
    return () => {
      window.removeEventListener("cc_consent_changed", syncConsent);
      window.removeEventListener("storage", syncConsent);
    };
  }, []);



  React.useEffect(() => {
    const allow = consentChoice === "accepted" && !gpcEnabled;
    setAllowAnalytics(allow);
    setAllowMarketing(allow);
  }, [consentChoice, gpcEnabled]);

  if (isStudio) {
    return (
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    );
  }

  return (
    <body style={{ 
      backgroundColor: "var(--kendo-color-app-surface)", 
      color: "var(--kendo-color-on-app-surface)", 
      fontFamily: "var(--kendo-font-family)", 
      position: "fixed",
      inset: 0,
      overflow: "hidden"
    }}>
      {!isResults && deferredUI && false && <PromoModal />}
      <StyledComponentsRegistry>
        <HeaderVisibility />
        <main id="app-scroll" style={{ 
          height: "100%", 
          overflowY: "auto", 
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          justifyContent: "space-between"
        }}>
          {children}
          {!isResults && deferredUI && <Footer />}
        </main>
      </StyledComponentsRegistry>
      {allowAnalytics ? <DeferredGoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} /> : null}
      {allowMarketing ? <DeferredFacebookPixel /> : null}
      {deferredUI && isCars ? <CarListingTimer /> : null}
      {!isStudio && !isResults && afterHydration && consentChoice === null && (
        <div
          className="cc-banner"
          role="dialog"
          aria-live="polite"
          aria-label="Cookie preferences"
        >
          <div className="cc-banner__inner">
            <div className="cc-banner__top">
              <div className="cc-banner__title">Cookies & tracking</div>
              <a href="/privacy" className="cc-link cc-banner__link">
                Privacy Policy
              </a>
            </div>
            <div className="cc-banner__text">
              We use analytics and marketing trackers (including Google Analytics and Meta Pixel) to measure usage and performance. Choose whether to allow non-essential cookies.
            </div>
            {gpcEnabled && (
              <div className="cc-banner__gpc">
                Global Privacy Control (GPC) is enabled in your browser. We will not enable marketing or analytics tracking for this device.
              </div>
            )}
            <div className="cc-banner__actions">
              <button
                type="button"
                className="cc-btn cc-btn-primary"
                onClick={() => {
                  try {
                    window.localStorage.setItem("cc_consent_v1", "accepted");
                  } catch {
                  }
                  try {
                    window.dispatchEvent(new Event("cc_consent_changed"));
                  } catch {
                  }
                  setConsentChoice("accepted");
                }}
                disabled={gpcEnabled}
              >
                Accept
              </button>
              <button
                type="button"
                className="cc-btn cc-btn-secondary"
                onClick={() => {
                  try {
                    window.localStorage.setItem("cc_consent_v1", "rejected");
                  } catch {
                  }
                  try {
                    window.dispatchEvent(new Event("cc_consent_changed"));
                  } catch {
                  }
                  setConsentChoice("rejected");
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </body>
  );
}
