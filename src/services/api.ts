import axios from "axios";
import { getAccessToken } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;

/* =========================
   Named API helpers
   برای رفع import های قبلی
========================= */

export async function getSpecialties() {
  const response = await api.get("/specialties");
  return response.data;
}

export async function getDoctors(params?: Record<string, any>) {
  const response = await api.get("/doctors", { params });
  return response.data;
}

export async function getDoctorById(id: string | number) {
  const response = await api.get(`/doctors/${id}`);
  return response.data;
}
