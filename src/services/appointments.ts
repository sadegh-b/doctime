import api from "./api";

export type AppointmentStatus =
  | "booked"
  | "reserved"
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | string;

export type Appointment = {
  id: number;
  doctor_id: number;
 patient_id: number;
  availability_id: number;
  doctor_name?: string | null;
  patient_name?: string | null;
  specialty?: string | null;
  date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  status: AppointmentStatus;
  notes?: string | null;
  created_at?: string | null;
};

export type AppointmentItem = Appointment;

export type CreateAppointmentPayload = {
  availability_id: number;
  notes?: string;
};

export type CreateAppointmentResponse = {
  success?: boolean;
  message?: string;
  data?: Appointment;
  item?: Appointment;
} & Partial<Appointment>;

export type CancelAppointmentResponse = {
  success?: boolean;
  message?: string;
  appointment_id?: number;
  status?: AppointmentStatus;
  item?: Appointment;
};

export type CompleteAppointmentResponse = {
  success?: boolean;
  message?: string;
  appointment_id?: number;
  status?: AppointmentStatus;
  item?: Appointment;
};

type AppointmentsApiListResponse = {
  success?: boolean;
  count?: number;
  total?: number;
  items?: Appointment[];
  data?: Appointment[];
};

function normalizeAppointment(item: any): Appointment {
  return {
    id: Number(item?.id ?? 0),
    doctor_id: Number(item?.doctor_id ?? item?.doctor?.id ?? 0),
    patient_id: Number(item?.patient_id ?? item?.user_id ?? item?.patient?.id ?? 0),
    availability_id: Number(item?.availability_id ?? 0),

    doctor_name:
      item?.doctor_name ??
      item?.doctor?.name ??
      item?.doctor?.full_name ??
      null,

    patient_name:
      item?.patient_name ??
      item?.user_name ??
      item?.patient?.name ??
      item?.patient?.full_name ??
      null,

    specialty:
      item?.specialty ??
      item?.doctor?.specialty ??
      null,

    date:
      item?.date ??
      item?.appointment_date ??
      item?.slot_date ??
      null,

    start_time:
      item?.start_time ??
      item?.slot_start_time ??
      null,

    end_time:
      item?.end_time ??
      item?.slot_end_time ??
      null,

    status:
      item?.status ?? "reserved",

    notes:
      item?.notes ?? null,

    created_at:
      item?.created_at ?? null,
  };
}

function normalizeAppointmentsResponse(data: any): Appointment[] {
  if (Array.isArray(data)) {
    return data.map(normalizeAppointment);
  }

  if (data && Array.isArray(data.items)) {
    return data.items.map(normalizeAppointment);
  }

  if (data && Array.isArray(data.data)) {
    return data.data.map(normalizeAppointment);
  }

  return [];
}

function normalizeSingleAppointmentResponse(data: any): Appointment {
  if (data?.data) {
    return normalizeAppointment(data.data);
  }

  if (data?.item) {
    return normalizeAppointment(data.item);
  }

  return normalizeAppointment(data);
}

/**
 * نوبت‌های بیمار لاگین‌شده
 */
export async function getMyAppointments(): Promise<Appointment[]> {
  const response = await api.get<AppointmentsApiListResponse | Appointment[]>(
    "/appointments/my"
  );

  return normalizeAppointmentsResponse(response.data);
}

/**
 * همه نوبت‌ها - معمولاً برای ادمین/نمای کلی
 */
export async function getAllAppointments(): Promise<Appointment[]> {
  const response = await api.get<AppointmentsApiListResponse | Appointment[]>(
    "/appointments"
  );

  return normalizeAppointmentsResponse(response.data);
}

/**
 * نوبت‌های پزشک
 * اگر بک‌اندت همین الان GET /appointments را برای دکتر برمی‌گرداند،
 * این تابع از همان استفاده می‌کند.
 * اگر بعداً endpoint اختصاصی مثل /appointments/doctor/{id} ساختی،
 * فقط همین تابع را عوض می‌کنی.
 */
export async function getDoctorAppointments(
  doctorId?: number
): Promise<Appointment[]> {
  if (doctorId) {
    try {
      const response = await api.get<AppointmentsApiListResponse | Appointment[]>(
        `/appointments/doctor/${doctorId}`
      );
      return normalizeAppointmentsResponse(response.data);
    } catch {
      // fallback به endpoint عمومی دکتر
    }
  }

  const fallbackResponse = await api.get<AppointmentsApiListResponse | Appointment[]>(
    "/appointments"
  );

  return normalizeAppointmentsResponse(fallbackResponse.data);
}

/**
 * ثبت نوبت جدید توسط بیمار
 */
export async function createAppointment(
  payload: CreateAppointmentPayload
): Promise<Appointment> {
  const cleanPayload = {
    availability_id: payload.availability_id,
    notes: payload.notes?.trim() ? payload.notes.trim() : undefined,
  };

  const response = await api.post<CreateAppointmentResponse>(
    "/appointments",
    cleanPayload
  );

  return normalizeSingleAppointmentResponse(response.data);
}

/**
 * لغو نوبت توسط بیمار
 */
export async function cancelAppointment(
  appointmentId: number
): Promise<CancelAppointmentResponse> {
  const response = await api.put<CancelAppointmentResponse>(
    `/appointments/${appointmentId}/cancel`
  );

  return response.data;
}

/**
 * تکمیل نوبت توسط پزشک
 */
export async function completeAppointment(
  appointmentId: number
): Promise<CompleteAppointmentResponse> {
  const response = await api.put<CompleteAppointmentResponse>(
    `/appointments/${appointmentId}/complete`
  );

  return response.data;
}