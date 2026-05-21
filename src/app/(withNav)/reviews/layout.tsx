import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  // re-declare template so /reviews/[slug] still gets "| Suhas Kashyap" appended
  title: {
    default: "Reviews",
    template: "%s | Suhas Kashyap",
  },
  description:
    "Suhas Kashyap's reviews of movies, products, restaurants, and such",
  alternates: {
    canonical: "https://www.kashyapsuhas.com/reviews",
  },
  openGraph: {
    images: ["/kashyapcom-og.png"],
  },
};

interface Props {
  children: ReactNode;
}

function ReviewsLayout({ children }: Props) {
  return <>{children}</>;
}

export default ReviewsLayout;
