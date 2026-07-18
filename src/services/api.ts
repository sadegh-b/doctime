import axios from "axios";
import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const ROLE_KEY = "role";

const REQUEST_TIMEOUT_MS = 120000;
const WAKE_TIMEOUT_MS = 25000;

const PUBLIC_AUTH_PATHS = [
  "/login",
  "/register",
  "/doctor-login",
  "/doctor-register",
];

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  "https://doctime-backend-5b74.onrender.com/api/v1"
).replace(/\/+$/, "");

const API_ORIGIN = BASE_URL.replace(/\/api\/v1$/, "");

const api = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getRole(): string | null {
  return localStorage.getItem(ROLE_KEY);
}

export function setRole(role: string): void {
  localStorage.setItem(ROLE_KEY, role);
}

export function removeRole(): void {
  localStorage.removeItem(ROLE_KEY);
}

function clearAuthData(): void {
  removeAccessToken();
  removeRole();
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("token");
}

export function isTimeoutError(error: unknown): boolean {
  return (
    axios.isAxiosError(error) &&
    (error.code === "ECONNABORTED" ||
      error.message.toLowerCase().includes("timeout"))
  );
}

export async function wakeApi(): Promise<void> {
  const urlsToTry = [
    `${API_ORIGIN}/`,
    API_ORIGIN,
    `${BASE_URL}/`,
    BASE_URL,
  ];

  for (const url of urlsToTry) {
    try {
      await axios.get(url, {
        timeout: WAKE_TIMEOUT_MS,
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      return;
    } catch {
      // Ignore and try the next endpoint.
    }
  }
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuthData();
      window.dispatchEvent(new Event("auth-change"));

      const currentPath = window.location.pathname;
      if (!PUBLIC_AUTH_PATHS.includes(currentPath)) {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
