import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panchanga | Suhas Kashyap",
  description: "Sankalpa Mantra info",
  openGraph: {
    title: "Panchanga | Suhas Kashyap",
    description: "Sankalpa Mantra info",
    images: [{ url: "/blog/kashyapananda.jpeg" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
