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

  // doctor fields
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
  access_token?: string;
  token_type?: string;
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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeBackendAuthResponse(data: BackendAuthResponse): AuthResponse {
  const accessToken = data?.token?.access_token ?? data?.access_token;

  if (!accessToken) {
    throw new Error("توکن دسترسی در پاسخ سرور وجود ندارد.");
  }

  if (!data?.user) {
    throw new Error("اطلاعات کاربر در پاسخ سرور وجود ندارد.");
  }

  return {
    access_token: accessToken,
    token_type: data?.token?.token_type ?? data?.token_type ?? "bearer",
    user: data.user,
    message: data.message,
  };
}

/* =========================
   Normalizers
========================= */

export function toEnglishDigits(value: string): string {
  if (!value) return "";

  return String(value)
    .replace(/[۰-۹]/g, (char) => String(char.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (char) => String(char.charCodeAt(0) - 1632));
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
  const baseData: RegisterPayload = {
    role: payload.role,
    name: payload.name?.trim(),
    phone: normalizePhone(payload.phone),
    national_id: normalizeNationalId(payload.national_id),
    password: payload.password,
  };

  if (isNonEmptyString(payload.email)) {
    baseData.email = payload.email.trim();
  }

  if (payload.role !== "doctor") {
    return baseData;
  }

  const doctorData: RegisterPayload = {
    ...baseData,
  };

  if (isNonEmptyString(payload.medical_council_number)) {
    doctorData.medical_council_number = normalizeText(
      payload.medical_council_number,
    );
  }

  if (typeof payload.specialty_id !== "undefined" && payload.specialty_id !== null) {
    const specialtyId = Number(payload.specialty_id);
    if (Number.isFinite(specialtyId) && specialtyId > 0) {
      doctorData.specialty_id = specialtyId;
    }
  }

  if (isNonEmptyString(payload.sub_specialty)) {
    doctorData.sub_specialty = payload.sub_specialty.trim();
  }

  if (isNonEmptyString(payload.province)) {
    doctorData.province = payload.province.trim();
  }

  if (isNonEmptyString(payload.city)) {
    doctorData.city = payload.city.trim();
  }

  if (isNonEmptyString(payload.address)) {
    doctorData.address = payload.address.trim();
  }

  if (isValidNumber(payload.latitude)) {
    doctorData.latitude = payload.latitude;
  }

  if (isValidNumber(payload.longitude)) {
    doctorData.longitude = payload.longitude;
  }

  if (isNonEmptyString(payload.bio)) {
    doctorData.bio = payload.bio.trim();
  }

  if (
    typeof payload.experience_years !== "undefined" &&
    payload.experience_years !== null
  ) {
    const experienceYears = Number(payload.experience_years);
    if (Number.isFinite(experienceYears) && experienceYears >= 0) {
      doctorData.experience_years = experienceYears;
    }
  }

  if (
    typeof payload.consultation_fee !== "undefined" &&
    payload.consultation_fee !== null
  ) {
    const consultationFee = Number(payload.consultation_fee);
    if (Number.isFinite(consultationFee) && consultationFee >= 0) {
      doctorData.consultation_fee = consultationFee;
    }
  }

  if (payload.work_shift) {
    doctorData.work_shift = payload.work_shift;
  }

  if (Array.isArray(payload.work_days) && payload.work_days.length > 0) {
    doctorData.work_days = payload.work_days;
  }

  if (isNonEmptyString(payload.morning_start)) {
    doctorData.morning_start = payload.morning_start.trim();
  }

  if (isNonEmptyString(payload.morning_end)) {
    doctorData.morning_end = payload.morning_end.trim();
  }

  if (isNonEmptyString(payload.afternoon_start)) {
    doctorData.afternoon_start = payload.afternoon_start.trim();
  }

  if (isNonEmptyString(payload.afternoon_end)) {
    doctorData.afternoon_end = payload.afternoon_end.trim();
  }

  if (isNonEmptyString(payload.schedule_start_date)) {
    doctorData.schedule_start_date = normalizeText(payload.schedule_start_date);
  }

  return doctorData;
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
  return Boolean(getAccessToken() && getRole() && getUser());
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(ROLE_KEY, user.role);
  dispatchAuthChange();
}

/* =========================
   Auth APIs
========================= */

export async function requestRegisterOtp(phone: string): Promise<OtpSendResponse> {
  const normalizedPhone = normalizePhone(phone);

  const response = await api.post("/auth/otp/send", {
    phone: normalizedPhone,
  });

  return response.data as OtpSendResponse;
}

export async function registerUser(
  payload: RegisterPayload,
  otp: string,
): Promise<AuthResponse> {
  const normalizedPayload = normalizeRegisterPayload(payload);
  const normalizedOtp = normalizeText(otp).replace(/\D/g, "");

  try {
    const response = await api.post(
      `/auth/register?otp_code=${encodeURIComponent(normalizedOtp)}`,
      normalizedPayload,
    );

    const backendData = response.data as BackendAuthResponse;
    const data = normalizeBackendAuthResponse(backendData);

    saveAuthData(data);
    clearPendingRegisterPayload();

    return data;
  } catch (error: unknown) {
    console.error("🔴 [REGISTER ERROR]:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error
    ) {
      const axiosError = error as {
        response?: {
          data?: unknown;
          status?: number;
        };
      };

      console.error("🔴 [SERVER RESPONSE DATA]:", axiosError.response?.data);
      console.error("🔴 [SERVER STATUS]:", axiosError.response?.status);
      console.error("🔴 [NORMALIZED PAYLOAD]:", normalizedPayload);
      console.error("🔴 [NORMALIZED OTP]:", normalizedOtp);
    }

    throw error;
  }
}

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

export async function loginWithPassword(
  payload: LoginPayload,
): Promise<AuthResponse> {
  return login(payload);
}

export async function getMe(): Promise<AuthUser> {
  const response = await api.get("/auth/me");
  const data = response.data as BackendAuthResponse;

  const user = data?.user;

  if (!user) {
    throw new Error("اطلاعات کاربر در پاسخ سرور وجود ندارد.");
  }

  setStoredUser(user);
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
        .map((item: { loc?: (string | number)[]; msg?: string }) => {
          const field = Array.isArray(item?.loc)
            ? item.loc.join(".")
            : "unknown";
          return `${field}: ${item?.msg || "خطای نامشخص"}`;
        })
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
