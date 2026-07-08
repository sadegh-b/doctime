// Path: src/services/availability.ts

import api from "./api";

export interface AvailabilitySlot {
  id: number;
  doctor_id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_booked: boolean;
}

// ساختار پاسخ ممکن است آرایه مستقیم یا آبجکت کپسوله‌شده باشد
interface AvailabilityResponse {
  success?: boolean;
  count?: number;
  items?: AvailabilitySlot[];
}

export async function getDoctorAvailability(
  doctorId: number
): Promise<AvailabilitySlot[]> {
  // ارسال درخواست به بک‌اند با پارامتر doctor_id
  const response = await api.get<AvailabilityResponse | AvailabilitySlot[]>("/availability", {
    params: { doctor_id: doctorId },
  });

  const data = response.data;

  // اگر پاسخ مستقیماً آرایه باشد
  if (Array.isArray(data)) {
    return data;
  }

  // اگر پاسخ در قالب شیء کپسوله‌شده با کلید items باشد
  if (data && Array.isArray(data.items)) {
    return data.items;
  }

  return [];
}
