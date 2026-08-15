import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Dealers | CarCupid",
  description: "Send high-intent buyers directly to your inventory. CarCupid matches serious buyers to dealers without selling listings or leads.",
};

export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}