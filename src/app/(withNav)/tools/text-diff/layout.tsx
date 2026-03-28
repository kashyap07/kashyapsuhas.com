import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text Diff",
  description:
    "Compare two blocks of text and see the differences highlighted inline.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
