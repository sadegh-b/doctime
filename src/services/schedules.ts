import type { Appointment } from "../types/appointment";
import type { DoctorScheduleItem } from "../hooks/useDoctorSchedule";

// دریافت برنامه زمانی پزشک بر اساس ID
export async function getDoctorSchedule(doctorId: number): Promise<DoctorScheduleItem[]> {
  const response = await api.get<DoctorScheduleItem[]>("/schedules", {
    params: { doctorId },
  });
  return response.data;
}

// دریافت نوبت‌های رزرو شده پزشک با نام مشخص برای جلوگیری از تداخل نام
export async function getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
  const response = await api.get<Appointment[]>("/appointments", {
    params: { doctorId },
  });
  return response.data;
}
