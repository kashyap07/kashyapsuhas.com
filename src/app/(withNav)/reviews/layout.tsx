import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Reviews | Suhas Kashyap",
  description:
    "Suhas Kashyap's reviews of movies, products, restaurants, and such",
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
