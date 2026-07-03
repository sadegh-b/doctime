import { useReviews } from "../hooks/useReviews";

interface ReviewsListProps {
  doctorId: number;
}

export default function ReviewsList({ doctorId }: ReviewsListProps) {
  const { data: reviews, isLoading, isError } = useReviews(doctorId);

  if (isLoading) {
    return <p>Loading reviews...</p>;
  }

  if (isError) {
    return <p>Failed to load reviews</p>;
  }

  if (!reviews || reviews.length === 0) {
    return <p>No reviews yet</p>;
  }

  return (
    <div>
      <h3>Patient Reviews</h3>

      {reviews.map((review) => (
        <div
          key={review.id}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <strong>{review.patientName}</strong>

          <p>Rating: {review.rating} ⭐</p>

          <p>{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
