import { Suspense } from "react";

import { Wrapper } from "@components/ui";
import { getReviews } from "@db/reviews";

export const dynamic = "force-static";

import Reviews from "./Reviews";

export default function ReviewsPage() {
  const reviews = getReviews();
  return (
    <>
      <Wrapper className="w-full">
        <h1 className="mb-8 text-heading-md font-medium md:text-heading-lg">
          Reviews
        </h1>
      </Wrapper>
      <Suspense fallback={<div>Loading...</div>}>
        <Reviews reviews={reviews} />
      </Suspense>
    </>
  );
}
