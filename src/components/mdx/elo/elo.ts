// expected score for player A against player B
export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

// new rating after a match
// actual: 1 = win, 0 = loss
export function newRating(
  rating: number,
  expected: number,
  actual: number,
  kFactor = 32,
): number {
  return Math.round(rating + kFactor * (actual - expected));
}
