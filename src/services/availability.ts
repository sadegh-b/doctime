// src/services/availability.ts
import api from "./api";

export type AvailabilityStatus = "available" | "booked" | "blocked" | string;

export type AvailabilityItem = {
  id: number;
  doctor_id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  status?: AvailabilityStatus;
  notes?: string | null;
  created_at?: string | null;
};

export type CreateAvailabilityPayload = {
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
};

export type UpdateAvailabilityPayload = {
  date?: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
  is_booked?: boolean;
  status?: AvailabilityStatus;
};

export type AutoGenerateAvailabilityPayload = {
  start_date: string;
  days: number;
  start_time?: string;
  end_time?: string;
  slot_minutes?: number;
  break_minutes?: number;
  weekdays?: number[];
};

type AvailabilityListResponse =
  | AvailabilityItem[]
  | {
      success?: boolean;
      items?: any[];
      data?: any[];
      results?: any[];
    };

type AvailabilitySingleResponse =
  | AvailabilityItem
  | {
      success?: boolean;
      item?: any;
      data?: any;
    };

function normalizeAvailability(item: any): AvailabilityItem {
  return {
    id: Number(item?.id ?? 0),
    doctor_id: Number(item?.doctor_id ?? 0),
    date: String(item?.date ?? ""),
    start_time: String(item?.start_time ?? ""),
    end_time: String(item?.end_time ?? ""),
    is_booked: Boolean(item?.is_booked ?? false),
    status:
      item?.status ??
      (item?.is_booked ? "booked" : "available"),
    notes: item?.notes ?? null,
    created_at: item?.created_at ?? null,
  };
}

function normalizeAvailabilityList(data: AvailabilityListResponse): AvailabilityItem[] {
  if (Array.isArray(data)) {
    return data.map(normalizeAvailability);
  }

  if (Array.isArray(data?.items)) {
    return data.items.map(normalizeAvailability);
  }

  if (Array.isArray(data?.data)) {
    return data.data.map(normalizeAvailability);
  }

  if (Array.isArray(data?.results)) {
    return data.results.map(normalizeAvailability);
  }

  return [];
}

function normalizeAvailabilitySingle(data: AvailabilitySingleResponse): AvailabilityItem {
  if (data && typeof data === "object" && "item" in data && data.item) {
    return normalizeAvailability(data.item);
  }

  if (data && typeof data === "object" && "data" in data && data.data) {
    return normalizeAvailability(data.data);
  }

  return normalizeAvailability(data);
}

/**
 * گرفتن اسلات‌های یک پزشک
 * برای صفحه رزرو بیمار و همین‌طور مدیریت برنامه پزشک
 */
export async function getDoctorAvailability(
  doctorId: number
): Promise<AvailabilityItem[]> {
  const response = await api.get<AvailabilityListResponse>("/availability", {
    params: { doctor_id: doctorId },
  });

  return normalizeAvailabilityList(response.data);
}

/**
 * ساخت دستی یک بازه زمانی برای پزشک
 */
export async function createAvailability(
  payload: CreateAvailabilityPayload
): Promise<AvailabilityItem> {
  const response = await api.post<AvailabilitySingleResponse>(
    "/availability",
    {
      date: payload.date,
      start_time: payload.start_time,
      end_time: payload.end_time,
      notes: payload.notes?.trim() ? payload.notes.trim() : undefined,
    }
  );

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
    `/availability/${availabilityId}`,
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
  const response = await api.delete(`/availability/${availabilityId}`);
  return response.data;
}

/**
 * تولید خودکار برنامه زمانی پزشک
 */
export async function autoGenerateAvailability(
  payload: AutoGenerateAvailabilityPayload
): Promise<{ success?: boolean; message?: string; count?: number; items?: AvailabilityItem[] }> {
  const response = await api.post("/availability/auto-generate", payload);

  return {
    ...response.data,
    items: Array.isArray(response.data?.items)
      ? response.data.items.map(normalizeAvailability)
      : [],
  };
}