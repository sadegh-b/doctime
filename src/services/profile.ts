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
  // اگر بک‌اند شما فیلدهای زیر را هم ساپورت می‌کند، کامنت آن‌ها را باز کنید:
  // experience_years?: number | null;
  // consultation_fee?: number | null;
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

// تابع گرفتن اطلاعات پروفایل (قبلی)
export async function getMyProfile(): Promise<CurrentUserProfile> {
  const response = await api.get<MeApiResponse>("/auth/me");
  const profile = extractProfile(response.data);

  if (!profile) {
    throw new Error(
      `ساختار پروفایل نامعتبر است. پاسخ سرور: ${JSON.stringify(response.data)}`
    );
  }

  return profile;
}

// تابع جدید برای آپدیت اطلاعات پروفایل
export async function updateMyProfile(data: UpdateProfilePayload): Promise<CurrentUserProfile> {
  // معمولاً آدرس آپدیت پروفایل در متد PUT یا PATCH روی همان مسیر /auth/me یا مسیر مشابه است.
  // اگر بک‌اند شما آدرس دیگری مثل /auth/update دارد، آدرس زیر را تغییر دهید.
  const response = await api.put<MeApiResponse>("/auth/me", data);
  const profile = extractProfile(response.data);

  if (!profile) {
    throw new Error(
      `ساختار پروفایل آپدیت شده نامعتبر است. پاسخ سرور: ${JSON.stringify(response.data)}`
    );
  }

  return profile;
}
