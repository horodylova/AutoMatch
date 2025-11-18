import type { Metadata } from "next";
import "./globals.css";

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
      <body>
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>{children}</div>
      </body>
    </html>
  );
}
