import api from "./api";

// ============================================================
// 1. اینترفیس‌ها (هماهنگ با بک‌اِند)
// ============================================================

export interface AvailabilityItem {
  id: number;
  doctor_id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_booked: boolean;
  status?: string;
  notes?: string;
}

export interface CreateAvailabilityPayload {
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number; // ⚠️ این فیلد الزامی است و قبلاً جا افتاده بود
}

export interface UpdateAvailabilityPayload {
  date?: string;
  start_time?: string;
  end_time?: string;
  status?: string;
  is_booked?: boolean;
  is_available?: boolean;
  notes?: string;
}

export interface AutoGenerateAvailabilityPayload {
  doctor_id: number;
  start_date: string;
  end_date: string;
  slot_duration: number;
  work_days: number[];
  day_start_time: string;
  day_end_time: string;
  break_start_time?: string;
  break_end_time?: string;
}

export type AvailabilityListResponse = {
  success?: boolean;
  count?: number;
  items?: AvailabilityItem[];
};

export type AvailabilitySingleResponse = {
  success?: boolean;
  count?: number;
  items?: AvailabilityItem[];
};

// ============================================================
// 2. توابع نرمال‌سازی
// ============================================================

export function normalizeAvailability(raw: any): AvailabilityItem {
  return {
    id: Number(raw.id ?? 0),
    doctor_id: Number(raw.doctor_id ?? 0),
    date: typeof raw.date === "string" ? raw.date : "",
    start_time: typeof raw.start_time === "string" ? raw.start_time : "",
    end_time: typeof raw.end_time === "string" ? raw.end_time : "",
    is_available: raw.is_available !== undefined ? Boolean(raw.is_available) : true,
    is_booked: Boolean(raw.is_booked),
    status:
      typeof raw.status === "string"
        ? raw.status.trim()
        : raw.is_booked
        ? "booked"
        : "available",
    notes: typeof raw.notes === "string" ? raw.notes : undefined,
  };
}

export function normalizeAvailabilityList(
  data: AvailabilityListResponse | any
): AvailabilityItem[] {
  // بک‌اِند خروجی را در کلید "items" می‌فرستد
  if (data && Array.isArray(data.items)) {
    return data.items.map(normalizeAvailability);
  }
  // fallback: اگر مستقیماً آرایه بود
  if (Array.isArray(data)) {
    return data.map(normalizeAvailability);
  }
  return [];
}

export function normalizeAvailabilitySingle(
  data: AvailabilitySingleResponse | any
): AvailabilityItem {
  // بک‌اِند در پاسخ ساخت، لیست items را برمی‌گرداند (چون چند اسلات می‌سازد)
  if (data && Array.isArray(data.items) && data.items.length > 0) {
    return normalizeAvailability(data.items[0]);
  }
  if (data && typeof data === "object" && data.id) {
    return normalizeAvailability(data);
  }
  // fallback
  return normalizeAvailability(data);
}

// ============================================================
// 3. توابع API
// ============================================================

/**
 * گرفتن اسلات‌های یک پزشک
 */
export async function getDoctorAvailability(
  doctorId: number
): Promise<AvailabilityItem[]> {
  const response = await api.get<AvailabilityListResponse>("availability", {
    params: { doctor_id: doctorId },
  });

  // لاگ برای دیباگ
  console.log("DEBUG: Raw Availability Response:", response.data);
  console.log("DEBUG: Items count:", response.data?.items?.length ?? 0);

  return normalizeAvailabilityList(response.data);
}

/**
 * ساخت بازه زمانی برای پزشک
 * ⚠️ اصلاح مهم: اضافه شدن duration_minutes
 * ⚠️ حذف notes (بک‌اِند آن را قبول نمی‌کند)
 */
export async function createAvailability(
  payload: CreateAvailabilityPayload
): Promise<AvailabilityItem> {
  const response = await api.post<AvailabilitySingleResponse>("availability", {
    date: payload.date,
    start_time: payload.start_time,
    end_time: payload.end_time,
    duration_minutes: payload.duration_minutes,
    // notes حذف شد چون بک‌اِند این فیلد را در AvailabilityCreate ندارد
  });

  return normalizeAvailabilitySingle(response.data);
}

/**
 * ویرایش یک اسلات
 */
export async function updateAvailability(
  availabilityId: number,
  payload: UpdateAvailabilityPayload
): Promise<AvailabilityItem> {
  const response = await api.put<AvailabilitySingleResponse>(
    `availability/${availabilityId}`,
    {
      ...payload,
      notes:
        typeof payload.notes === "string"
          ? payload.notes.trim() || undefined
          : payload.notes,
    }
  );

  return normalizeAvailabilitySingle(response.data);
}

/**
 * حذف اسلات
 */
export async function deleteAvailability(
  availabilityId: number
): Promise<{ success?: boolean; message?: string }> {
  const response = await api.delete(`availability/${availabilityId}`);
  return response.data;
}

/**
 * تولید خودکار برنامه زمانی پزشک
 */
export async function autoGenerateAvailability(
  payload: AutoGenerateAvailabilityPayload
): Promise<{
  success?: boolean;
  message?: string;
  count?: number;
  items?: AvailabilityItem[];
}> {
  const response = await api.post("availability/auto-generate", payload);

  return {
    ...response.data,
    items: Array.isArray(response.data?.items)
      ? response.data.items.map(normalizeAvailability)
      : [],
  };
}
