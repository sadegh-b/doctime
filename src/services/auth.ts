// src/services/auth.ts

import axios from "axios";
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

  // فیلدهای پزشک
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
   Storage Keys
========================= */

const LS_ACCESS_TOKEN = "access_token";
const LS_ROLE = "role";
const LS_USER = "user";

/* =========================
   Digit & Input Normalization
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
   Error Handling
========================= */

function extractErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error && error.message.trim()) return error.message;
    return fallback;
  }

  const detail = error.response?.data?.detail;
  const message = error.response?.data?.message;

  if (typeof detail === "string" && detail.trim()) return detail;

  if (Array.isArray(detail) && detail.length > 0) {
    const validationMessages = detail
      .map((item: any) => (item && typeof item === "object" && "msg" in item ? item.msg : null))
      .filter((msg): msg is string => Boolean(msg));
    if (validationMessages.length > 0) return validationMessages.join(" | ");
  }

  if (typeof message === "string" && message.trim()) return message;

  if (error.response?.status === 401) return "شماره موبایل یا رمز عبور اشتباه است.";
  if (error.response?.status === 403) return "دسترسی شما به این بخش مجاز نیست.";
  if (error.response?.status === 409) return "اطلاعات وارد شده تکراری یا نامعتبر است.";
  if (error.response?.status === 422) return "اطلاعات واردشده صحیح نیست.";

  return fallback;
}

export function getError(error: unknown): string {
  return extractErrorMessage(error, "خطایی رخ داده است.");
}

function getTokenFromAuthResponse(data: AuthResponse): string | null {
  return data.token?.access_token ?? data.access_token ?? null;
}

/* =========================
   Storage Methods
========================= */

export function getAccessToken(): string | null {
  return localStorage.getItem(LS_ACCESS_TOKEN);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(LS_ACCESS_TOKEN, token);
}

export function removeAccessToken(): void {
  localStorage.removeItem(LS_ACCESS_TOKEN);
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
    localStorage.removeItem(LS_USER);
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem(LS_USER, JSON.stringify(user));
  if (user.role === "patient" || user.role === "doctor") {
    localStorage.setItem(LS_ROLE, user.role);
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

export function saveAuthData(data: AuthResponse): void {
  const accessToken = getTokenFromAuthResponse(data);
  if (!accessToken) throw new Error("توکن دسترسی در پاسخ سرور پیدا نشد.");
  setAccessToken(accessToken);
  setStoredUser(data.user);
  window.dispatchEvent(new Event("auth-change"));
}

export function logout(): void {
  removeAccessToken();
  localStorage.removeItem(LS_ROLE);
  localStorage.removeItem(LS_USER);
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  sessionStorage.removeItem("pending_register_payload");
  sessionStorage.removeItem("pending_doctor_details");
  window.dispatchEvent(new Event("auth-change"));
}

/* =========================
   API Methods
========================= */

export async function sendOtp(phone: string): Promise<OTPResponse> {
  try {
    const response = await api.post<OTPResponse>("/auth/otp/send", {
      phone: normalizePhone(phone),
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error, "خطا در ارسال کد تایید."));
  }
}

export async function requestOtp(phone: string): Promise<OTPResponse> {
  return sendOtp(phone);
}

export async function register(
  payload: RegisterPayload,
  otpCode: string
): Promise<AuthResponse> {
  try {
    // تبدیل مقادیر خالی به null واقعی برای جلوگیری از خطای ۴۰۹ در سمت دیتابیس
    const cleanNationalId = payload.national_id?.trim();
    const cleanEmail = payload.email?.trim();

    const normalizedPayload = {
      ...payload,
      name: payload.name.trim(),
      phone: normalizePhone(payload.phone),
      password: payload.password,
      national_id: cleanNationalId === "" ? null : cleanNationalId ? normalizeNationalId(cleanNationalId) : null,
      email: cleanEmail === "" ? null : cleanEmail || null,
      medical_council_number: payload.medical_council_number?.trim() || null,
      specialty_id: payload.specialty_id ?? null,
      province: payload.province?.trim() || null,
      city: payload.city?.trim() || null,
      address: payload.address?.trim() || null,
      consultation_fee: payload.consultation_fee ?? 0,
      work_shift: payload.work_shift ?? null,
      work_days: payload.work_days?.length ? payload.work_days : null,
      schedule_start_date: payload.schedule_start_date?.trim() || null,
      morning_start: payload.morning_start?.trim() || null,
      morning_end: payload.morning_end?.trim() || null,
      afternoon_start: payload.afternoon_start?.trim() || null,
      afternoon_end: payload.afternoon_end?.trim() || null,
    };

    const response = await api.post<AuthResponse>(
      `/auth/register?otp_code=${encodeURIComponent(otpCode.trim())}`,
      normalizedPayload
    );

    const data = response.data;
    saveAuthData(data);
    return data;
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error, "خطا در ثبت‌نام."));
  }
}

export async function registerUser(
  payload: RegisterPayload,
  otpCode: string
): Promise<AuthResponse> {
  return register(payload, otpCode);
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/auth/login", {
      phone: normalizePhone(payload.phone),
      password: payload.password,
    });
    const data = response.data;
    saveAuthData(data);
    return data;
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error, "خطا در ورود."));
  }
}

export async function getMe(): Promise<AuthUser> {
  try {
    const response = await api.get<AuthResponse>("/auth/me");
    setStoredUser(response.data.user);
    return response.data.user;
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error, "خطا در دریافت اطلاعات کاربری."));
  }
}
