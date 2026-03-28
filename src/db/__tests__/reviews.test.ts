import { getReviews } from "../reviews";

describe("getReviews", () => {
  it("should return all reviews with valid schema", () => {
    const reviews = getReviews();
    expect(reviews.length).toBeGreaterThan(0);

    for (const review of reviews) {
      expect(review.name).toBeTruthy();
      expect(review.category).toBeTruthy();
      expect(review.rating).toBeGreaterThanOrEqual(0);
      expect(review.rating).toBeLessThanOrEqual(10);
      expect(typeof review.wouldRecommend).toBe("boolean");
      expect(Array.isArray(review.pros)).toBe(true);
      expect(Array.isArray(review.cons)).toBe(true);
      expect(review.reviewDate).toBeTruthy();
    }
  });

  it("should sort reviews by date descending", () => {
    const reviews = getReviews();
    for (let i = 1; i < reviews.length; i++) {
      const prev = new Date(reviews[i - 1].reviewDate).getTime();
      const curr = new Date(reviews[i].reviewDate).getTime();
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });
});
