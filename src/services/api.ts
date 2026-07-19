// doctime-frontend/src/services/api.ts

import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";

// -----------------------------------------------------------------------------
// API configuration
// -----------------------------------------------------------------------------

const DEFAULT_API_BASE_URL =
  "https://doctime-backend-5b74.onrender.com/api/v1";

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
);

const REQUEST_TIMEOUT_MS = 30000;
const WAKE_TIMEOUT_MS = 60000;

// -----------------------------------------------------------------------------
// Local storage keys
// -----------------------------------------------------------------------------

const ACCESS_TOKEN_KEY = "access_token";
const USER_KEY = "user";
const ROLE_KEY = "role";

// -----------------------------------------------------------------------------
// Public pages
// -----------------------------------------------------------------------------

const PUBLIC_AUTH_PATHS = ["/login", "/register"];

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type UserRole = "patient" | "doctor" | "admin";

export type WorkShift = "morning" | "afternoon" | "both";

export interface UserResponse {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  role: UserRole;
  is_active: boolean;
  specialty: string | null;
  city: string | null;
  address: string | null;
  work_shift: WorkShift | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export interface UserLoginPayload {
  phone: string;
  password: string;
}

export interface UserRegisterPayload {
  name: string;
  phone: string;
  password: string;
  role: UserRole;
  email?: string | null;
  specialty?: string | null;
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

export interface UpdateProfilePayload {
  name?: string;
  specialty?: string;
  city?: string;
  address?: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  api_version: string;
}

export interface ApiErrorResponse {
  detail?: string | ValidationErrorItem[];
  message?: string;
}

export interface ValidationErrorItem {
  loc?: Array<string | number>;
  msg?: string;
  type?: string;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser(): UserResponse | null {
  if (!isBrowser()) return null;

  const storedUser = window.localStorage.getItem(USER_KEY);
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as UserResponse;
  } catch (error) {
    console.error("Failed to parse stored user:", error);
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.removeItem(ROLE_KEY);
    return null;
  }
}

export function getStoredRole(): UserRole | null {
  if (!isBrowser()) return null;

  const role = window.localStorage.getItem(ROLE_KEY);

  if (role === "patient" || role === "doctor" || role === "admin") {
    return role;
  }

  return null;
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

export function storeAuthData(authData: AuthResponse): void {
  if (!isBrowser()) return;

  window.localStorage.setItem(ACCESS_TOKEN_KEY, authData.access_token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(authData.user));
  window.localStorage.setItem(ROLE_KEY, authData.user.role);
}

export function storeUserData(user: UserResponse): void {
  if (!isBrowser()) return;

  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.localStorage.setItem(ROLE_KEY, user.role);
}

export function clearAuthData(): void {
  if (!isBrowser()) return;

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(ROLE_KEY);
}

// -----------------------------------------------------------------------------
// Axios instance
// -----------------------------------------------------------------------------

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// -----------------------------------------------------------------------------
// Request interceptor
// -----------------------------------------------------------------------------

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const accessToken = getAccessToken();

    if (accessToken) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }

      config.headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// -----------------------------------------------------------------------------
// Response interceptor
// -----------------------------------------------------------------------------

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const responseStatus = error.response?.status;

    if (responseStatus === 401) {
      clearAuthData();

      if (isBrowser()) {
        const currentPath = window.location.pathname;

        const isPublicPage = PUBLIC_AUTH_PATHS.some(
          (publicPath) =>
            currentPath === publicPath ||
            currentPath.startsWith(`${publicPath}/`),
        );

        if (!isPublicPage) {
          window.location.replace("/login");
        }
      }
    }

    return Promise.reject(error);
  },
);

// -----------------------------------------------------------------------------
// Error helper
// -----------------------------------------------------------------------------

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = "خطایی غیرمنتظره رخ داد.",
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallbackMessage;
  }

  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return "زمان پاسخ‌گویی سرور به پایان رسید. دوباره تلاش کنید.";
    }

    return "ارتباط با سرور برقرار نشد. اتصال اینترنت یا وضعیت سرور را بررسی کنید.";
  }

  const responseData = error.response.data;
  const detail = responseData?.detail;

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const validationMessages = detail
      .map((item) => item.msg)
      .filter(
        (message): message is string =>
          typeof message === "string" && message.length > 0,
      );

    if (validationMessages.length > 0) {
      return validationMessages.join("، ");
    }
  }

  if (
    typeof responseData?.message === "string" &&
    responseData.message.trim()
  ) {
    return responseData.message;
  }

  switch (error.response.status) {
    case 400:
      return "اطلاعات ارسال‌شده معتبر نیست.";
    case 401:
      return "اطلاعات ورود صحیح نیست یا نشست شما منقضی شده است.";
    case 403:
      return "اجازه انجام این عملیات را ندارید.";
    case 404:
      return "مسیر یا اطلاعات موردنظر پیدا نشد.";
    case 409:
      return "این اطلاعات قبلاً ثبت شده‌اند.";
    case 422:
      return "اطلاعات فرم با ساختار مورد انتظار سرور مطابقت ندارد.";
    case 500:
      return "سرور هنگام پردازش درخواست با خطای داخلی مواجه شد.";
    default:
      return fallbackMessage;
  }
}

// -----------------------------------------------------------------------------
// Health
// -----------------------------------------------------------------------------

export async function checkApiHealth(): Promise<HealthResponse> {
  const response = await api.get<HealthResponse>("/health", {
    timeout: WAKE_TIMEOUT_MS,
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  return response.data;
}

export async function wakeApi(): Promise<boolean> {
  try {
    await checkApiHealth();
    return true;
  } catch (error) {
    console.warn(
      "DocTime API wake-up request failed:",
      getApiErrorMessage(error, "درخواست فعال‌سازی سرور ناموفق بود."),
    );

    return false;
  }
}

// -----------------------------------------------------------------------------
// Auth API
// -----------------------------------------------------------------------------

export async function registerUser(
  payload: UserRegisterPayload,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/register", payload);
  storeAuthData(response.data);
  return response.data;
}

export async function loginUser(
  payload: UserLoginPayload,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", payload);
  storeAuthData(response.data);
  return response.data;
}

export async function getCurrentUser(): Promise<UserResponse> {
  const response = await api.get<UserResponse>("/auth/me");
  storeUserData(response.data);
  return response.data;
}

export async function updateCurrentUser(
  payload: UpdateProfilePayload,
): Promise<UserResponse> {
  const response = await api.patch<UserResponse>("/auth/me", payload);
  storeUserData(response.data);
  return response.data;
}

export function logoutUser(redirectToLogin = true): void {
  clearAuthData();

  if (redirectToLogin && isBrowser()) {
    window.location.replace("/login");
  }
}

export default api;
export function isTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const possibleError = error as {
    code?: unknown;
    message?: unknown;
    name?: unknown;
  };

  const code = typeof possibleError.code === "string" ? possibleError.code : "";
  const message =
    typeof possibleError.message === "string" ? possibleError.message.toLowerCase() : "";
  const name = typeof possibleError.name === "string" ? possibleError.name : "";

  return (
    code === "ECONNABORTED" ||
    code === "ETIMEDOUT" ||
    name === "AbortError" ||
    message.includes("timeout") ||
    message.includes("network error") ||
    message.includes("request aborted")
  );
}
