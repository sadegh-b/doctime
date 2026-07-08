import api from "./api";


// ===============================
// Types
// ===============================

export type AppointmentStatus =
  | "booked"
  | "cancelled"
  | "completed"
  | "pending"
  | string;


export type AppointmentItem = {
  id: number;

  doctor_id: number;
  patient_id: number;
  availability_id: number;

  doctor_name?: string;
  specialty?: string;

  date?: string | null;
  start_time?: string | null;
  end_time?: string | null;

  status: AppointmentStatus;

  notes?: string | null;
};



export type CreateAppointmentPayload = {
  doctor_id: number;
  availability_id: number;
  notes?: string;
};



export type CancelAppointmentResponse = {
  success?: boolean;
  message?: string;

  appointment_id: number;

  status: AppointmentStatus;
};



// ===============================
// Get My Appointments
// ===============================

export async function getMyAppointments(): Promise<
  AppointmentItem[]
> {

  const response = await api.get(
    "/appointments/my"
  );


  const data = response.data;


  // اگر مستقیم آرایه بود
  if (Array.isArray(data)) {
    return data;
  }


  // حالت فعلی FastAPI
  // {
  // success:true,
  // count:6,
  // items:[]
  // }

  if (
    data &&
    Array.isArray(data.items)
  ) {
    return data.items;
  }



  // حالت احتمالی آینده
  if (
    data &&
    Array.isArray(data.data)
  ) {
    return data.data;
  }



  return [];
}



// ===============================
// Create Appointment
// ===============================

export async function createAppointment(
  payload: CreateAppointmentPayload
): Promise<AppointmentItem> {


  const response = await api.post(
    "/appointments",
    payload
  );


  const data = response.data;



  // بک‌اند فعلی:
  // {
  // success:true,
  // data:{appointment}
  // }


  if (
    data &&
    data.data
  ) {
    return data.data;
  }



  return data;
}



// ===============================
// Cancel Appointment
// ===============================

export async function cancelAppointment(
  appointmentId: number
): Promise<CancelAppointmentResponse> {


  const response = await api.put(
    `/appointments/${appointmentId}/cancel`
  );


  return response.data;
}