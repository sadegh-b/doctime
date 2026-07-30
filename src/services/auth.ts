// مسیر فایل: src/services/auth.ts

import api from "./api";

/* =========================
   Types (exports)
========================= */

export type UserRole = "patient" | "doctor";

export interface AuthUser {
  id?: number;
  name: string;
  phone?: string;
  email?: string | null;
  role: UserRole;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface RegisterPayload {
  name: string;
  phone: string;
  national_id: string;
  password: string;
  role: UserRole;
  email: string | null;
}

export interface DoctorDetails {
  specialty: string;
  national_id: string;
  province: string;
  city: string;
  visit_fee: number;
  work_days: string[];
}

/* =========================
   Helpers
========================= */

export function toEnglishDigits(str: string): string {
  if (!str) return "";
  const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  const arabicNumbers = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];

  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replace(persianNumbers[i], String(i)).replace(arabicNumbers[i], String(i));
  }
  return result;
}

/* =========================
   LocalStorage keys
========================= */

const LS_ACCESS_TOKEN = "access_token";
const LS_ROLE = "role";
const LS_USER = "user";

/* =========================
   API calls
========================= */

export async function requestOtp(phone: string): Promise<{ message: string }> {
  const cleanPhone = toEnglishDigits(phone);
  const response = await api.post("/auth/request-otp", { phone: cleanPhone });
  return response.data;
}

export async function registerUser(payload: RegisterPayload, otpCode: string): Promise<AuthResponse> {
  const normalizedPayload = {
    ...payload,
    phone: toEnglishDigits(payload.phone),
    national_id: toEnglishDigits(payload.national_id),
    // بک‌اندها معمولاً null را برای Optional[str] قبول ندارند؛ "" امن‌تر است.
    email: payload.email ? payload.email : "",
  };

  const response = await api.post(`/auth/register?otp_code=${otpCode}`, normalizedPayload);
  return response.data;
}

export async function completeDoctorProfile(payload: DoctorDetails): Promise<any> {
  const normalizedPayload = {
    ...payload,
    national_id: toEnglishDigits(payload.national_id),
  };
  const response = await api.post("/auth/complete-doctor-profile", normalizedPayload);
  return response.data;
}

/* =========================
   Auth storage functions (exports)
========================= */

export function saveAuthData(data: AuthResponse): void {
  localStorage.setItem(LS_ACCESS_TOKEN, data.access_token);
  localStorage.setItem(LS_ROLE, data.user.role);
  localStorage.setItem(LS_USER, JSON.stringify(data.user));
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem(LS_USER, JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(LS_ACCESS_TOKEN);
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(LS_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getRole(): UserRole | null {
  const role = localStorage.getItem(LS_ROLE);
  if (role === "patient" || role === "doctor") return role;
  return null;
}

export function logout(): void {
  localStorage.removeItem(LS_ACCESS_TOKEN);
  localStorage.removeItem(LS_ROLE);
  localStorage.removeItem(LS_USER);
}
