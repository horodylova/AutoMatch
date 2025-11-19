import type { Metadata } from "next";
import "@progress/kendo-theme-default/dist/all.css";
import "./globals.css";
import Header from "../components/Header";
import StyledComponentsRegistry from "@/lib/styled-registry";

export const metadata: Metadata = {
  title: "AutoMatch",
  description: "App",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "var(--kendo-color-app-surface)", color: "var(--kendo-color-on-app-surface)", fontFamily: "var(--kendo-font-family)" }}>
        <StyledComponentsRegistry>
          <Header />
          <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: 24, backgroundColor: "var(--kendo-color-app-surface)" }}>{children}</div>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
