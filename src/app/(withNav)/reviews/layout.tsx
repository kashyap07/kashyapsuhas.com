import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reviews | Suhas Kashyap",
  description:
    "Suhas Kashyap's reviews of movies, products, restaurants, and such",
  openGraph: {
    images: ["/suhas_og.jpg"],
  },
};

interface Props {
  children: React.ReactNode;
}

function ReviewsLayout({ children }: Props) {
  return <>{children}</>;
}

export default ReviewsLayout;
