import type { Metadata } from "next";
import "@progress/kendo-theme-default/dist/all.css";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import StyledComponentsRegistry from "@/lib/styled-registry";

export const metadata: Metadata = {
  title: "AutoMatch",
  description: "App",
  icons: {
    icon: "/logos/logo.svg",
  },
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
