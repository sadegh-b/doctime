import axios from "axios";
import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// Constants - صادق: این کلیدها رو هرگز تغییر نده چون دیتای کاربر تو لوکال استوریج می‌پره
const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const ROLE_KEY = "role";

const REQUEST_TIMEOUT_MS = 60000; // 60 seconds is enough for Render
const WAKE_TIMEOUT_MS = 45000;   // Increased to allow Render cold start

const PUBLIC_AUTH_PATHS = [
  "/login",
  "/register",
  "/doctor-login",
  "/doctor-register",
];

// Normalize URL: Remove trailing slashes and spaces
function normalizeBaseUrl(value: string): string {
  if (!value) return "";
  return value.trim().replace(/\/+$/, "");
}

// Ensure the environment variable is used correctly
const ENV_URL = import.meta.env.VITE_API_BASE_URL;
const DEFAULT_URL = "https://doctime-backend-5b74.onrender.com/api/v1";

const BASE_URL = normalizeBaseUrl(ENV_URL || DEFAULT_URL);
const API_ORIGIN = BASE_URL.replace(/\/api\/v1$/, "");

const api = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// --- Auth Helpers ---
export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const setAccessToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const removeAccessToken = () => localStorage.removeItem(TOKEN_KEY);

export const getRole = () => localStorage.getItem(ROLE_KEY);
export const setRole = (role: string) => localStorage.setItem(ROLE_KEY, role);
export const removeRole = () => localStorage.removeItem(ROLE_KEY);

function clearAuthData(): void {
  removeAccessToken();
  removeRole();
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("token"); // Legacy support
}

export function isTimeoutError(error: unknown): boolean {
  return (
    axios.isAxiosError(error) &&
    (error.code === "ECONNABORTED" || error.message.toLowerCase().includes("timeout"))
  );
}

/**
 * Parallel Wake-up Strategy
 * صادق: این تابع به جای یکی‌یکی، همزمان به چند نقطه درخواست میده تا سریع‌تر سرور بیدار بشه
 */
export async function wakeApi(): Promise<void> {
  const endpoints = [
    `${BASE_URL}/health`,
    `${API_ORIGIN}/health`,
    BASE_URL
  ];

  try {
    // Promise.any takes the first one that succeeds
    await Promise.any(
      endpoints.map(url =>
        axios.get(url, {
          timeout: WAKE_TIMEOUT_MS,
          headers: { "Cache-Control": "no-cache" }
        })
      )
    );
  } catch (error) {
    console.warn("Wake-up call failed or timed out, server might still be starting.");
  }
}

// --- Interceptors ---

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;

      // فقط اگر در صفحه عمومی نیستیم، دیتا رو پاک کن و ریدایرکت کن
      if (!PUBLIC_AUTH_PATHS.some(path => currentPath.includes(path))) {
        clearAuthData();
        window.dispatchEvent(new Event("auth-change"));
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
