import api from "./api";

// ============================================================
// 1. مدل‌ها و اینترفیس‌ها
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

export type AvailabilitySlot = AvailabilityItem;

export interface CreateAvailabilityPayload {
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
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

export interface AvailabilityListResponse {
  success?: boolean;
  count?: number;
  items?: unknown[];
  message?: string;
  data?: {
    items?: unknown[];
  };
}

export interface AvailabilitySingleResponse {
  success?: boolean;
  count?: number;
  item?: unknown;
  items?: unknown[];
  message?: string;
  data?: {
    item?: unknown;
    items?: unknown[];
  };
}

export interface AutoGenerateAvailabilityResponse {
  success?: boolean;
  message?: string;
  count?: number;
  items: AvailabilityItem[];
}

export interface DeleteAvailabilityResponse {
  success?: boolean;
  message?: string;
}

// ============================================================
// 2. توابع کمکی نرمال‌سازی (Helper Functions)
// ============================================================

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toEnglishDigits(value: string): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

  return value
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)));
}

function normalizeDateString(value: unknown): string {
  if (typeof value !== "string") return "";
  return toEnglishDigits(value.trim())
    .replace(/[/.]/g, "-")
    .replace(/\s+/g, "");
}

function normalizeTimeString(value: unknown): string {
  if (typeof value !== "string") return "";
  return toEnglishDigits(value.trim());
}

function normalizeBoolean(value: unknown, defaultValue = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();
    if (["true", "1", "yes", "available", "booked"].includes(normalizedValue)) return true;
    if (["false", "0", "no", "unavailable", "cancelled", ""].includes(normalizedValue)) return false;
  }
  return defaultValue;
}

function normalizeNumber(value: unknown, defaultValue = 0): number {
  const normalizedValue = typeof value === "string" ? toEnglishDigits(value.trim()) : value;
  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : defaultValue;
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalizedValue = value.trim();
  return normalizedValue || undefined;
}

function extractItems(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (!isRecord(data)) return [];
  if (Array.isArray(data.items)) return data.items;
  if (isRecord(data.data) && Array.isArray(data.data.items)) return data.data.items;
  return [];
}

export function normalizeAvailability(raw: unknown): AvailabilityItem {
  if (!isRecord(raw)) {
    return {
      id: 0,
      doctor_id: 0,
      date: "",
      start_time: "",
      end_time: "",
      is_available: true,
      is_booked: false,
      status: "available",
    };
  }

  const isBooked = normalizeBoolean(raw.is_booked, false);
  const isAvailable = normalizeBoolean(raw.is_available, !isBooked);
  const rawStatus = typeof raw.status === "string" ? raw.status.trim().toLowerCase() : "";

  const status = rawStatus || (isBooked ? "booked" : isAvailable ? "available" : "unavailable");

  return {
    id: normalizeNumber(raw.id),
    doctor_id: normalizeNumber(raw.doctor_id),
    date: normalizeDateString(raw.date),
    start_time: normalizeTimeString(raw.start_time),
    end_time: normalizeTimeString(raw.end_time),
    is_available: isAvailable,
    is_booked: isBooked,
    status,
    notes: normalizeOptionalString(raw.notes),
  };
}

export function normalizeAvailabilityList(data: unknown): AvailabilityItem[] {
  return extractItems(data).map(normalizeAvailability).filter((item) => item.id > 0);
}

export function normalizeAvailabilitySingle(data: unknown): AvailabilityItem {
  if (isRecord(data)) {
    if (isRecord(data.item)) return normalizeAvailability(data.item);
    if (Array.isArray(data.items) && data.items.length > 0) return normalizeAvailability(data.items[0]);
    if ("id" in data) return normalizeAvailability(data);

    if (isRecord(data.data)) {
      if (isRecord(data.data.item)) return normalizeAvailability(data.data.item);
      if (Array.isArray(data.data.items) && data.data.items.length > 0) return normalizeAvailability(data.data.items[0]);
      if ("id" in data.data) return normalizeAvailability(data.data);
    }
  }
  return normalizeAvailability(undefined);
}

// ============================================================
// 3. توابع API
// ============================================================

export async function getDoctorAvailability(doctorId: number): Promise<AvailabilityItem[]> {
  if (!Number.isInteger(doctorId) || doctorId <= 0) {
    throw new Error("doctorId نامعتبر است.");
  }

  const response = await api.get<AvailabilityListResponse>("availability", {
    params: { doctor_id: doctorId },
  });

  return normalizeAvailabilityList(response.data);
}

export async function createAvailability(payload: CreateAvailabilityPayload): Promise<AvailabilityItem> {
  const requestPayload = {
    date: normalizeDateString(payload.date),
    start_time: normalizeTimeString(payload.start_time),
    end_time: normalizeTimeString(payload.end_time),
    duration_minutes: normalizeNumber(payload.duration_minutes),
  };

  const response = await api.post<AvailabilitySingleResponse>("availability", requestPayload);
  return normalizeAvailabilitySingle(response.data);
}

export async function updateAvailability(availabilityId: number, payload: UpdateAvailabilityPayload): Promise<AvailabilityItem> {
  const response = await api.put<AvailabilitySingleResponse>(`availability/${availabilityId}`, payload);
  return normalizeAvailabilitySingle(response.data);
}

export async function deleteAvailability(availabilityId: number): Promise<DeleteAvailabilityResponse> {
  const response = await api.delete<DeleteAvailabilityResponse>(`availability/${availabilityId}`);
  return response.data;
}

export async function autoGenerateAvailability(payload: AutoGenerateAvailabilityPayload): Promise<AutoGenerateAvailabilityResponse> {
  const response = await api.post<AvailabilityListResponse>("availability/auto-generate", payload);
  const items = normalizeAvailabilityList(response.data);

  return {
    success: response.data?.success || false,
    message: response.data?.message,
    count: items.length,
    items: items,
  };
}
