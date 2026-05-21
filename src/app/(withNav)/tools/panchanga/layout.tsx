import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panchanga",
  description:
    "Compute the current Panchanga: samvatsara, ayana, ritu, maasa, paksha, tithi, vaasara, nakshatra. Sankalpa mantra elements for any date.",
  alternates: {
    canonical: "https://www.kashyapsuhas.com/tools/panchanga",
  },
  keywords: [
    "panchanga",
    "sankalpa mantra",
    "tithi calculator",
    "nakshatra today",
    "vedic calendar",
    "lahiri ayanamsha",
  ],
  openGraph: {
    title: "Panchanga",
    description: "Sankalpa Mantra info",
    images: [{ url: "/blog/kashyapananda.jpeg" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
