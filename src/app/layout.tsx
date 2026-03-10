import type { Metadata } from "next";
import "@progress/kendo-theme-default/dist/all.css";
import "./globals.css";
import ClientLayout from "../components/ClientLayout";

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
  themeColor: "#1F1F23",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ClientLayout>
        {children}
      </ClientLayout>
    </html>
  );
}
