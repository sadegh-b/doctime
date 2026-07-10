export type AppointmentStatus =
  | "reserved"
  | "booked"
  | "pending"
  | "completed"
  | "cancelled";

export type Appointment = {
  id: number;

  doctor_id: number;
  patient_id?: number | null;
  availability_id?: number | null;

  doctor_name?: string | null;
  patient_name?: string | null;
  specialty?: string | null;

  date?: string | null;
  start_time?: string | null;
  end_time?: string | null;

  status: AppointmentStatus | string;
  notes?: string | null;
  created_at?: string | null;

  availability?: {
    id?: number;
    date?: string | null;
    start_time?: string | null;
    end_time?: string | null;
  } | null;

  patient?: {
    id?: number;
    name?: string;
    phone?: string;
  } | null;
};