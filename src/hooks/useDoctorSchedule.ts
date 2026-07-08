import { useQuery } from "@tanstack/react-query";
import { getDoctorSchedule } from "../services/schedules";

export function useDoctorSchedule(doctorId?: number) {
  return useQuery({
    queryKey: ["doctor-schedule", doctorId],
    queryFn: () => getDoctorSchedule(doctorId as number),
    enabled: !!doctorId,
  });
}