// src/hooks/useAppointments.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAppointment,
  getDoctorAppointments,
  cancelAppointment,
} from "../services/appointments";
import type { CreateAppointmentPayload } from "../types/appointment";

export function useAppointments(doctorId: number) {
  return useQuery({
    queryKey: ["doctor-appointments", doctorId],
    queryFn: () => getDoctorAppointments(doctorId),
    enabled: !!doctorId,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentPayload) => createAppointment(data),
    onSuccess: (newAppointment) => {
      queryClient.invalidateQueries({
        queryKey: ["doctor-appointments", newAppointment.doctorId],
      });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: number) => cancelAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["doctor-appointments"],
      });
    },
  });
}