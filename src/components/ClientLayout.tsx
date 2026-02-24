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

  if (isStudio) {
    return (
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    );
  }

  return (
    <body style={{ 
      position: "fixed",
      inset: 0,
      overflow: "hidden"
    }}>
      <PromoModal />
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
          <Footer />
        </main>
      </StyledComponentsRegistry>
      {process.env.NODE_ENV === 'production' && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
      )}
      <FacebookPixel />
      <CarListingTimer />
    </body>
  );
}
