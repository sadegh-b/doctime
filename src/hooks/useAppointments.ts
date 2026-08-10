import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  cancelAppointment,
  getMyAppointments,
  type Appointment,
} from "../services/appointments";

export type AppointmentStatus =
  | "booked"
  | "cancelled"
  | "canceled"
  | "completed"
  | "pending"
  | "confirmed"
  | "reserved";

export interface CancelAppointmentResponse {
  message: string;
  appointment_id?: number;
  status: AppointmentStatus | string;
}

interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

export function useMyAppointments() {
  return useQuery<Appointment[], Error>({
    queryKey: ["my-appointments"],
    queryFn: getMyAppointments,
    staleTime: 30 * 1000,
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation<CancelAppointmentResponse, Error, number>({
    mutationFn: cancelAppointment as any,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["my-appointments"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["availability"],
        }),
      ]);
    },
    onError: (error) => {
      console.error("Cancel appointment failed:", error);
    },
  });
}

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
