// مسیر فایل: src/services/doctors.ts

import api from "./api";
import axios from "axios";

export interface Specialty {
  id?: number;
  slug?: string;
  name?: string;
  value?: string;
  label?: string;
}

export interface Doctor {
  id: number;
  user?: {
    first_name?: string;
    last_name?: string;
    name?: string;
  };
  name?: string;
  specialty?: Specialty | string | null;
  specialty_name?: string;
  city?: string;
  province?: string;
  profile_image?: string | null;
  image?: string | null;
  is_featured?: boolean;
  rating?: number;
  in_person_visit?: boolean;
  online_visit?: boolean;
  bio?: string;
  gender?: string;
  consultation_fee?: number;
}

export interface DoctorsResponse {
  results: Doctor[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

export interface DoctorsQueryParams {
  search?: string;
  specialty_slug?: string;
  city?: string;
  page?: number | string;
}

export const SPECIALTY_MAP: Record<string, string> = {
  general: "پزشک عمومی",
  cardiology: "قلب و عروق",
  dermatology: "پوست و مو",
  pediatrics: "کودکان",
  orthopedics: "ارتوپدی",
  neurology: "مغز و اعصاب",
  gynecology: "زنان و زایمان",
  psychiatry: "روانپزشکی",
  ophthalmology: "چشم‌پزشکی",
  otolaryngology: "گوش، حلق و بینی",
  dentistry: "دندان‌پزشکی",
  internal: "داخلی",
};

export function specialtyValueToLabel(
  specialty: Specialty | string | null | undefined
): string {
  if (!specialty) return "نامشخص";

  if (typeof specialty === "object") {
    if (specialty.label) return specialty.label;
    if (specialty.name) return specialty.name;

    const val = (specialty.value || specialty.slug || "").toLowerCase().trim();
    return SPECIALTY_MAP[val] || val || "نامشخص";
  }

  const key = specialty.toLowerCase().trim();
  return SPECIALTY_MAP[key] || specialty || "نامشخص";
}

export function normalizeDoctor(raw: any): Doctor {
  const firstName = raw?.user?.first_name || "";
  const lastName = raw?.user?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    ...raw,
    name: raw?.name || raw?.user?.name || fullName || "پزشک بدون نام",
  };
}

function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;
    if (typeof data === "string") return `API error (${status}): ${data}`;
    if (data && typeof data === "object") return `API error (${status}): ${JSON.stringify(data)}`;
    return `Network error (${status}): ${error.message}`;
  }
  return error instanceof Error ? error.message : "Unknown error";
}

export const fetchDoctors = async (params: DoctorsQueryParams = {}): Promise<Doctor[] | DoctorsResponse> => {
  try {
    const response = await api.get("/doctors", { params });
    const data = response.data;
    if (Array.isArray(data)) return data.map(normalizeDoctor);
    if (data && data.results) return { ...data, results: data.results.map(normalizeDoctor) };
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const getDoctors = fetchDoctors;

export const fetchDoctorById = async (id: number | string): Promise<Doctor> => {
  try {
    const response = await api.get(`/doctors/${id}`);
    return normalizeDoctor(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

// --- FIX: این خط اضافه شد تا خطای ایمپورت در DoctorProfilePage رفع شود ---
export const getDoctorById = fetchDoctorById;

const doctorService = {
  fetchDoctors,
  getDoctors,
  fetchDoctorById,
  getDoctorById, // اضافه شده به شیء پیش‌فرض
  normalizeDoctor,
  specialtyValueToLabel,
  SPECIALTY_MAP,
};

export default doctorService;
