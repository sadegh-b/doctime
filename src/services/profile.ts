// src/services/profile.ts

import api from "./api";

// تعریف نقش‌های کاربر
export type UserRole = "patient" | "doctor";

// ساختار پروفایل کاربر
export interface CurrentUserProfile {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  role: UserRole;
  specialty?: string | null;
  city?: string | null;
  address?: string | null;
  work_shift?: string | null;
}

// این همان بخشی است که اکسپورت نشده بود و باعث خطا می‌شد
export interface UpdateProfilePayload {
  name?: string;
  specialty?: string;
  city?: string;
  address?: string;
  bio?: string;
  experience_years?: number;
  consultation_fee?: number;
}

// تابع گرفتن پروفایل من
export async function getMyProfile(): Promise<CurrentUserProfile> {
  const response = await api.get<CurrentUserProfile>("/auth/me");
  return response.data;
}

// تابع به‌روزرسانی پروفایل
export async function updateMyProfile(payload: UpdateProfilePayload): Promise<CurrentUserProfile> {
  // بر اساس منطق بک‌اند شما، درخواست به /auth/me ارسال می‌شود
  const response = await api.patch<CurrentUserProfile>("/auth/me", payload);
  return response.data;
}
