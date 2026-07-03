import { useState } from "react";
import { useAddReview } from "../hooks/useReviews";

interface Props {
  doctorId: number;
}

export default function AddReviewForm({ doctorId }: Props) {
  const [patientName, setPatientName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  const mutation = useAddReview();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    mutation.mutate({
      doctorId,
      patientName,
      comment,
      rating,
    });

    setPatientName("");
    setComment("");
    setRating(5);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Review</h3>

      <input
        type="text"
        placeholder="Your name"
        value={patientName}
        onChange={(e) => setPatientName(e.target.value)}
        required
      />

      <br />

      <textarea
        placeholder="Write your comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
      />

      <br />

      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      >
        <option value={5}>5 ⭐</option>
        <option value={4}>4 ⭐</option>
        <option value={3}>3 ⭐</option>
        <option value={2}>2 ⭐</option>
        <option value={1}>1 ⭐</option>
      </select>

      <br />

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
