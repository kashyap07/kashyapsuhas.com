import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Converter",
  description:
    "Convert images between HEIC, JPEG, PNG, and WebP formats directly in your browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
