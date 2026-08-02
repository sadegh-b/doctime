import axios, { type InternalAxiosRequestConfig, AxiosError } from "axios";

/**
 * ایجاد نمونه axios با تنظیمات پایه
 */
const api = axios.create({
  baseURL: "https://doctime-backend-1.onrender.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // تعیین تایم اوت ۱۵ ثانیه‌ای برای جلوگیری از انتظار بی‌پایان به خاطر کندی Render
});

// لیست دقیق نقاط پایانی عمومی
const PUBLIC_ENDPOINTS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/otp/send",
  "/specialties",
]);

/**
 * نرمال‌سازی URL برای مقایسه دقیق
 * حذف Query Params و اسلش‌های اضافی
 */
function normalizeUrlPath(url?: string): string {
  if (!url) return "";

  // جدا کردن بخش مسیر از پارامترهای ارسالی
  let path = url.split("?")[0].trim();

  // حذف اسلش آخر اگر وجود داشت (به جز مسیر ریشه)
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  return path;
}

/**
 * بررسی اینکه آیا درخواست به یک مسیر عمومی است یا خیر
 */
function isPublicEndpoint(url?: string): boolean {
  const normalized = normalizeUrlPath(url);
  return PUBLIC_ENDPOINTS.has(normalized);
}

/**
 * پاکسازی کامل اطلاعات احراز هویت و اطلاع‌رسانی به کل برنامه
 */
export function clearAuthStorage(): void {
  // پاکسازی تمامی کلیدهای مرتبط
  const keys = ["access_token", "role", "user"];
  keys.forEach(key => localStorage.removeItem(key));

  sessionStorage.removeItem("pending_register_payload");
  sessionStorage.removeItem("pending_doctor_details");

  // شلیک یک رویداد برای آپدیت شدن آنی Header و سایر کامپوننت‌ها
  window.dispatchEvent(new Event("auth-change"));
}

/**
 * اینترسپتور درخواست: مدیریت توکن Bearer
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");
    const requestPath = normalizeUrlPath(config.url);

    // اگر مسیر عمومی بود، هدر Authorization نباید ارسال شود
    if (isPublicEndpoint(requestPath)) {
      delete config.headers.Authorization;
      return config;
    }

    // اگر توکن وجود داشت، به هدر اضافه شود
    if (token && token.trim()) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * اینترسپتور پاسخ: مدیریت خطاهای ۴۰۱ و انقضای نشست
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const requestPath = normalizeUrlPath(error.config?.url);

    // فقط اگر خطا 401 باشد و مسیر خصوصی باشد، کاربر هدایت شود
    if (status === 401 && !isPublicEndpoint(requestPath)) {
      console.warn("Session expired or unauthorized. Redirecting to login...");
      clearAuthStorage();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // مدیریت خطای احتمالی شبکه یا تایم‌اوت
    if (error.code === "ECONNABORTED") {
      console.error("درخواست به دلیل کندی بیش از حد سرور متوقف شد.");
    }

    return Promise.reject(error);
  }
);

/**
 * توابع کمکی برای فراخوانی APIها
 */
export async function getSpecialties() {
  // استفاده از مسیر نرمال شده بدون اسلش اضافی
  const response = await api.get("/specialties");
  return response.data;
}

export default api;
