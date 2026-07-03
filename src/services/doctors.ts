// src/services/doctors.ts

import api from "./api";
import type { Doctor } from "../data/mockData";

/* -----------------------------
   Doctors
------------------------------*/

export async function getDoctors(): Promise<Doctor[]> {
  const response = await api.get("/doctors/");
  return response.data;
}

export async function getDoctorById(id: number): Promise<Doctor> {
  const response = await api.get(`/doctors/${id}`);
  return response.data;
}

/* -----------------------------
   Appointments
------------------------------*/

export interface CreateAppointmentInput {
  availability_id: number;
}

export async function createAppointment(
  data: CreateAppointmentInput
) {
  const response = await api.post("/appointments", data);

  return response.data;
}

export async function getPatientAppointments() {
  const response = await api.get("/appointments");

  return response.data;
}
