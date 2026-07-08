// src/components/ReviewsList.tsx

import { useReviews } from "../hooks/useReviews";

interface ReviewsListProps {
  doctorId: number;
}

export default function ReviewsList({ doctorId }: ReviewsListProps) {
  const { data: reviews = [], isLoading, isError } = useReviews(doctorId);

  if (isLoading) {
    return <p className="text-sm text-slate-500">در حال بارگذاری نظرات...</p>;
  }

  if (isError) {
    return <p className="text-sm text-red-500">خطا در دریافت نظرات</p>;
  }

  if (reviews.length === 0) {
    return <p className="text-sm text-slate-500">هنوز نظری ثبت نشده است.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-2 flex items-center justify-between gap-4">
            <strong className="text-slate-800">{review.patient_name}</strong>
            <span className="font-medium text-amber-500">
              {review.rating} ⭐
            </span>
          </div>
          <p className="text-sm leading-7 text-slate-600">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}