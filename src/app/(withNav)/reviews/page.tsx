import { getReviews } from "@db/reviews";

import Reviews from "./Reviews";

export default function ReviewsPage() {
  const reviews = getReviews();
  return <Reviews reviews={reviews} />;
}
