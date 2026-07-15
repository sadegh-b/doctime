import axios from "axios";
import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

const BASE_URL = (
  rawBaseUrl || "http://127.0.0.1:8000/api/v1"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function getStoredToken(): string | null {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token")
  );
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
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      window.dispatchEvent(new Event("auth-change"));

      const publicAuthPaths = ["/login", "/doctor-login", "/register"];
      const currentPath = window.location.pathname;

      if (!publicAuthPaths.includes(currentPath)) {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
