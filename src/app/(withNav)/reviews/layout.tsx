import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reviews | Suhas Kashyap",
  description: "My reviews of movies, products, restaurants, and more.",
  openGraph: {
    images: ["/suhas_og.jpg"],
  },
};

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 