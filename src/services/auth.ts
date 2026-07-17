import axios from "axios";
import api from "./api";

export type UserRole = "patient" | "doctor" | "admin";
export type RegisterRole = "patient" | "doctor";
export type WorkShift = "morning" | "afternoon" | "both";

export interface RegisterPayload {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role?: RegisterRole;
  specialty?: string;
  city?: string;
  work_shift?: WorkShift;
  work_days?: string[];
  schedule_start_date?: string;
  morning_start?: string;
  morning_end?: string;
  afternoon_start?: string;
  afternoon_end?: string;
}

interface NormalizedRegisterPayload {
  name: string;
  phone: string;
  password: string;
  role: RegisterRole;
  email?: string;
  specialty?: string;
  city?: string;
  work_shift?: WorkShift;
  work_days?: string[];
  schedule_start_date?: string;
  morning_start?: string;
  morning_end?: string;
  afternoon_start?: string;
  afternoon_end?: string;
}

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  role: UserRole;
  is_active?: boolean;
  specialty?: string | null;
  city?: string | null;
  work_shift?: WorkShift | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

interface ApiErrorResponse {
  detail?: unknown;
  message?: unknown;
  error?: unknown;
}

const ACCESS_TOKEN_KEY = "access_token";
const ROLE_KEY = "role";

function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function removeAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

function setRole(role: UserRole): void {
  localStorage.setItem(ROLE_KEY, role);
}

export function getRole(): UserRole | null {
  const role = localStorage.getItem(ROLE_KEY);

  if (role === "patient" || role === "doctor" || role === "admin") {
    return role;
  }

  return null;
}

function removeRole(): void {
  localStorage.removeItem(ROLE_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

function extractValidationMessages(detail: unknown): string | null {
  if (!Array.isArray(detail) || detail.length === 0) {
    return null;
  }

  const messages = detail
    .map((item) => {
      if (!item || typeof item !== "object") {
        return "";
      }

      if (!("msg" in item) || typeof item.msg !== "string") {
        return "";
      }

      return item.msg.trim();
    })
    .filter(Boolean);

  return messages.length > 0 ? messages.join(" | ") : null;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    return fallback;
  }

  if (error.code === "ERR_CANCELED") {
    return "درخواست لغو شد. لطفاً دوباره تلاش کنید.";
  }

  if (
    error.code === "ECONNABORTED" ||
    error.message.toLowerCase().includes("timeout")
  ) {
    return "زمان پاسخ‌گویی سرور بیش از حد طول کشید. لطفاً دوباره تلاش کنید.";
  }

  if (!error.response) {
    return "ارتباط با سرور برقرار نشد. اتصال اینترنت یا وضعیت سرور را بررسی کنید.";
  }

  const status = error.response.status;
  const data = error.response.data as ApiErrorResponse | undefined;

  // جزئیات خطاهای داخلی سرور نباید مستقیماً به کاربر نمایش داده شوند.
  if (status >= 500) {
    return "خطای داخلی سرور رخ داده است. لاگ بک‌اند باید بررسی شود.";
  }

  const detail = data?.detail;
  const message = data?.message;
  const genericError = data?.error;

  if (typeof detail === "string" && detail.trim()) {
    return detail.trim();
  }

  const validationMessage = extractValidationMessages(detail);

  if (validationMessage) {
    return validationMessage;
  }

  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }

  if (typeof genericError === "string" && genericError.trim()) {
    return genericError.trim();
  }

  if (status === 400) {
    return "درخواست نامعتبر است. اطلاعات واردشده را بررسی کنید.";
  }

  if (status === 401) {
    return "شماره موبایل یا رمز عبور اشتباه است.";
  }

  if (status === 403) {
    return "اجازه انجام این عملیات را ندارید.";
  }

  if (status === 404) {
    return "مسیر موردنظر در سرور پیدا نشد.";
  }

  if (status === 409) {
    return "کاربری با این اطلاعات قبلاً ثبت شده است.";
  }

  if (status === 422) {
    return "اطلاعات واردشده صحیح نیست.";
  }

  if (status === 429) {
    return "تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.";
  }

  return fallback;
}

function normalizeRegisterPayload(
  payload: RegisterPayload,
): NormalizedRegisterPayload {
  const role = payload.role ?? "patient";

  const body: NormalizedRegisterPayload = {
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    // رمز عبور را تغییر نده؛ فاصله می‌تواند بخشی از رمز کاربر باشد.
    password: payload.password,
    role,
  };

  const email = payload.email?.trim();

  if (email) {
    body.email = email;
  }

  if (role !== "doctor") {
    return body;
  }

  const specialty = payload.specialty?.trim();
  const city = payload.city?.trim();
  const scheduleStartDate = payload.schedule_start_date?.trim();
  const morningStart = payload.morning_start?.trim();
  const morningEnd = payload.morning_end?.trim();
  const afternoonStart = payload.afternoon_start?.trim();
  const afternoonEnd = payload.afternoon_end?.trim();

  if (specialty) {
    body.specialty = specialty;
  }

  if (city) {
    body.city = city;
  }

  if (payload.work_shift) {
    body.work_shift = payload.work_shift;
  }

  if (payload.work_days?.length) {
    body.work_days = payload.work_days;
  }

  if (scheduleStartDate) {
    body.schedule_start_date = scheduleStartDate;
  }

  if (morningStart) {
    body.morning_start = morningStart;
  }

  if (morningEnd) {
    body.morning_end = morningEnd;
  }

  if (afternoonStart) {
    body.afternoon_start = afternoonStart;
  }

  if (afternoonEnd) {
    body.afternoon_end = afternoonEnd;
  }

  return body;
}

function saveAuthData(data: AuthResponse): void {
  if (data.access_token) {
    setAccessToken(data.access_token);
  }

  if (data.user?.role) {
    setRole(data.user.role);
  }

  window.dispatchEvent(new Event("auth-change"));
}

export async function register(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  try {
    const requestBody = normalizeRegisterPayload(payload);

    if (import.meta.env.DEV) {
      console.log("REGISTER BASE URL:", api.defaults.baseURL);
      console.log("REGISTER REQUEST BODY:", {
        ...requestBody,
        password: "[REDACTED]",
      });
    }

    const response = await api.post<AuthResponse>(
      "/auth/register",
      requestBody,
    );

    const data = response.data;

    saveAuthData(data);

    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && import.meta.env.DEV) {
      console.error("REGISTER STATUS:", error.response?.status);
      console.error("REGISTER RESPONSE DATA:", error.response?.data);
      console.error("REGISTER ERROR CODE:", error.code);
      console.error("REGISTER ERROR MESSAGE:", error.message);
    }

    throw new Error(extractErrorMessage(error, "خطا در ثبت‌نام"));
  }
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  try {
    if (!payload) {
      throw new Error("اطلاعات ورود ارسال نشده است.");
    }

    const phone = payload.phone?.trim();

    if (!phone) {
      throw new Error("شماره موبایل وارد نشده است.");
    }

    if (!payload.password) {
      throw new Error("رمز عبور وارد نشده است.");
    }

    const requestBody: LoginPayload = {
      phone,
      password: payload.password,
    };

    if (import.meta.env.DEV) {
      console.log("LOGIN BASE URL:", api.defaults.baseURL);
      console.log("LOGIN REQUEST BODY:", {
        phone: requestBody.phone,
        password: "[REDACTED]",
      });
    }

    const response = await api.post<AuthResponse>(
      "/auth/login",
      requestBody,
    );

    const data = response.data;

    saveAuthData(data);

    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && import.meta.env.DEV) {
      console.error("LOGIN STATUS:", error.response?.status);
      console.error("LOGIN RESPONSE DATA:", error.response?.data);
      console.error("LOGIN ERROR CODE:", error.code);
      console.error("LOGIN ERROR MESSAGE:", error.message);
    }

    throw new Error(
      extractErrorMessage(error, "خطا در ورود"),
    );
  }
}

export async function getMe(): Promise<AuthUser> {
  try {
    const response = await api.get<AuthUser>("/auth/me");
    return response.data;
  } catch (error: unknown) {
    throw new Error(
      extractErrorMessage(error, "دریافت اطلاعات کاربر با خطا مواجه شد."),
    );
  }
}

export function logout(): void {
  removeAccessToken();
  removeRole();

  // پاک‌سازی کلیدهای قدیمی برای سازگاری با نسخه‌های قبلی برنامه.
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("token");

  window.dispatchEvent(new Event("auth-change"));
}
