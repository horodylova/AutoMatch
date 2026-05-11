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

  React.useEffect(() => {
    const gpcEnabled = typeof navigator !== "undefined" && (navigator as unknown as { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
    const allow = !gpcEnabled;
    setAllowAnalytics(allow);
    setAllowMarketing(allow);
  }, []);

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
    </body>
  );
}
