import { Suspense } from "react";

import { getReviews } from "@db/reviews";

export const dynamic = "force-static";

import Reviews from "./Reviews";

export default function ReviewsPage() {
  const reviews = getReviews();
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Reviews reviews={reviews} />
    </Suspense>
  );
}
