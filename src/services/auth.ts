import api from "./api";

export type UserRole = "patient" | "doctor";

export interface RegisterPayload {
  role: UserRole;
  name: string;
  phone: string;
  national_id: string;
  email?: string;
  password: string;

  // doctor-only optional fields
  medical_council_number?: string;
  specialty_id?: number;
  sub_specialty?: string;
  province?: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  bio?: string;
  experience_years?: number;
  consultation_fee?: number;
  work_shift?: "morning" | "afternoon" | "both";
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

export interface AuthUser {
  id: number | string;
  name: string;
  phone: string;
  role: UserRole;
  email?: string | null;
  is_active?: boolean;

  // doctor fields ممکن است در /me یا login برای پزشک برگردند
  doctor_id?: number;
  medical_council_number?: string;
  specialty_id?: number;
  specialty?: string;
  sub_specialty?: string | null;
  province?: string | null;
  city?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  bio?: string | null;
  experience_years?: number;
  consultation_fee?: number;
  work_shift?: "morning" | "afternoon" | "both" | null;
}

export interface TokenData {
  access_token: string;
  token_type?: string;
}

export interface BackendAuthResponse {
  message?: string;
  user: AuthUser;
  token?: TokenData;
}

export interface AuthResponse {
  access_token: string;
  token_type?: string;
  user: AuthUser;
  message?: string;
}

interface OtpSendResponse {
  success: boolean;
  message: string;
  expires_in_seconds: number;
  code_debug_only?: string;
}

const PENDING_REGISTER_KEY = "pending_register_payload";
const ACCESS_TOKEN_KEY = "access_token";
const USER_KEY = "user";
const ROLE_KEY = "role";

/* =========================
   Helpers
========================= */

function dispatchAuthChange(): void {
  window.dispatchEvent(new Event("auth-change"));
}

function normalizeBackendAuthResponse(data: BackendAuthResponse): AuthResponse {
  const accessToken = data?.token?.access_token;

  if (!accessToken) {
    throw new Error("توکن دسترسی در پاسخ سرور وجود ندارد.");
  }

  return {
    access_token: accessToken,
    token_type: data?.token?.token_type ?? "bearer",
    user: data.user,
    message: data.message,
  };
}

/* =========================
   Normalizers
========================= */

export function toEnglishDigits(value: string): string {
  return String(value ?? "")
    .replace(/[۰-۹]/g, (char) => "۰۱۲۳۴۵۶۷۸۹".indexOf(char).toString())
    .replace(/[٠-٩]/g, (char) => "٠١٢٣٤٥٦٧٨٩".indexOf(char).toString());
}

export function normalizeText(value: string): string {
  return toEnglishDigits(value).trim();
}

export function normalizePhone(value: string): string {
  let phone = normalizeText(value).replace(/\D/g, "");

  if (phone.startsWith("98") && phone.length === 12) {
    phone = `0${phone.slice(2)}`;
  }

  if (phone.startsWith("9") && phone.length === 10) {
    phone = `0${phone}`;
  }

  return phone;
}

export function normalizeNationalId(value: string): string {
  return normalizeText(value).replace(/\D/g, "");
}

function normalizeRegisterPayload(payload: RegisterPayload): RegisterPayload {
  return {
    ...payload,
    name: payload.name?.trim(),
    phone: normalizePhone(payload.phone),
    national_id: normalizeNationalId(payload.national_id),
    email: payload.email?.trim() || undefined,
    password: payload.password,
    medical_council_number: payload.medical_council_number?.trim() || undefined,
    sub_specialty: payload.sub_specialty?.trim() || undefined,
    province: payload.province?.trim() || undefined,
    city: payload.city?.trim() || undefined,
    address: payload.address?.trim() || undefined,
    bio: payload.bio?.trim() || undefined,
    morning_start: payload.morning_start?.trim() || undefined,
    morning_end: payload.morning_end?.trim() || undefined,
    afternoon_start: payload.afternoon_start?.trim() || undefined,
    afternoon_end: payload.afternoon_end?.trim() || undefined,
    schedule_start_date: payload.schedule_start_date?.trim() || undefined,
  };
}

/* =========================
   Pending register storage
========================= */

export function savePendingRegisterPayload(payload: RegisterPayload): void {
  sessionStorage.setItem(PENDING_REGISTER_KEY, JSON.stringify(payload));
}

export function getPendingRegisterPayload(): RegisterPayload | null {
  const raw = sessionStorage.getItem(PENDING_REGISTER_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as RegisterPayload;
  } catch {
    sessionStorage.removeItem(PENDING_REGISTER_KEY);
    return null;
  }
}

export function clearPendingRegisterPayload(): void {
  sessionStorage.removeItem(PENDING_REGISTER_KEY);
}

/* =========================
   Auth storage
========================= */

export function saveAuthData(data: AuthResponse): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  localStorage.setItem(ROLE_KEY, data.user.role);
  dispatchAuthChange();
}

export function clearAuthData(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function logout(): void {
  clearAuthData();
  clearPendingRegisterPayload();
  dispatchAuthChange();
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

/**
 * Legacy compatibility
 */
export function getStoredUser(): AuthUser | null {
  return getUser();
}

export function getRole(): UserRole | null {
  const role = localStorage.getItem(ROLE_KEY);

  if (role === "patient" || role === "doctor") {
    return role;
  }

  const user = getUser();
  if (user?.role === "patient" || user?.role === "doctor") {
    return user.role;
  }

  return null;
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken() && getRole());
}

/* =========================
   Auth APIs
========================= */

/**
 * Backend route:
 * POST /auth/otp/send
 */
export async function requestRegisterOtp(phone: string): Promise<OtpSendResponse> {
  const normalizedPhone = normalizePhone(phone);

  const response = await api.post("/auth/otp/send", {
    phone: normalizedPhone,
  });

  return response.data as OtpSendResponse;
}

/**
 * Backend route:
 * POST /auth/register?otp_code=123456
 *
 * مهم:
 * otp_code در Query است، نه داخل body
 */
export async function registerUser(
  payload: RegisterPayload,
  otp: string,
): Promise<AuthResponse> {
  const normalizedPayload = normalizeRegisterPayload(payload);
  const normalizedOtp = normalizeText(otp).replace(/\D/g, "");

  const response = await api.post(
    `/auth/register?otp_code=${encodeURIComponent(normalizedOtp)}`,
    normalizedPayload,
  );

  const backendData = response.data as BackendAuthResponse;
  const data = normalizeBackendAuthResponse(backendData);

  saveAuthData(data);
  clearPendingRegisterPayload();

  return data;
}

/**
 * Backend route:
 * POST /auth/login
 *
 * Backend response:
 * {
 *   message,
 *   user,
 *   token: { access_token, token_type }
 * }
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await api.post("/auth/login", {
    phone: normalizePhone(payload.phone),
    password: payload.password,
  });

  const backendData = response.data as BackendAuthResponse;
  const data = normalizeBackendAuthResponse(backendData);

  saveAuthData(data);
  return data;
}

/**
 * Alias for older code
 */
export async function loginWithPassword(
  payload: LoginPayload,
): Promise<AuthResponse> {
  return login(payload);
}

/**
 * Backend route:
 * GET /auth/me
 *
 * Backend response:
 * {
 *   message,
 *   user
 * }
 */
export async function getMe(): Promise<AuthUser> {
  const response = await api.get("/auth/me");
  const data = response.data as BackendAuthResponse;

  const user = data?.user;

  if (!user) {
    throw new Error("اطلاعات کاربر در پاسخ سرور وجود ندارد.");
  }

  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (user?.role) {
    localStorage.setItem(ROLE_KEY, user.role);
  }

  dispatchAuthChange();
  return user;
}

/* =========================
   Error handler
========================= */

export function getError(error: unknown): string {
  const fallback = "خطایی رخ داد. دوباره تلاش کنید.";

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  ) {
    const responseData = (error as { response?: { data?: any } }).response?.data;

    if (typeof responseData?.detail === "string") {
      return responseData.detail;
    }

    if (Array.isArray(responseData?.detail)) {
      return responseData.detail
        .map((item: { msg?: string }) => item?.msg || "خطای نامشخص")
        .join(" | ");
    }

    if (typeof responseData?.message === "string") {
      return responseData.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
