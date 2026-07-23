// Path: src/services/api.ts

import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

// تعریف اینترفیس تخصص برای استفاده در فرانت‌ند
export interface Specialty {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

const envBaseUrl = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL
)
  ?.trim()
  .replace(/\/+$/, "");

const BASE_URL =
  envBaseUrl ||
  (import.meta.env.DEV
    ? "http://127.0.0.1:8000/api/v1"
    : "https://doctime-backend-1.onrender.com/api/v1");

if (!BASE_URL && import.meta.env.PROD) {
  console.error("VITE_API_URL is not defined for production");
}

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL || undefined,
  timeout: 20000, // زمان انتظار ۲۰ ثانیه برای هندل کردن Cold Start در سرورهای Render
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

function getAccessToken(): string | null {
  const storedToken = localStorage.getItem("access_token");

  if (!storedToken) return null;

  const token = storedToken.trim().replace(/^["']|["']$/g, "");

  // اگر توکن خراب یا بیش از حد بزرگ باشد، برای امنیت پاکسازی می‌شود
  if (!token || token.length > 5000) {
    console.warn("Invalid or oversized access token removed");
    clearAuthData();
    return null;
  }

  return token;
}

function clearAuthData() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth-change"));

  // هدایت مستقیم کاربر به صفحه ورود در صورت انقضای توکن
  if (window.location.pathname !== "/login" && window.location.pathname !== "/doctor-login") {
    // از ری‌دایرکت مستقیم برای خروج اجباری استفاده می‌کنیم
    window.location.href = "/login?expired=true";
  }
}

// اینترسپتور درخواست: اضافه کردن توکن به هدرها به صورت کاملاً پویا
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// اینترسپتور پاسخ: مدیریت خطاها و بررسی توکن‌های منقضی شده
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 400) {
      const data = error.response?.data as { detail?: string } | undefined;
      if (
        typeof data?.detail === "string" &&
        data.detail.toLowerCase().includes("request header or cookie too large")
      ) {
        console.error("Backend rejected request because headers/cookies are too large.");
      }
    }

    if (status === 401) {
      console.warn("Unauthorized - token invalid or expired");
      clearAuthData();
    }

    return Promise.reject(error);
  },
);

// متد دریافت لیست تخصص‌های پزشکی از API بک‌ند
export async function getSpecialties(): Promise<Specialty[]> {
  const response = await api.get<Specialty[]>("/specialties");
  return response.data;
}

export default api;
