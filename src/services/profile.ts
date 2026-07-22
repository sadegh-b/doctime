import api from "./api";

export type UserRole = "patient" | "doctor";

export interface CurrentUserProfile {
  id: number;
  name: string;
  phone: string;
  national_id: string;
  email?: string | null;
  role: UserRole;

  specialty?: string | null;
  city?: string | null;
  address?: string | null;
  bio?: string | null;
  experience_years?: number | null;
  consultation_fee?: number | null;
  work_shift?: string | null;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string | null;
  specialty?: string | null;
  city?: string | null;
  address?: string | null;
  bio?: string | null;
  experience_years?: number | null;
  consultation_fee?: number | null;
  work_shift?: string | null;
}

export async function getMyProfile(): Promise<CurrentUserProfile> {
  const response = await api.get<{ user: CurrentUserProfile }>("/auth/me");
  return response.data.user;
}

export async function updateMyProfile(
  payload: UpdateProfilePayload
): Promise<CurrentUserProfile> {
  const response = await api.patch<{ user: CurrentUserProfile }>(
    "/auth/me",
    payload
  );
  return response.data.user;
}
