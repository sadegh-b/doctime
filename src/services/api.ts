// src/services/api.ts

import axios from "axios";
// دقت کن: حتماً باید قبل از تایپ‌ها کلمه type باشد تا Vite خطا ندهد
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";

// آدرس پایه API شما
const BASE_URL = import.meta.env.VITE_API_URL || "https://doctime-backend-5b74.onrender.com/api/v1";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// اینترسپتور برای اضافه کردن توکن به درخواست‌ها
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// اینترسپتور برای مدیریت خطاهای پاسخ (مثل 401)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      // window.location.href = "/login"; // در صورت نیاز فعال کن
    }
    return Promise.reject(error);
  }
);

export default api;
export function isTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const e = error as { code?: unknown; message?: unknown; name?: unknown };

  return (
    e.code === "ECONNABORTED" ||
    e.code === "ETIMEDOUT" ||
    e.name === "AbortError" ||
    (typeof e.message === "string" &&
      /timeout|network error|request aborted/i.test(e.message))
  );
}

export async function wakeApi(): Promise<boolean> {
  try {
    await checkApiHealth();
    return true;
  } catch {
    return false;
  }
}
