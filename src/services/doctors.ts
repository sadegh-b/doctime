// Path: src/services/doctors.ts

import api from "./api";

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  city?: string;
  phone?: string;
  about?: string;
  image?: string;
  visit_fee?: number;
  experience?: string;
  patients?: number;
}


export async function getDoctors(): Promise<Doctor[]> {
  const response = await api.get("/doctors");
  return response.data;
}


export async function getDoctorById(
  id: number
): Promise<Doctor> {
  const response = await api.get(`/doctors/${id}`);
  return response.data;
}


export async function searchDoctors(
  params?: Record<string, string | number>
): Promise<Doctor[]> {
  const response = await api.get("/doctors/search", {
    params,
  });

  return response.data;
}