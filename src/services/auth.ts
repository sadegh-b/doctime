import axios from "axios";
import api from "./api";

/* =========================
   Types & Interfaces
========================= */
export type UserRole = "patient" | "doctor";

export interface AuthUser {
  id?: number;
  name: string;
  phone?: string;
  email?: string | null;
  role: UserRole;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface AuthResponse {
  message?: string;
  access_token?: string;
  token_type?: string;
  token?: TokenResponse | null;
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
  email?: string | null;
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
   Storage Keys (Single Source of Truth)
========================= */
const LS_ACCESS_TOKEN = "access_token";
const LS_USER = "user";
const LS_ROLE = "role";

/* =========================
   Utility Methods
========================= */
export function toEnglishDigits(value: string): string {
  if (!value) return "";
  return value
    .replace(/[۰-۹]/g, (char) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(char)))
    .replace(/[٠-٩]/g, (char) => String("٠١٢٣٤٥٦٧٨٩".indexOf(char)));
}

export function normalizePhone(phone: string): string {
  return toEnglishDigits(phone).replace(/\s+/g, "").trim();
}

export function normalizeNationalId(nationalId: string): string {
  return toEnglishDigits(nationalId).replace(/\s+/g, "").trim();
}

/* =========================
   Error Management
========================= */
function extractErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error) return error.message;
    return fallback;
  }

  const detail = error.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d: any) => d.msg || "").join(" | ");

  return error.response?.data?.message || fallback;
}

export function getError(error: unknown): string {
  return extractErrorMessage(error, "خطایی در سیستم رخ داده است.");
}

/* =========================
   Authentication Actions
========================= */
export function getAccessToken(): string | null {
  return localStorage.getItem(LS_ACCESS_TOKEN);
}

export function getRole(): UserRole | null {
  const role = localStorage.getItem(LS_ROLE);
  return role === "patient" || role === "doctor" ? role : null;
}

export function getUser(): AuthUser | null {
  const rawUser = localStorage.getItem(LS_USER);
  if (!rawUser) return null;
  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}

export function saveAuthData(data: AuthResponse): void {
  // استخراج توکن از هر دو فرمت احتمالی سرور
  const token = data.access_token || data.token?.access_token;

  if (!token) {
    throw new Error("Invalid Auth Response: Token missing.");
  }

  localStorage.setItem(LS_ACCESS_TOKEN, token.trim());

  if (data.user) {
    localStorage.setItem(LS_USER, JSON.stringify(data.user));
    localStorage.setItem(LS_ROLE, data.user.role);
  }

  window.dispatchEvent(new Event("auth-change"));
}

export function logout(): void {
  localStorage.clear();
  sessionStorage.clear();
  window.dispatchEvent(new Event("auth-change"));
  window.location.href = "/";
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/* =========================
   API API Methods
========================= */
export async function sendOtp(phone: string): Promise<OTPResponse> {
  try {
    const response = await api.post<OTPResponse>("/auth/otp/send", {
      phone: normalizePhone(phone),
    });
    return response.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "خطا در ارسال کد تایید."));
  }
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/auth/login", {
      phone: normalizePhone(payload.phone),
      password: payload.password,
    });
    saveAuthData(response.data);
    return response.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "خطا در ورود به سیستم."));
  }
}

export async function register(payload: RegisterPayload, otpCode: string): Promise<AuthResponse> {
  try {
    // پاکسازی داده‌ها قبل از ارسال (Data Sanitization)
    const normalized = {
      ...payload,
      phone: normalizePhone(payload.phone),
      national_id: payload.national_id ? normalizeNationalId(payload.national_id) : null,
      email: payload.email?.trim() || null,
      consultation_fee: payload.consultation_fee || 0,
    };

    const response = await api.post<AuthResponse>(
      `/auth/register?otp_code=${encodeURIComponent(otpCode.trim())}`,
      normalized
    );
    saveAuthData(response.data);
    return response.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "خطا در ثبت‌نام کاربر."));
  }
}

export async function getMe(): Promise<AuthUser> {
  try {
    const response = await api.get<AuthResponse>("/auth/me");
    if (response.data.user) {
      localStorage.setItem(LS_USER, JSON.stringify(response.data.user));
    }
    return response.data.user;
  } catch (err) {
    throw new Error(extractErrorMessage(err, "خطا در دریافت اطلاعات پروفایل."));
  }
}
