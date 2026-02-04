import type { Metadata } from "next";
import "@progress/kendo-theme-default/dist/all.css";
import "./globals.css";
import HeaderVisibility from "../components/HeaderVisibility";
import Footer from "../components/Footer";
import PromoModal from "../components/PromoModal";
import StyledComponentsRegistry from "@/lib/styled-registry";
import { GoogleAnalytics } from '@next/third-parties/google';

export const metadata: Metadata = {
  metadataBase: new URL("https://carcupid.fit"),
  title: {
    default: "CarCupid — Find Your Perfect Car Match",
    template: "%s | CarCupid",
  },
  description: "Personalized car matching powered by real data and behavioral insights.",
  keywords: [
    "CarCupid",
    "car match",
    "auto",
    "compatibility",
    "buying",
    "vehicle",
  ],
  icons: {
    icon: "/logos/logo.svg",
  },
  openGraph: {
    title: "Find Your Perfect Car",
    description: "Find the car that fits your lifestyle.",
    siteName: "CarCupid",
    type: "website",
    images: [
      { 
        url: "/poster.jpg", 
        width: 1200, 
        height: 630, 
        alt: "CarCupid - Find Your Perfect Car Match" 
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Your Perfect Car",
    description: "Find the car that fits your lifestyle.",
    images: ["/poster.jpg"],
  },
};

export const viewport = {
  themeColor: "#0E1B24",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ 
        backgroundColor: "var(--kendo-color-app-surface)", 
        color: "var(--kendo-color-on-app-surface)", 
        fontFamily: "var(--kendo-font-family)", 
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
      </body>
    </html>
  );
}
