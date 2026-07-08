// src/services/reviews.ts

import api from "./api";

export interface Review {
  id: number;
  doctor_id: number;
  patient_name: string;
  comment: string;
  rating: number;
  created_at: string;
}

export interface CreateReviewPayload {
  doctor_id: number;
  patient_name: string;
  comment: string;
  rating: number;
}

export async function getDoctorReviews(doctorId: number): Promise<Review[]> {
  const response = await api.get("/reviews", {
    params: { doctor_id: doctorId },
  });

  return response.data;
}

export async function addReview(data: CreateReviewPayload): Promise<Review> {
  const response = await api.post("/reviews", data);
  return response.data;
}