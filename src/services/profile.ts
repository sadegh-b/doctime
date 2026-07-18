// مسیر فایل: src/services/profile.ts
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

// تایپ داده‌های ارسالی برای ویرایش پروفایل
export type UpdateProfilePayload = {
  name?: string;
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
  if (!isObject(value)) {
    return false;
  }

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

// تابع گرفتن اطلاعات پروفایل
export async function getMyProfile(): Promise<CurrentUserProfile> {
  try {
    const response = await api.get<MeApiResponse>("/auth/me");
    const profile = extractProfile(response.data);

    if (!profile) {
      throw new Error(
        `ساختار پروفایل نامعتبر است. پاسخ سرور: ${JSON.stringify(response.data)}`
      );
    }

    return profile;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("GET PROFILE ERROR:", error);
    }
    throw error;
  }
}

// تابع جدید برای آپدیت اطلاعات پروفایل
export async function updateMyProfile(data: UpdateProfilePayload): Promise<CurrentUserProfile> {
  try {
    if (import.meta.env.DEV) {
      console.log("UPDATE PROFILE PAYLOAD:", data);
    }

    const response = await api.put<MeApiResponse>("/auth/me", data);
    const profile = extractProfile(response.data);

    if (!profile) {
      throw new Error(
        `ساختار پروفایل آپدیت شده نامعتبر است. پاسخ سرور: ${JSON.stringify(response.data)}`
      );
    }

    return profile;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("UPDATE PROFILE ERROR:", error);
    }
    throw error;
  }
}
