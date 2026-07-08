// Path: src/hooks/useAppointments.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import api from "../services/api";

/* =========================
   Types
========================= */

export type AppointmentStatus =
  | "booked"
  | "cancelled"
  | "canceled"
  | "completed"
  | "pending";

export interface AppointmentDoctor {
  id: number;
  name: string;
  specialty: string;
}

export interface AppointmentAvailability {
  id: number;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  is_available?: boolean;
  is_booked?: boolean;
}

export interface Appointment {
  id: number;
  doctor_id: number;
  availability_id: number;
  patient_id: number;
  status: AppointmentStatus | string;
  notes?: string | null;
  created_at?: string | null;
  doctor?: AppointmentDoctor | null;
  availability?: AppointmentAvailability | null;
}

export interface CancelAppointmentResponse {
  message: string;
  appointment_id: number;
  status: AppointmentStatus | string;
}

interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

/* =========================
   API functions
========================= */

async function getMyAppointmentsRequest(): Promise<Appointment[]> {
  const response = await api.get<Appointment[]>("/appointments/my");
  return response.data;
}

async function cancelAppointmentRequest(
  appointmentId: number
): Promise<CancelAppointmentResponse> {
  const response = await api.put<CancelAppointmentResponse>(
    `/appointments/${appointmentId}/cancel`
  );
  return response.data;
}

/* =========================
   Hooks
========================= */

export function useMyAppointments() {
  return useQuery<Appointment[], Error>({
    queryKey: ["my-appointments"],
    queryFn: getMyAppointmentsRequest,
    staleTime: 30 * 1000,
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation<CancelAppointmentResponse, Error, number>({
    mutationFn: cancelAppointmentRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["my-appointments"],
      });
    },
    onError: (error) => {
      console.error("Cancel appointment failed:", error);
    },
  });
}

/* =========================
   Optional helper
========================= */

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return (
      data?.detail ||
      data?.message ||
      error.message ||
      "خطا در ارتباط با سرور"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "خطای ناشناخته رخ داده است.";
}