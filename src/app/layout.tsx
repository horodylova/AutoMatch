import type { Metadata } from "next";
import "@progress/kendo-theme-default/dist/all.css";
import "./globals.css";
import Header from "../components/Header";
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
    title: "CarCupid — Find Your Perfect Car Match",
    description: "Personalized car matching powered by real data and behavioral insights.",
    siteName: "CarCupid",
    type: "website",
    images: [
      { url: "/logos/logo.svg", width: 128, height: 128, alt: "CarCupid logo" },
    ],
  },
  twitter: {
    card: "summary",
    title: "CarCupid — Find Your Perfect Car Match",
    description: "Personalized car matching powered by real data and behavioral insights.",
    images: ["/logos/logo.svg"],
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
      <body style={{ backgroundColor: "var(--kendo-color-app-surface)", color: "var(--kendo-color-on-app-surface)", fontFamily: "var(--kendo-font-family)", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <StyledComponentsRegistry>
          <Header />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
