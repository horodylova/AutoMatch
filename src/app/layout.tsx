import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "../styles/kendo-optimized.css";
import ClientLayout from "../components/ClientLayout";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

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
    <html lang="en" className={plusJakartaSans.variable}>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("theme");if(t!=="dark"&&t!=="light"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();',
          }}
        />
      </head>
      <ClientLayout>
        {children}
      </ClientLayout>
    </html>
  );
}
