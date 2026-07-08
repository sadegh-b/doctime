// src/hooks/useReviews.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDoctorReviews, addReview } from "../services/reviews";
import type { Review, CreateReviewPayload } from "../services/reviews";

export function useReviews(doctorId: number) {
  return useQuery<Review[]>({
    queryKey: ["reviews", doctorId],
    queryFn: () => getDoctorReviews(doctorId),
    enabled: !!doctorId,
  });
}

export function useAddReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewPayload) => addReview(data),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", variables.doctor_id],
      });
    },
  });
}