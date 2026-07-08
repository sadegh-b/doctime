// src/components/AddReviewForm.tsx

import { useState } from "react";
import { useAddReview } from "../hooks/useReviews";

interface AddReviewFormProps {
  doctorId: number;
}

export default function AddReviewForm({ doctorId }: AddReviewFormProps) {
  const [patientName, setPatientName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  const addReviewMutation = useAddReview();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim()) {
      alert("نام خود را وارد کنید");
      return;
    }

    if (!comment.trim()) {
      alert("نظر خود را بنویسید");
      return;
    }

    addReviewMutation.mutate(
      {
        doctor_id: doctorId,
        patient_name: patientName.trim(),
        comment: comment.trim(),
        rating,
      },
      {
        onSuccess: () => {
          setPatientName("");
          setComment("");
          setRating(5);
          alert("نظر شما ثبت شد");
        },
        onError: (err: any) => {
          const message =
            err?.response?.data?.detail ||
            err?.response?.data?.message ||
            err?.message ||
            "خطا در ثبت نظر";
          alert(message);
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5"
    >
      <h3 className="text-lg font-bold">ثبت نظر</h3>

      <input
        type="text"
        placeholder="نام شما"
        value={patientName}
        onChange={(e) => setPatientName(e.target.value)}
        className="w-full rounded-xl border px-4 py-3"
      />

      <textarea
        placeholder="نظر خود را بنویسید"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[120px] w-full rounded-xl border px-4 py-3"
      />

      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-600">امتیاز:</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="rounded-xl border px-3 py-2"
        >
          <option value={5}>5 ⭐</option>
          <option value={4}>4 ⭐</option>
          <option value={3}>3 ⭐</option>
          <option value={2}>2 ⭐</option>
          <option value={1}>1 ⭐</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={addReviewMutation.isPending}
        className="rounded-xl bg-blue-600 px-5 py-3 text-white disabled:opacity-60"
      >
        {addReviewMutation.isPending ? "در حال ثبت..." : "ثبت نظر"}
      </button>
    </form>
  );
}