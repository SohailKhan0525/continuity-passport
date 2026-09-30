import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://continuity-passport.vercel.app"),
  title: "Continuity Passport",
  description:
    "A deterministic handover record for running software from a public GitHub repository.",
  openGraph: {
    title: "Continuity Passport",
    description: "Could someone else run your production tomorrow?",
    type: "website",
    url: "https://continuity-passport.vercel.app",
  },
  twitter: {
    card: "summary",
    title: "Continuity Passport",
    description: "Could someone else run your production tomorrow?",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
