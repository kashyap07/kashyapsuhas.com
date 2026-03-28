import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Background Remover",
  description:
    "Remove image backgrounds instantly using AI. Runs entirely in your browser with U2-Net via WebAssembly.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
