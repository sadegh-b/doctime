import api from "./api";

export type CreateAppointmentPayload = {
  slotId: number;
  notes?: string;
};

export async function createAppointment(data: CreateAppointmentPayload) {
  const response = await api.post("/appointments", {
    slot_id: data.slotId,
    notes: data.notes ?? "",
  });

  return response.data;
}

export async function cancelAppointment(appointmentId: number) {
  const response = await api.delete(`/appointments/${appointmentId}`);
  return response.data;
}

export async function getMyAppointments() {
  const response = await api.get("/appointments/my");
  return response.data;
}

export async function getDoctorAppointments(doctorId: number) {
  const response = await api.get(`/appointments/doctor/${doctorId}`);
  return response.data;
}