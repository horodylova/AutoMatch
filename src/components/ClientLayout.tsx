"use client";

import React from "react";
import { usePathname } from "next/navigation";
import HeaderVisibility from "./HeaderVisibility";
import Footer from "./Footer";
import PromoModal from "./PromoModal";
import StyledComponentsRegistry from "@/lib/styled-registry";
import { GoogleAnalytics } from '@next/third-parties/google';
import FacebookPixel from "./FacebookPixel";
import CarListingTimer from "./CarListingTimer";

type ConsentChoice = "accepted" | "rejected";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/studio");
  const isResults = pathname === "/results";
  const [allowAnalytics, setAllowAnalytics] = React.useState(false);
  const [allowMarketing, setAllowMarketing] = React.useState(false);
  const [consentChoice, setConsentChoice] = React.useState<ConsentChoice | null>(null);
  const [gpcEnabled, setGpcEnabled] = React.useState(false);

  React.useEffect(() => {
    const gpc = typeof navigator !== "undefined" && (navigator as unknown as { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
    setGpcEnabled(gpc);
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
      {!isResults && <PromoModal />}
      <StyledComponentsRegistry>
        <HeaderVisibility />
        <main style={{ 
          height: "100%", 
          overflowY: "auto", 
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          justifyContent: "space-between"
        }}>
          {children}
          {!isResults && <Footer />}
        </main>
      </StyledComponentsRegistry>
      {allowAnalytics ? <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} /> : null}
      {allowMarketing ? <FacebookPixel /> : null}
      <CarListingTimer />
      {!isStudio && !isResults && consentChoice === null && (
        <div
          style={{
            position: "fixed",
            left: 16,
            right: 16,
            bottom: 16,
            zIndex: 9999,
            background: "var(--kendo-color-surface)",
            color: "var(--kendo-color-on-app-surface)",
            border: "1px solid var(--kendo-color-border-alt)",
            borderRadius: 16,
            boxShadow: "0 14px 40px rgba(0,0,0,0.25)",
            padding: 16,
            maxWidth: 980,
            margin: "0 auto",
          }}
          role="dialog"
          aria-live="polite"
          aria-label="Cookie preferences"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Cookies & tracking</div>
            <div style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.9 }}>
              We use analytics and marketing trackers (including Google Analytics and Meta Pixel) to understand usage and measure performance. Choose whether you want to allow non-essential cookies.
            </div>
            {gpcEnabled && (
              <div style={{ fontSize: 13, lineHeight: 1.4, opacity: 0.85 }}>
                Global Privacy Control (GPC) is enabled in your browser. We will not enable marketing or analytics tracking for this device.
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              <button
                type="button"
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  background: "var(--kendo-color-primary)",
                  color: "var(--kendo-color-on-primary)",
                  fontWeight: 700,
                }}
                onClick={() => {
                  try {
                    window.localStorage.setItem("cc_consent_v1", "accepted");
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
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  border: "1px solid var(--kendo-color-border-alt)",
                  cursor: "pointer",
                  background: "transparent",
                  color: "var(--kendo-color-on-app-surface)",
                  fontWeight: 700,
                }}
                onClick={() => {
                  try {
                    window.localStorage.setItem("cc_consent_v1", "rejected");
                  } catch {
                  }
                  setConsentChoice("rejected");
                }}
              >
                Reject
              </button>
              <a
                href="/privacy"
                style={{
                  marginLeft: 4,
                  fontSize: 14,
                  color: "var(--kendo-color-primary)",
                  textDecoration: "underline",
                  fontWeight: 600,
                }}
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      )}
    </body>
  );
}
