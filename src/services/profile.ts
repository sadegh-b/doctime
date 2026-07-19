// src/services/profile.ts

import api from "./api";

// تعریف نقش‌های کاربر
// English: User Role (یوزِر رول) - نقش کاربر در سیستم
export type UserRole = "patient" | "doctor";

// ساختار کامل پروفایل کاربر برای دریافت از سرور
// English: Interface (اینتِرفِیس) - ساختار یا قالبی برای داده‌ها
export interface CurrentUserProfile {
  id: number;
  name: string;
  phone: string;
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

// ساختار داده‌ها برای به‌روزرسانی (ارسال به سرور)
// English: Payload (پِی‌لود) - بدنه اصلی داده‌هایی که به سرور ارسال می‌شود
export interface UpdateProfilePayload {
  name?: string;
  specialty?: string;
  city?: string;
  address?: string;
  bio?: string;
  experience_years?: number;
  consultation_fee?: number;
}

/**
 * دریافت اطلاعات پروفایل کاربر فعلی
 * GET /api/v1/auth/me
 */
export async function getMyProfile(): Promise<CurrentUserProfile> {
  const response = await api.get<CurrentUserProfile>("/auth/me");
  return response.data;
}

/**
 * به‌روزرسانی اطلاعات پروفایل
 * PATCH /api/v1/auth/me
 */
export async function updateMyProfile(payload: UpdateProfilePayload): Promise<CurrentUserProfile> {
  // English: Patch Request (پَچ ریکوئِست) - درخواستی برای تغییر جزئی در داده‌ها
  const response = await api.patch<CurrentUserProfile>("/auth/me", payload);
  return response.data;
}
