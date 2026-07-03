import type { Review } from "../services/reviews";

export function calculateRating(reviews: Review[]) {
  if (reviews.length === 0) {
    return {
      rating: 0,
      count: 0
    };
  }

  const total = reviews.reduce((sum, review) => {
    return sum + review.rating;
  }, 0);

  return {
    rating: Number((total / reviews.length).toFixed(1)),
    count: reviews.length
  };
}
