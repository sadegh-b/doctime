import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDoctorReviews, addReview, type Review, type CreateReviewPayload } from "../services/reviews";

/**
 * هوک برای دریافت لیست نظرات پزشک
 */
export function useReviews(doctorId: number) {
  return useQuery<Review[]>({
    queryKey: ["reviews", doctorId],
    queryFn: () => getDoctorReviews(doctorId),
    enabled: Number.isFinite(doctorId) && doctorId > 0,
    retry: false,
  });
}

/**
 * هوک برای ثبت نظر جدید
 */
export function useAddReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => addReview(payload),
    onSuccess: (_, variables) => {
      // بروزرسانی لیست نظرات مربوط به همان پزشک
      queryClient.invalidateQueries({
        queryKey: ["reviews", variables.doctor_id],
      });
    },
  });
}
