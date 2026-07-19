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

type MaybeWrappedAuthUser = AuthUser | { user?: AuthUser };

const ACCESS_TOKEN_KEY = "access_token";
const ROLE_KEY = "role";

// --- Helper Functions ---

function normalizePersianDay(day: string): string {
  // حذف نیم‌فاصله‌ها و فضاهای اضافی برای اطمینان از یکپارچگی داده‌ها
  return day
    .trim()
    .replace(/\u200c/g, " ")
    .replace(/\s+/g, " ");
}

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
  if (!Array.isArray(detail) || detail.length === 0) return null;
  const messages = detail
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      if (!("msg" in item) || typeof item.msg !== "string") return "";
      return item.msg.trim();
    })
    .filter(Boolean);
  return messages.length > 0 ? messages.join(" | ") : null;
}

function normalizeOptionalString(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function extractAuthUser(data: unknown): AuthUser | null {
  if (!data || typeof data !== "object") return null;
  const candidate = data as Partial<AuthResponse> & MaybeWrappedAuthUser;
  if (
    candidate.id && candidate.name && candidate.phone && candidate.role &&
    typeof candidate.id === "number" && typeof candidate.name === "string" &&
    typeof candidate.phone === "string" &&
    (candidate.role === "patient" || candidate.role === "doctor" || candidate.role === "admin")
  ) {
    return candidate as AuthUser;
  }
  if ("user" in candidate && candidate.user && typeof candidate.user === "object") {
    const user = candidate.user as AuthUser;
    if (typeof user.id === "number" && typeof user.name === "string" && typeof user.phone === "string") return user;
  }
  return null;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error && error.message.trim()) return error.message;
    return fallback;
  }
  if (error.code === "ERR_CANCELED") return "درخواست لغو شد.";
  if (error.code === "ECONNABORTED" || error.message.toLowerCase().includes("timeout")) return "زمان پاسخ‌گویی سرور طولانی شد.";
  if (!error.response) return "ارتباط با سرور برقرار نشد.";

  const status = error.response.status;
  const data = error.response.data as ApiErrorResponse | undefined;

  if (status >= 500) return "خطای داخلی سرور رخ داده است.";
  const detail = data?.detail;
  const message = data?.message;
  const genericError = data?.error;

  if (typeof detail === "string") return detail.trim();
  const validationMessage = extractValidationMessages(detail);
  if (validationMessage) return validationMessage;
  if (typeof message === "string") return message.trim();
  if (typeof genericError === "string") return genericError.trim();

  return fallback;
}

function normalizeRegisterPayload(payload: RegisterPayload): NormalizedRegisterPayload {
  const role = payload.role ?? "patient";
  const name = payload.name.trim();
  const phone = payload.phone.trim();

  if (!name || !phone || !payload.password) {
    throw new Error("نام، شماره موبایل و رمز عبور الزامی هستند.");
  }

  const body: NormalizedRegisterPayload = {
    name,
    phone,
    password: payload.password,
    role,
  };

  const email = normalizeOptionalString(payload.email);
  if (email) body.email = email;

  if (role !== "doctor") return body;

  // اعمال نرمال‌سازی روی لیست روزهای کاری
  if (payload.work_days && payload.work_days.length > 0) {
    body.work_days = payload.work_days.map(normalizePersianDay);
  }

  const specialty = normalizeOptionalString(payload.specialty);
  const city = normalizeOptionalString(payload.city);
  const scheduleStartDate = normalizeOptionalString(payload.schedule_start_date);
  const morningStart = normalizeOptionalString(payload.morning_start);
  const morningEnd = normalizeOptionalString(payload.morning_end);
  const afternoonStart = normalizeOptionalString(payload.afternoon_start);
  const afternoonEnd = normalizeOptionalString(payload.afternoon_end);

  if (specialty) body.specialty = specialty;
  if (city) body.city = city;
  if (payload.work_shift) body.work_shift = payload.work_shift;
  if (scheduleStartDate) body.schedule_start_date = scheduleStartDate;
  if (morningStart) body.morning_start = morningStart;
  if (morningEnd) body.morning_end = morningEnd;
  if (afternoonStart) body.afternoon_start = afternoonStart;
  if (afternoonEnd) body.afternoon_end = afternoonEnd;

  return body;
}

function saveAuthData(data: AuthResponse): void {
  if (data.access_token) setAccessToken(data.access_token);
  if (data.user?.role) setRole(data.user.role);
  window.dispatchEvent(new Event("auth-change"));
}

// --- API Methods ---

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  try {
    const requestBody = normalizeRegisterPayload(payload);
    const response = await api.post<AuthResponse>("/auth/register", requestBody);
    saveAuthData(response.data);
    return response.data;
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error, "خطا در ثبت‌نام"));
  }
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const phone = payload.phone?.trim();
    if (!phone || !payload.password) throw new Error("ورود اطلاعات الزامی است.");

    const response = await api.post<AuthResponse>("/auth/login", { phone, password: payload.password });
    saveAuthData(response.data);
    return response.data;
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error, "خطا در ورود"));
  }
}

export async function getMe(): Promise<AuthUser> {
  try {
    const response = await api.get<unknown>("/auth/me");
    const user = extractAuthUser(response.data);
    if (!user) throw new Error("ساختار پاسخ نامعتبر است.");
    return user;
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error, "دریافت اطلاعات کاربر با خطا مواجه شد."));
  }
}

export function logout(): void {
  removeAccessToken();
  removeRole();
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("token");
  window.dispatchEvent(new Event("auth-change"));
}
