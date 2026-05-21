import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panchanga",
  description:
    "Compute accurate Panchanga: samvatsara, ayana, rutu, maasa, paksha, tithi, vaasara, nakshatra. Sankalpa mantra elements for any date.",
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
    "brahmin sandhyavandane sankalpa",
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
