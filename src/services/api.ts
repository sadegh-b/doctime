// src/services/api.ts

import axios, { type InternalAxiosRequestConfig, AxiosError } from "axios";

/**
 * Base URL from environment:
 * - .env.local   -> local backend
 * - .env.production -> production backend
 * Fallbacks:
 * - local dev: http://127.0.0.1:8000/api/v1
 * - production: https://doctime-backend-1.onrender.com/api/v1
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
  timeout: 60000,
});

const PUBLIC_ENDPOINTS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/otp/send",
  "/specialties",
]);

function normalizeUrlPath(url?: string): string {
  if (!url) return "";

  let path = url.split("?")[0].trim();

  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  return path;
}

function isPublicEndpoint(url?: string): boolean {
  const normalized = normalizeUrlPath(url);
  return PUBLIC_ENDPOINTS.has(normalized);
}

export function clearAuthStorage(): void {
  const keys = ["access_token", "role", "user"];
  keys.forEach((key) => localStorage.removeItem(key));

  sessionStorage.removeItem("pending_register_payload");
  sessionStorage.removeItem("pending_doctor_details");

  window.dispatchEvent(new Event("auth-change"));
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");
    const requestPath = normalizeUrlPath(config.url);

    if (isPublicEndpoint(requestPath)) {
      delete config.headers.Authorization;
      return config;
    }

    if (token && token.trim()) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const requestPath = normalizeUrlPath(error.config?.url);

    if (status === 401 && !isPublicEndpoint(requestPath)) {
      console.warn("Session expired or unauthorized. Redirecting to login...");
      clearAuthStorage();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    if (error.code === "ECONNABORTED") {
      console.error("درخواست به دلیل کندی بیش از حد سرور متوقف شد.");
    }

    return Promise.reject(error);
  }
);

export async function getSpecialties() {
  const response = await api.get("/specialties");
  return response.data;
}

export default api;
