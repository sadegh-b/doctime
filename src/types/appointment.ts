export interface Appointment {
  id: number;
  doctor_id?: number;
  patient_id?: number;
  availability_id?: number;
  status?: string;
  created_at?: string;
}

export interface CreateAppointmentPayload {
  availability_id: number;
}