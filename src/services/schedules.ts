// src/services/schedules.ts
import api from "./api";
import type { Appointment } from "../types/appointment";
import type { DoctorScheduleItem } from "../hooks/useDoctorSchedule";

// دریافت برنامه زمانی پزشک
export async function getDoctorSchedule(
  doctorId: number
): Promise<DoctorScheduleItem[]> {
  const response = await api.get<DoctorScheduleItem[]>("/schedules", {
    params: { doctorId },
  });

  return response.data;
}

// دریافت نوبت‌های رزروشده پزشک
export async function getAppointmentsByDoctor(
  doctorId: number
): Promise<Appointment[]> {
  const response = await api.get<Appointment[]>("/appointments", {
    params: { doctorId },
  });

  return response.data;
}