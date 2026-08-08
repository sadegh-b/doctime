// مسیر فایل: src/services/api.ts

import axios, { type InternalAxiosRequestConfig, AxiosError } from "axios";

/**
 * Base URL configuration with strict fallbacks
 */
const DEFAULT_BASE_URL = import.meta.env.DEV
  ? "http://127.0.0.1:8000/api/v1"
  : "https://doctime-backend-1.onrender.com/api/v1";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000, // ۳۰ ثانیه زمان انتظار برای جلوگیری از معطلی بی‌دلیل
});

/**
 * مسیرهایی که نیاز به توکن ندارند
 */
const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/otp/send",
  "/specialties",
  "/doctors",
];

function isPublicEndpoint(url?: string): boolean {
  if (!url) return false;
  // جداسازی پارامترهای کوئری
  const pathWithoutQuery = url.split("?")[0];
  // نرمال‌سازی اسلش‌ها: حذف اسلش‌های ابتدا و انتها برای مقایسه دقیق
  const cleanPath = pathWithoutQuery.replace(/^\/+|\/+$/g, "");

  return PUBLIC_PATHS.some((p) => {
    const cleanPublic = p.replace(/^\/+|\/+$/g, "");
    return cleanPath === cleanPublic || cleanPath.endsWith(cleanPublic);
  });
}

/**
 * Request Interceptor: تزریق توکن به هدرها
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");

    // فقط اگر مسیر عمومی نبود و توکن موجود بود، هدر Authorization را اضافه کن
    if (token && token.trim() && !isPublicEndpoint(config.url)) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    } else {
      // برای اطمینان در مسیرهای عمومی هدر را حذف کن تا تداخل ایجاد نشود
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor: مدیریت خطاهای احراز هویت و ریدایرکت
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    // اگر توکن منقضی شده بود (401) و در صفحه لاگین نبودیم
    if (status === 401 && currentPath !== "/login") {
      console.warn("Session expired or invalid. Redirecting to login...");

      // پاکسازی کامل برای رفع خطای Header Too Large
      localStorage.clear();
      sessionStorage.clear();

      window.dispatchEvent(new Event("auth-change"));
      window.location.href = "/login";
    }

    if (error.code === "ECONNABORTED") {
      console.error("درخواست به دلیل کندی بیش از حد سرور متوقف شد (Timeout).");
    }

    return Promise.reject(error);
  }
);

export async function getSpecialties() {
  const response = await api.get("/specialties");
  return response.data;
}

export default api;
