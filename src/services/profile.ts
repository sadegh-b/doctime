import axiosClient from "../api/axiosClient";

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

type MeApiResponse = unknown;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidRole(value: unknown): value is CurrentUserProfile["role"] {
  return value === "patient" || value === "doctor" || value === "admin";
}

function isCurrentUserProfile(value: unknown): value is CurrentUserProfile {
  if (!isObject(value)) return false;

  return (
    typeof value.id === "number" &&
    typeof value.name === "string" &&
    typeof value.phone === "string" &&
    isValidRole(value.role)
  );
}

function extractProfile(data: unknown): CurrentUserProfile | null {
  if (isCurrentUserProfile(data)) {
    return data;
  }

  if (isObject(data) && isCurrentUserProfile(data.data)) {
    return data.data;
  }

  if (isObject(data) && isCurrentUserProfile(data.user)) {
    return data.user;
  }

  return null;
}

export async function getMyProfile(): Promise<CurrentUserProfile> {
  const response = await axiosClient.get<MeApiResponse>("/auth/me");
  const profile = extractProfile(response.data);

  if (!profile) {
    throw new Error(
      `ساختار پروفایل نامعتبر است. پاسخ سرور: ${JSON.stringify(response.data)}`
    );
  }

  return profile;
}
