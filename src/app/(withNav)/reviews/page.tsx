import { getReviews } from '@/db/reviews';

import ReviewsClient from './ReviewsClient';

export default function ReviewsPage() {
  const reviews = getReviews();
  return <ReviewsClient reviews={reviews} />;
}
