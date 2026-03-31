import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StarLink Hub – Pay for Starlink Service & Maintenance",
  description: "Secure Starlink internet service and maintenance payment portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
