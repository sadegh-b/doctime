// src/components/BookingCalendar.tsx
import { useEffect, useMemo, useState } from "react";
import TimeSlot from "./TimeSlot";
import { useAppointments, useCreateAppointment } from "../hooks/useAppointments";
import { useDoctorSchedule } from "../hooks/useDoctorSchedule";
import type { Appointment } from "../types/appointment";

interface Props {
  doctorId: number;
}

export default function BookingCalendar({ doctorId }: Props) {
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const {
    data: schedule = [],
    isLoading: isScheduleLoading,
    isError: isScheduleError,
    error: scheduleError,
  } = useDoctorSchedule(doctorId);

  const {
    data: appointments = [],
    isLoading: isAppointmentsLoading,
    isError: isAppointmentsError,
    error: appointmentsError,
  } = useAppointments(doctorId);

  const createAppointmentMutation = useCreateAppointment();

  useEffect(() => {
    if (schedule.length > 0 && !selectedDay) {
      setSelectedDay(schedule[0].day);
    }
  }, [schedule, selectedDay]);

  useEffect(() => {
    setSelectedTime("");
  }, [selectedDay]);

  const currentSchedule = useMemo(() => {
    return schedule.find((item) => item.day === selectedDay);
  }, [schedule, selectedDay]);

  const bookedTimes = useMemo(() => {
    return appointments
      .filter((appointment: Appointment) => appointment.date === selectedDay)
      .map((appointment: Appointment) => appointment.time);
  }, [appointments, selectedDay]);

  async function handleBooking() {
    if (!selectedDay) {
      alert("لطفا روز را انتخاب کنید");
      return;
    }

    if (!selectedTime) {
      alert("لطفا زمان را انتخاب کنید");
      return;
    }

    try {
      await createAppointmentMutation.mutateAsync({
        doctorId,
        doctorName: "پزشک",
        patientName: "کاربر",
        date: selectedDay,
        time: selectedTime,
        notes: "",
      });

      alert("نوبت با موفقیت رزرو شد");
      setSelectedTime("");
    } catch (error) {
      console.error("Booking error:", error);
      alert("خطا در رزرو نوبت");
    }
  }

  if (isScheduleLoading || isAppointmentsLoading) {
    return (
      <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
        در حال بارگذاری اطلاعات نوبت‌دهی...
      </div>
    );
  }

  if (isScheduleError || isAppointmentsError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        خطا در دریافت اطلاعات نوبت‌دهی
        <div className="mt-2 text-xs text-red-600">
          {(scheduleError as Error)?.message ||
            (appointmentsError as Error)?.message ||
            "Unknown error"}
        </div>
      </div>
    );
  }

  if (schedule.length === 0) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
        برنامه‌ای برای این پزشک ثبت نشده است.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {schedule.map((day) => (
          <button
            key={day.id}
            onClick={() => setSelectedDay(day.day)}
            className={`rounded-xl border px-4 py-2 transition ${
              selectedDay === day.day
                ? "bg-blue-600 text-white"
                : "bg-blue-100 hover:bg-blue-200"
            }`}
          >
            {day.day}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {currentSchedule?.slots?.length ? (
          currentSchedule.slots.map((time: string) => (
            <TimeSlot
              key={time}
              time={time}
              disabled={bookedTimes.includes(time)}
              onSelect={setSelectedTime}
            />
          ))
        ) : (
          <div className="col-span-full rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
            برای این روز زمانی ثبت نشده است.
          </div>
        )}
      </div>

      {selectedTime && (
        <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-700">
          زمان انتخاب‌شده:{" "}
          <span className="font-bold">
            {selectedDay} - {selectedTime}
          </span>
        </div>
      )}

      <button
        onClick={handleBooking}
        disabled={createAppointmentMutation.isPending || !selectedDay || !selectedTime}
        className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {createAppointmentMutation.isPending ? "در حال رزرو..." : "رزرو نوبت"}
      </button>
    </div>
  );
}