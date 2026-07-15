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

type ReviewsResponse =
  | Review[]
  | {
      items?: Review[];
      data?: Review[];
      reviews?: Review[];
      results?: Review[];
    };

type SingleReviewResponse =
  | Review
  | {
      item?: Review;
      data?: Review;
      review?: Review;
    };

function normalizeReview(raw: Partial<Review>): Review {
  return {
    id: Number(raw.id ?? 0),
    doctor_id: Number(raw.doctor_id ?? 0),
    patient_name:
      typeof raw.patient_name === "string" && raw.patient_name.trim()
        ? raw.patient_name.trim()
        : "کاربر ناشناس",
    comment:
      typeof raw.comment === "string" && raw.comment.trim()
        ? raw.comment.trim()
        : "بدون متن",
    rating: Number(raw.rating ?? 5),
    created_at: typeof raw.created_at === "string" ? raw.created_at : "",
  };
}

function normalizeReviewsList(data: ReviewsResponse): Review[] {
  if (Array.isArray(data)) {
    return data.map(normalizeReview);
  }

  if (Array.isArray(data.items)) {
    return data.items.map(normalizeReview);
  }

  if (Array.isArray(data.data)) {
    return data.data.map(normalizeReview);
  }

  if (Array.isArray(data.reviews)) {
    return data.reviews.map(normalizeReview);
  }

  if (Array.isArray(data.results)) {
    return data.results.map(normalizeReview);
  }

  return [];
}

function normalizeSingleReview(data: SingleReviewResponse): Review {
  if ("item" in data && data.item) {
    return normalizeReview(data.item);
  }

  if ("data" in data && data.data) {
    return normalizeReview(data.data);
  }

  if ("review" in data && data.review) {
    return normalizeReview(data.review);
  }

  return normalizeReview(data as Review);
}

export async function getDoctorReviews(doctorId: number): Promise<Review[]> {
  const response = await api.get<ReviewsResponse>("reviews", {
    params: { doctor_id: doctorId },
  });

  return normalizeReviewsList(response.data);
}

export async function addReview(data: CreateReviewPayload): Promise<Review> {
  const response = await api.post<SingleReviewResponse>("reviews", {
    doctor_id: data.doctor_id,
    patient_name: data.patient_name.trim(),
    comment: data.comment.trim(),
    rating: data.rating,
  });

  return normalizeSingleReview(response.data);
}
