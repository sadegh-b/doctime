import api from "./api";

export type AppointmentStatus =
  | "booked"
  | "reserved"
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | string;

export interface Appointment {
  id: number;
  doctor_id: number;
  patient_id: number;
  availability_id: number;
  doctor_name?: string | null;
  doctor_specialty?: string | null;
  patient_name?: string | null;
  status: AppointmentStatus;
  date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  notes?: string | null;
}

export interface CreateAppointmentPayload {
  availability_id: number;
  notes?: string;
}

export interface CreateAppointmentResponse {
  success: boolean;
  message?: string;
  appointment_id: number;
}

function normalizeAppointment(item: any): Appointment {
  return {
    id: Number(item?.id ?? item?.appointment_id ?? 0),
    doctor_id: Number(item?.doctor_id ?? item?.doctor?.id ?? 0),
    patient_id: Number(item?.patient_id ?? item?.patient?.id ?? 0),
    availability_id: Number(
      item?.availability_id ??
        item?.time_slot?.id ??
        item?.availability?.id ??
        0
    ),
    doctor_name:
      item?.doctor_name ??
      item?.doctor?.name ??
      item?.doctor?.full_name ??
      item?.doctor?.user?.name ??
      null,
    doctor_specialty:
      item?.doctor_specialty ??
      item?.specialty ??
      item?.doctor?.specialty ??
      item?.doctor?.specialization ??
      item?.doctor?.speciality ??
      null,
    patient_name:
      item?.patient_name ??
      item?.patient?.name ??
      item?.patient?.full_name ??
      item?.patient?.user?.name ??
      null,
    status: item?.status ?? "confirmed",
    date:
      item?.date ??
      item?.appointment_date ??
      item?.day ??
      item?.availability?.date ??
      item?.time_slot?.date ??
      null,
    start_time:
      item?.start_time ??
      item?.time_slot?.start_time ??
      item?.availability?.start_time ??
      null,
    end_time:
      item?.end_time ??
      item?.time_slot?.end_time ??
      item?.availability?.end_time ??
      null,
    notes: item?.notes ?? null,
  };
}

function normalizeAppointmentList(data: any): Appointment[] {
  const items = data?.items ?? data?.data ?? data?.appointments ?? data ?? [];
  return Array.isArray(items) ? items.map(normalizeAppointment) : [];
}

function isNotFoundError(error: any): boolean {
  return error?.response?.status === 404;
}

async function safeGetList(
  url: string,
  warnMessage: string
): Promise<Appointment[]> {
  try {
    const response = await api.get(url);
    return normalizeAppointmentList(response.data);
  } catch (error: any) {
    if (isNotFoundError(error)) {
      console.warn(warnMessage);
      return [];
    }

    throw error;
  }
}

export async function createAppointment(
  payload: CreateAppointmentPayload
): Promise<CreateAppointmentResponse> {
  const response = await api.post("/appointments", {
    availability_id: payload.availability_id,
    notes: payload.notes,
  });

  return response.data;
}

export async function bookAppointment(
  slotId: number
): Promise<CreateAppointmentResponse> {
  const response = await api.post(`/appointments/book/${slotId}`);
  return response.data;
}

export async function getMyAppointments(): Promise<Appointment[]> {
  return safeGetList("/appointments/me", "My appointments endpoint not found");
}

export async function getDoctorAppointments(): Promise<Appointment[]> {
  return safeGetList("/appointments", "Doctor appointments endpoint not found");
}

export async function getAllAppointments(): Promise<Appointment[]> {
  return safeGetList("/appointments", "Appointments endpoint not found");
}

export async function cancelAppointment(appointmentId: number) {
  const response = await api.put(`/appointments/${appointmentId}/cancel`);
  return response.data;
}

export async function completeAppointment(appointmentId: number) {
  const response = await api.put(`/appointments/${appointmentId}/complete`);
  return response.data;
}
