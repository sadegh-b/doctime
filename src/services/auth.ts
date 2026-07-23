// Path: src/services/auth.ts

import axios from "axios";
import api from "./api";

// اضافه شدن نقش ادمین برای تطابق کامل با پایگاه داده بک‌ند
export type UserRole = "patient" | "doctor" | "admin";
export type RegisterRole = "patient" | "doctor";
export type WorkShift = "morning" | "afternoon" | "both";

export interface LoginPayload {
  phone: string;
  password: string;
}

// ساختار دقیق تخصص مطابق با کلیدهای خارجی جدید دیتابیس بک‌ند
export interface SpecialtyInfo {
  id: number;
  name: string;
}

export interface AuthUser {
  id: number;
  name: string;
  phone: string;
  role: UserRole;
  email?: string | null;
  national_id?: string | null;
  // تغییر تخصص به شیء کامل جهت جلوگیری از خطای ناسازگاری فیلد متنی
  specialty?: SpecialtyInfo | null;
  specialty_id?: number | null;
  sub_specialty?: string | null;
  province?: string | null;
  city?: string | null;
  address?: string | null;
  bio?: string | null;
  experience_years?: number | null;
  consultation_fee?: number | null;
  medical_council_number?: string | null;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface AuthResponse {
  message?: string;
  user: AuthUser;
  token: AuthToken;
}

export interface RegisterPayload {
  name: string;
  phone: string;
  password: string;
  role: RegisterRole;

  national_id?: string | null;
  email?: string | null;

  medical_council_number?: string | null;
  // در ثبت‌نام پزشک، آی‌دی تخصص ارسال می‌شود
  specialty_id?: number | null;
  sub_specialty?: string | null;

  province?: string | null;
  city?: string | null;
  address?: string | null;

  bio?: string | null;
  experience_years?: number | null;
  consultation_fee?: number | null;

  work_shift?: WorkShift | null;
  work_days?: string[] | null;

  schedule_start_date?: string | null;

  morning_start?: string | null;
  morning_end?: string | null;

  afternoon_start?: string | null;
  afternoon_end?: string | null;
}

export interface RegisterResponse {
  message?: string;
  user?: AuthUser;
  token?: AuthToken;
}

const ACCESS_TOKEN_KEY = "access_token";
const ROLE_KEY = "role";
const USER_KEY = "user";

function normalizeStoredToken(token: string | null): string | null {
  if (!token) {
    return null;
  }
  // حذف هرگونه کاراکتر نقل‌قول اضافی ناشی از ذخیره‌سازی نادرست
  const normalized = token.trim().replace(/^["']|["']$/g, "");
  return normalized || null;
}

export function getAccessToken(): string | null {
  return normalizeStoredToken(localStorage.getItem(ACCESS_TOKEN_KEY));
}

export const getToken = getAccessToken;

export function getRole(): UserRole | null {
  const role = localStorage.getItem(ROLE_KEY);

  if (role === "patient" || role === "doctor" || role === "admin") {
    return role;
  }

  return null;
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

// بررسی دقیق داده‌ها قبل از ذخیره‌سازی برای جلوگیری از ورود مقادیر undefined و نشت سشن‌های قبلی
function saveAuth(data: AuthResponse | RegisterResponse): void {
  const token = data.token?.access_token;
  const user = data.user;

  if (token && typeof token === "string" && token.trim() !== "") {
    const cleanToken = token.trim();
    localStorage.setItem(ACCESS_TOKEN_KEY, cleanToken);

    // همگام‌سازی فوری هدر Authorization نمونه api جهت ارسال درخواست‌های بعدی بدون مشکل احراز هویت
    if (api.defaults.headers) {
      api.defaults.headers.common["Authorization"] = `Bearer ${cleanToken}`;
    }
  } else {
    // اگر پاسخی دریافتی فاقد توکن معتبر بود، برای امنیت بیشتر توکن‌های پیشین را پاک می‌کنیم
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    if (api.defaults.headers) {
      delete api.defaults.headers.common["Authorization"];
    }
  }

  if (user?.role) {
    localStorage.setItem(ROLE_KEY, user.role);
  } else {
    localStorage.removeItem(ROLE_KEY);
  }

  if (user && typeof user === "object") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }

  window.dispatchEvent(new Event("auth-change"));
}

export function logout(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_KEY);

  // حذف هدر توکن از درخواست‌های Axios بعد از خروج کاربر
  if (api.defaults.headers) {
    delete api.defaults.headers.common["Authorization"];
  }

  window.dispatchEvent(new Event("auth-change"));
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

function stringifyObjectError(obj: unknown): string {
  if (!obj || typeof obj !== "object") {
    return "";
  }

  const record = obj as Record<string, unknown>;

  if (typeof record.message === "string" && record.message.trim()) {
    const parts: string[] = [record.message];

    if (
      Array.isArray(record.missing_fields) &&
      record.missing_fields.length > 0
    ) {
      parts.push(`فیلدهای ناقص: ${record.missing_fields.join(", ")}`);
    }

    if (
      Array.isArray(record.invalid_fields) &&
      record.invalid_fields.length > 0
    ) {
      parts.push(`فیلدهای نامعتبر: ${record.invalid_fields.join(", ")}`);
    }

    return parts.join(" | ");
  }

  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return "خطای ساختاری از سمت سرور دریافت شد.";
  }
}

function extractValidationArray(detail: unknown[]): string {
  return detail
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (item && typeof item === "object") {
        const row = item as {
          loc?: unknown;
          msg?: unknown;
        };

        const loc = Array.isArray(row.loc) ? row.loc.join(" -> ") : "";
        const msg = typeof row.msg === "string" ? row.msg : "Validation error";

        return loc ? `${loc}: ${msg}` : msg;
      }

      return "Validation error";
    })
    .join(" | ");
}

export function getError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      return "پاسخی از سرور دریافت نشد. در حال راه‌اندازی مجدد سرور بک‌اند؛ لطفاً چند لحظه دیگر صفحه را رفرش کنید.";
    }

    const responseData = error.response?.data as
      | {
          detail?: unknown;
          message?: string;
        }
      | undefined;

    if (responseData?.detail !== undefined) {
      const detail = responseData.detail;

      if (typeof detail === "string" && detail.trim()) {
        return detail;
      }

      if (Array.isArray(detail)) {
        return extractValidationArray(detail);
      }

      if (detail && typeof detail === "object") {
        return stringifyObjectError(detail);
      }
    }

    if (
      typeof responseData?.message === "string" &&
      responseData.message.trim()
    ) {
      return responseData.message;
    }

    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }

    return "خطا در ارتباط با سرور";
  }

  if (error instanceof Error) {
    return error.message || "خطا در ارتباط با سرور";
  }

  return "خطا در ارتباط با سرور";
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/auth/login", {
      phone: payload.phone.trim(),
      password: payload.password,
    });

    saveAuth(response.data);
    return response.data;
  } catch (error) {
    throw new Error(getError(error));
  }
}

export async function register(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  try {
    const response = await api.post<RegisterResponse>("/auth/register", payload);

    if (response.data?.token || response.data?.user) {
      saveAuth(response.data);
    }

    return response.data;
  } catch (error) {
    throw new Error(getError(error));
  }
}

export async function getMe(): Promise<AuthUser> {
  try {
    const response = await api.get<AuthUser | { user: AuthUser }>("/auth/me");
    const user = "user" in response.data ? response.data.user : response.data;

    localStorage.setItem(USER_KEY, JSON.stringify(user));

    if (user?.role) {
      localStorage.setItem(ROLE_KEY, user.role);
    }

    window.dispatchEvent(new Event("auth-change"));
    return user;
  } catch (error) {
    throw new Error(getError(error));
  }
}
