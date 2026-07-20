import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  // Placeholder domain — update once the production domain is connected on Vercel.
  metadataBase: new URL("https://z-handyman.vercel.app"),
  title: `${site.name} | Commercial Painting Specialists — Price Match Guarantee`,
  description:
    "Z-Handyman is Tampa Bay's commercial painting specialist — backed by a Price Match Guarantee and 3-Year Workmanship Warranty. Residential painting, landscape design & installation, and remodel carpentry too. Book your free estimate online.",
  keywords: [
    "commercial painting",
    "commercial painting contractor Tampa",
    "residential painting",
    "price match painting",
    "landscape design installation",
    "remodel handyman",
    "Tampa painting contractor",
  ],
  openGraph: {
    title: `${site.name} | Commercial Painting Specialists`,
    description:
      "Commercial & residential painting backed by a Price Match Guarantee and 3-Year Workmanship Warranty in the Greater Tampa Metro Area.",
    type: "website",
    images: [{ url: "/images/hero.jpg" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e3a8a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
