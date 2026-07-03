import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDoctorReviews, addReview } from "../services/reviews";
import type { Review } from "../types/review";
import type { CreateReviewPayload } from "../services/reviews";

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

    // ۱. قبل از ارسال درخواست به سرور
    onMutate: async (newReview) => {
      // کنسل کردن درخواست‌های در حال انجام نظرات این پزشک برای جلوگیری از تداخل داده‌ها
      await queryClient.cancelQueries({ queryKey: ["reviews", newReview.doctorId] });

      // ذخیره مقدار قبلی کش نظرات (برای مواقع خطا)
      const previousReviews = queryClient.getQueryData<Review[]>(["reviews", newReview.doctorId]);

      // اضافه کردن نظر جدید به صورت موقت به کش
      queryClient.setQueryData<Review[]>(["reviews", newReview.doctorId], (old) => {
        const optimisticReview: Review = {
          id: Date.now(), // شناسه موقت
          ...newReview,
        };
        return old ? [...old, optimisticReview] : [optimisticReview];
      });

      // بازگرداندن کش قبلی جهت استفاده در صورت خطا
      return { previousReviews };
    },

    // ۲. در صورت بروز خطا در سرور
    onError: (err, newReview, context) => {
      if (context?.previousReviews) {
        // بازگرداندن کش به حالت قبل از خطا (Rollback)
        queryClient.setQueryData(
          ["reviews", newReview.doctorId],
          context.previousReviews
        );
      }
    },

    // ۳. پس از اتمام کار (چه موفقیت‌آمیز، چه با خطا)
    onSettled: (data, error, variables) => {
      // همگام‌سازی نهایی کش با داده‌های واقعی سرور
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.doctorId] });
    },
  });
}
