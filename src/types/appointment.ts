// src/services/appointments.ts
import api from "./api";
import type { Appointment, CreateAppointmentPayload } from "../types/appointment";

// گرفتن نوبت‌های یک پزشک
export async function getDoctorAppointments(doctorId: number): Promise<Appointment[]> {
  const res = await api.get(`/appointments`, {
    params: { doctorId },
  });
  return res.data;
}

// گرفتن نوبت‌های کاربر
export async function getMyAppointments(): Promise<Appointment[]> {
  const res = await api.get("/appointments/my");
  return res.data;
}

// ساخت نوبت جدید
export async function createAppointment(
  payload: CreateAppointmentPayload
): Promise<Appointment> {
  const res = await api.post("/appointments", payload);
  return res.data;
}

// لغو نوبت
export async function cancelAppointment(appointmentId: number) {
  const res = await api.delete(`/appointments/${appointmentId}`);
  return res.data;
}