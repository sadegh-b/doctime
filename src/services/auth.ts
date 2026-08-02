// Path: src/services/auth.ts

import api from "./api";

/* =========================
   Types
========================= */

export type UserRole = "patient" | "doctor";

export interface AuthUser {
  id?: number;
  name: string;
  phone?: string;
  email?: string | null;
  role: UserRole;
}

// شکل پاسخ رجیستر/لاگین ممکن است flat باشد ({access_token, token_type})
// یا nested داخل "token" ({token: {access_token, token_type}}).
// هر دو حالت پشتیبانی می‌شود تا وابسته به فرمت دقیق بک‌اند نباشیم.
export interface AuthResponse {
  message?: string;

  access_token?: string;
  token_type?: string;

  token?: {
    access_token?: string;
    token_type?: string;
  };

  user: AuthUser;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  expires_in_seconds: number;
  code_debug_only?: string;
}

export interface RegisterPayload {
  name: string;
  phone: string;
  national_id?: string;
  password: string;
  role: UserRole;
  email: string | null;

  // فیلدهای تخصصی پزشک - فقط وقتی role === "doctor" پر می‌شوند
  medical_council_number?: string;
  specialty_id?: number;
  province?: string;
  city?: string;
  address?: string;
  consultation_fee?: number;
  work_shift?: string;
  work_days?: string[];
  morning_start?: string;
  morning_end?: string;
  afternoon_start?: string;
  afternoon_end?: string;
  schedule_start_date?: string;
}

export interface LoginPayload {
  phone: string;
  password: string;
}

/* =========================
   Local Storage Keys
========================= */

const LS_ACCESS_TOKEN = "access_token";
const LS_ROLE = "role";
const LS_USER = "user";

/* =========================
   Helpers
========================= */

export function toEnglishDigits(value: string): string {
  if (!value) return "";

  return value
    .replace(/[۰-۹]/g, (c) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(c)))
    .replace(/[٠-٩]/g, (c) => String("٠١٢٣٤٥٦٧٨٩".indexOf(c)));
}

export function normalizePhone(phone: string): string {
  return toEnglishDigits(phone).replace(/\s+/g, "").trim();
}

export function normalizeNationalId(id: string): string {
  return toEnglishDigits(id).replace(/\s+/g, "").trim();
}

export function getError(error: any): string {
  if (Array.isArray(error?.response?.data?.detail)) {
    return error.response.data.detail
      .map((item: any) => item.msg)
      .join(" | ");
  }

  return (
    error?.response?.data?.detail ||
    error?.message ||
    "خطایی رخ داده است."
  );
}

/* =========================
   API
========================= */

export async function requestOtp(phone: string): Promise<OTPResponse> {
  const { data } = await api.post("/auth/otp/send", {
    phone: normalizePhone(phone),
  });

  return data;
}

export async function login(
  payload: LoginPayload
): Promise<AuthResponse> {
  const { data } = await api.post("/auth/login", {
    phone: normalizePhone(payload.phone),
    password: payload.password,
  });

  console.log(
    "LOGIN RESPONSE DATA JSON:",
    JSON.stringify(data, null, 2)
  );

  return data;
}

export async function registerUser(
  payload: RegisterPayload,
  otpCode: string
): Promise<AuthResponse> {
  // تمام فیلدهای payload (شامل فیلدهای تخصصی پزشک در صورت وجود) عیناً ارسال می‌شود
  // فقط فیلدهای متنی حساس (تلفن، کد ملی، نام) نرمال‌سازی می‌شوند
  const body = {
    ...payload,
    name: payload.name.trim(),
    phone: normalizePhone(payload.phone),
    national_id: payload.national_id
      ? normalizeNationalId(payload.national_id)
      : payload.national_id,
    email: payload.email ?? null,
  };

  const { data } = await api.post(
    `/auth/register?otp_code=${encodeURIComponent(otpCode)}`,
    body
  );

  // لاگ موقت برای دیدن شکل دقیق پاسخ بک‌اند - بعد از رفع مشکل قابل حذف است
  console.log("REGISTER RESPONSE DATA:", data);

  return data;
}

/* =========================
   Storage
========================= */

export function saveAuthData(data: AuthResponse): void {
  console.log(
    "SAVE AUTH DATA:",
    JSON.stringify(data, null, 2)
  );

  const accessToken = data.access_token ?? data.token?.access_token;

  if (!accessToken) {
    console.warn("saveAuthData: access_token پیدا نشد", data);
    return;
  }

  localStorage.setItem(LS_ACCESS_TOKEN, accessToken);
  localStorage.setItem(LS_ROLE, data.user.role);
  localStorage.setItem(LS_USER, JSON.stringify(data.user));
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem(LS_USER, JSON.stringify(user));
}

export function getAccessToken(): string | null {
  return localStorage.getItem(LS_ACCESS_TOKEN);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(LS_ACCESS_TOKEN, token);
}

export function removeAccessToken(): void {
  localStorage.removeItem(LS_ACCESS_TOKEN);
}

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  return !!token;
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(LS_USER);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getRole(): UserRole | null {
  const role = localStorage.getItem(LS_ROLE);

  if (role === "patient" || role === "doctor") {
    return role;
  }

  return null;
}

export function logout(): void {
  removeAccessToken();
  localStorage.removeItem(LS_ROLE);
  localStorage.removeItem(LS_USER);
  sessionStorage.removeItem("pending_register_payload");
  sessionStorage.removeItem("pending_doctor_details");
}