import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

const envBaseUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");

const BASE_URL =
  envBaseUrl || (import.meta.env.DEV ? "http://127.0.0.1:8000/api/v1" : "");

if (!BASE_URL) {
  throw new Error("VITE_API_URL is not defined for production");
}

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

function getAccessToken(): string | null {
  const storedToken = localStorage.getItem("access_token");

  if (!storedToken) {
    return null;
  }

  const token = storedToken.trim().replace(/^["']|["']$/g, "");

  // Prevent invalid or accidentally oversized values from being sent as auth headers.
  if (!token || token.length > 10_000) {
    console.warn("Invalid or oversized access token removed");
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    return null;
  }

  return token;
}

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

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized - token invalid or expired");
      localStorage.removeItem("access_token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-change"));
    }

    return Promise.reject(error);
  },
);

export function isTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const typedError = error as {
    code?: unknown;
    message?: unknown;
    name?: unknown;
  };

  return (
    typedError.code === "ECONNABORTED" ||
    typedError.code === "ETIMEDOUT" ||
    typedError.name === "AbortError" ||
    (typeof typedError.message === "string" &&
      /timeout|network error|request aborted/i.test(typedError.message))
  );
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const apiOrigin = new URL(BASE_URL).origin;

    await axios.get(`${apiOrigin}/health`, {
      timeout: 5000,
      withCredentials: false,
    });

    return true;
  } catch {
    return false;
  }
}

export async function wakeApi(): Promise<boolean> {
  return checkApiHealth();
}

export default api;
