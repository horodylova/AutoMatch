import type { Metadata } from "next";
import "@progress/kendo-theme-default/dist/all.css";
import "./globals.css";
import HeaderVisibility from "../components/HeaderVisibility";
import Footer from "../components/Footer";
import StyledComponentsRegistry from "@/lib/styled-registry";

export const metadata: Metadata = {
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
    title: "Find Your Perfect Car Match",
    description: "Personalized car matching powered by real data and behavioral insights.",
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
    title: "Find Your Perfect Car Match",
    description: "Personalized car matching powered by real data and behavioral insights.",
    images: ["/poster.jpg"],
  },
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
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex", 
        flexDirection: "column" 
      }}>
        <StyledComponentsRegistry>
          <div style={{ 
            flex: 1, 
            display: "flex", 
            flexDirection: "column", 
            overflowY: "auto", 
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            height: "100%"
          }}>
            <HeaderVisibility />
            <main style={{ flex: "1 0 auto" }}>{children}</main>
            <Footer />
          </div>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
