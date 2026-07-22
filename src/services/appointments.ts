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

type UnknownRecord = Record<string, any>;

function firstDefined<T>(
  ...values: Array<T | null | undefined>
): T | null {
  return values.find(
    (value) => value !== undefined && value !== null && value !== ""
  ) ?? null;
}

function normalizeAppointment(item: UnknownRecord): Appointment {
  return {
    id: Number(
      firstDefined(
        item?.id,
        item?.appointment_id
      ) ?? 0
    ),

    doctor_id: Number(
      firstDefined(
        item?.doctor_id,
        item?.doctor?.id,
        item?.doctor?.user_id
      ) ?? 0
    ),

    patient_id: Number(
      firstDefined(
        item?.patient_id,
        item?.patient?.id,
        item?.patient?.user_id
      ) ?? 0
    ),

    availability_id: Number(
      firstDefined(
        item?.availability_id,
        item?.time_slot_id,
        item?.slot_id,
        item?.time_slot?.id,
        item?.slot?.id,
        item?.availability?.id
      ) ?? 0
    ),

    doctor_name: firstDefined(
      item?.doctor_name,
      item?.doctor_full_name,
      item?.doctor?.name,
      item?.doctor?.full_name,
      item?.doctor?.user?.name,
      item?.doctor?.user?.full_name
    ),

    doctor_specialty: firstDefined(
      item?.doctor_specialty,
      item?.specialty,
      item?.speciality,
      item?.specialization,
      item?.doctor?.specialty,
      item?.doctor?.speciality,
      item?.doctor?.specialization
    ),

    patient_name: firstDefined(
      item?.patient_name,
      item?.patient_full_name,
      item?.patient?.name,
      item?.patient?.full_name,
      item?.patient?.user?.name,
      item?.patient?.user?.full_name
    ),

    status:
      firstDefined<AppointmentStatus>(
        item?.status,
        item?.appointment_status
      ) ?? "confirmed",

    date: firstDefined(
      item?.date,
      item?.appointment_date,
      item?.scheduled_date,
      item?.visit_date,
      item?.day,
      item?.time_slot?.date,
      item?.time_slot?.day,
      item?.slot?.date,
      item?.slot?.day,
      item?.availability?.date,
      item?.availability?.day
    ),

    start_time: firstDefined(
      item?.start_time,
      item?.startTime,
      item?.from_time,
      item?.fromTime,
      item?.time,
      item?.appointment_time,
      item?.appointmentTime,
      item?.scheduled_time,
      item?.scheduledTime,
      item?.starts_at,
      item?.startsAt,
      item?.time_slot?.start_time,
      item?.time_slot?.startTime,
      item?.time_slot?.from_time,
      item?.time_slot?.fromTime,
      item?.time_slot?.time,
      item?.time_slot?.starts_at,
      item?.time_slot?.startsAt,
      item?.slot?.start_time,
      item?.slot?.startTime,
      item?.slot?.from_time,
      item?.slot?.fromTime,
      item?.slot?.time,
      item?.slot?.starts_at,
      item?.slot?.startsAt,
      item?.availability?.start_time,
      item?.availability?.startTime,
      item?.availability?.from_time,
      item?.availability?.fromTime,
      item?.availability?.time,
      item?.availability?.starts_at,
      item?.availability?.startsAt
    ),

    end_time: firstDefined(
      item?.end_time,
      item?.endTime,
      item?.to_time,
      item?.toTime,
      item?.finish_time,
      item?.finishTime,
      item?.ends_at,
      item?.endsAt,
      item?.time_slot?.end_time,
      item?.time_slot?.endTime,
      item?.time_slot?.to_time,
      item?.time_slot?.toTime,
      item?.time_slot?.finish_time,
      item?.time_slot?.finishTime,
      item?.time_slot?.ends_at,
      item?.time_slot?.endsAt,
      item?.slot?.end_time,
      item?.slot?.endTime,
      item?.slot?.to_time,
      item?.slot?.toTime,
      item?.slot?.finish_time,
      item?.slot?.finishTime,
      item?.slot?.ends_at,
      item?.slot?.endsAt,
      item?.availability?.end_time,
      item?.availability?.endTime,
      item?.availability?.to_time,
      item?.availability?.toTime,
      item?.availability?.finish_time,
      item?.availability?.finishTime,
      item?.availability?.ends_at,
      item?.availability?.endsAt
    ),

    notes: firstDefined(
      item?.notes,
      item?.description,
      item?.comment
    ),
  };
}

function normalizeAppointmentList(data: any): Appointment[] {
  const items =
    data?.items ??
    data?.data?.items ??
    data?.data?.appointments ??
    data?.data?.results ??
    data?.data ??
    data?.appointments ??
    data?.results ??
    data;

  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map(normalizeAppointment)
    .filter((appointment) => appointment.id > 0);
}

function isNotFoundError(error: any): boolean {
  return error?.response?.status === 404;
}

async function safeGetList(
  url: string,
  warningMessage: string
): Promise<Appointment[]> {
  try {
    const response = await api.get(url);
    return normalizeAppointmentList(response.data);
  } catch (error: any) {
    if (isNotFoundError(error)) {
      console.warn(warningMessage);
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
  const response = await api.post(
    `/appointments/book/${slotId}`
  );

  return response.data;
}

export async function getMyAppointments(): Promise<Appointment[]> {
  return safeGetList(
    "/appointments/me",
    "My appointments endpoint not found"
  );
}

export async function getDoctorAppointments(): Promise<Appointment[]> {
  return safeGetList(
    "/appointments",
    "Doctor appointments endpoint not found"
  );
}

export async function getAllAppointments(): Promise<Appointment[]> {
  return safeGetList(
    "/appointments",
    "Appointments endpoint not found"
  );
}

export async function cancelAppointment(
  appointmentId: number
): Promise<unknown> {
  const response = await api.put(
    `/appointments/${appointmentId}/cancel`
  );

  return response.data;
}

export async function completeAppointment(
  appointmentId: number
): Promise<unknown> {
  const response = await api.put(
    `/appointments/${appointmentId}/complete`
  );

  return response.data;
}
