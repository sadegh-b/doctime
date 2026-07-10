import api from "./api";

export type CurrentUserProfile = {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  role: "patient" | "doctor" | "admin";
  specialty?: string | null;
  city?: string | null;
  address?: string | null;
};

type MeApiResponse =
  | CurrentUserProfile
  | {
      success?: boolean;
      data?: CurrentUserProfile;
      user?: CurrentUserProfile;
    };

export async function getMyProfile(): Promise<CurrentUserProfile> {
  const response = await api.get<MeApiResponse>("/auth/me");
  const data = response.data;

  if (data && typeof data === "object" && "id" in data) {
    return data as CurrentUserProfile;
  }

  if (data && typeof data === "object" && "data" in data && data.data) {
    return data.data;
  }

  if (data && typeof data === "object" && "user" in data && data.user) {
    return data.user;
  }

  throw new Error("پروفایل کاربر دریافت نشد");
}