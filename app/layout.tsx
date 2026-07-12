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
  title: `${site.name} | Commercial & Residential Painting, Handyman Services`,
  description:
    "Z-Handyman delivers professional commercial and residential painting, yard care, and expert handyman services across the Greater Tampa Metro Area. Licensed, insured, and satisfaction guaranteed. Book your free estimate online.",
  keywords: [
    "commercial painting",
    "residential painting",
    "handyman services",
    "yard care",
    "Tampa painting contractor",
  ],
  openGraph: {
    title: `${site.name} | Painting & Property Maintenance`,
    description:
      "Professional commercial & residential painting and handyman services in the Greater Tampa Metro Area.",
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
