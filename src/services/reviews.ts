// src/services/reviews.ts

import api from "./api";
import type { Review } from "../types/review";

export type CreateReviewPayload = Omit<Review, "id">;

/**
 * دریافت نظرات مربوط به یک پزشک خاص
 */
export async function getDoctorReviews(
  doctorId: number
): Promise<Review[]> {
  const response = await api.get<Review[]>("/reviews/", {
    params: {
      doctorId,
    },
  });

  return response.data;
}

/**
 * ثبت یک نظر جدید برای پزشک
 */
export async function addReview(
  review: CreateReviewPayload
): Promise<Review> {
  const response = await api.post<Review>("/reviews/", review);

  return response.data;
}
