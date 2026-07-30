// مسیر: src/services/api.ts
import axios from "axios";

// این مقدار را دقیقاً به ریشه اصلی سرور تغییر دادم.
// دیگر v1 را اینجا هاردکد نکن.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://doctime-backend-1.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// اینترسپتورها (Interceptors) - تغییری نکردند
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
