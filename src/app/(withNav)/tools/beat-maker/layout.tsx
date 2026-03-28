import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beat Maker",
  description:
    "A browser-based audio sequencer. Create beats with synthesized sounds and record your compositions.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
