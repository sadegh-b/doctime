import axios from "axios";
import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const ROLE_KEY = "role";
const REQUEST_TIMEOUT_MS = 15000;

const PUBLIC_AUTH_PATHS = ["/login", "/doctor-login", "/register"];

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

const BASE_URL = (
  rawBaseUrl || "http://127.0.0.1:8000/api/v1"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function clearAuthData(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem("token");
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getStoredToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
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
