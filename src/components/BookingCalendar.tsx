import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import {
  getDoctorAvailability,
  type AvailabilitySlot,
} from "../services/availability";
import { createAppointment } from "../services/appointments";

interface Props {
  doctorId: number;
  doctorName?: string;
  specialty?: string;
}

function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

function formatPersianDate(dateStr?: string) {
  if (!dateStr) return "تاریخ نامشخص";

  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, (month || 1) - 1, day || 1);

    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(date);
  } catch {
    return toPersianDigits(dateStr);
  }
}

function formatPersianTime(time?: string) {
  if (!time) return "--:--";
  return toPersianDigits(time.slice(0, 5));
}

export default function BookingCalendar({
  doctorId,
  doctorName,
  specialty,
}: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  const {
    data: availabilitySlots = [],
    isLoading,
    isError,
  } = useQuery<AvailabilitySlot[]>({
    queryKey: ["availability", doctorId],
    queryFn: () => getDoctorAvailability(doctorId),
    enabled: !!doctorId,
  });

  const freeSlots = useMemo(
    () =>
      availabilitySlots.filter(
        (slot) => slot.is_available && !slot.is_booked
      ),
    [availabilitySlots]
  );

  const selectedSlot = useMemo(
    () => freeSlots.find((slot) => slot.id === selectedSlotId) ?? null,
    [freeSlots, selectedSlotId]
  );

  const bookingMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["availability", doctorId],
      });

      setSelectedSlotId(null);
      alert("نوبت با موفقیت ثبت شد");
    },
    onError: (err: unknown) => {
      let message = "خطا در رزرو نوبت";

      if (err instanceof AxiosError) {
        message =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          message;
      }

      alert(message);
    },
  });

  const handleBooking = () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("access_token");

    if (!token) {
      alert("برای رزرو ابتدا وارد حساب کاربری شوید.");
      navigate("/login");
      return;
    }

    if (!selectedSlotId) {
      alert("یک زمان را انتخاب کنید");
      return;
    }

    bookingMutation.mutate({
      doctor_id: doctorId,
      availability_id: selectedSlotId,
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 text-sm font-bold text-slate-600 shadow-sm">
        در حال دریافت نوبت‌های پزشک...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700 shadow-sm">
        خطا در دریافت نوبت‌ها. دوباره تلاش کنید.
      </div>
    );
  }

  if (freeSlots.length === 0) {
    return (
      <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-800 shadow-sm">
        فعلاً نوبت آزادی برای این پزشک ثبت نشده است.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(doctorName || specialty) && (
        <div className="rounded-[28px] border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-sky-50 p-5 shadow-sm">
          {doctorName && (
            <h3 className="text-xl font-black text-slate-900">
              رزرو نوبت برای {doctorName}
            </h3>
          )}

          {specialty && (
            <p className="mt-2 text-sm font-bold text-slate-600">
              تخصص: {specialty}
            </p>
          )}

          <p className="mt-3 text-sm font-bold leading-7 text-slate-500">
            یکی از زمان‌های آزاد زیر را انتخاب کنید و نوبت خود را آنلاین ثبت
            کنید.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {freeSlots.map((slot) => {
          const selected = selectedSlotId === slot.id;

          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => setSelectedSlotId(slot.id)}
              className={`rounded-[24px] border p-4 text-right transition-all duration-200 ${
                selected
                  ? "border-cyan-500 bg-cyan-600 text-white shadow-[0_12px_30px_rgba(6,182,212,0.22)]"
                  : "border-slate-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/30"
              }`}
            >
              <div
                className={`text-sm font-black leading-7 ${
                  selected ? "text-white" : "text-slate-900"
                }`}
              >
                {formatPersianDate(slot.date)}
              </div>

              <div
                className={`mt-2 text-sm font-bold ${
                  selected ? "text-cyan-50" : "text-slate-600"
                }`}
              >
                {formatPersianTime(slot.start_time)} تا{" "}
                {formatPersianTime(slot.end_time)}
              </div>

              <div
                className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-black ${
                  selected
                    ? "bg-white/15 text-white"
                    : "bg-cyan-50 text-cyan-800"
                }`}
              >
                {selected ? "زمان انتخاب شده" : "انتخاب زمان"}
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-extrabold text-slate-500">
              زمان انتخاب‌شده
            </p>

            {selectedSlot ? (
              <div className="mt-2">
                <p className="text-base font-black text-slate-900">
                  {formatPersianDate(selectedSlot.date)}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-600">
                  {formatPersianTime(selectedSlot.start_time)} تا{" "}
                  {formatPersianTime(selectedSlot.end_time)}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm font-bold text-slate-400">
                هنوز زمانی انتخاب نشده است.
              </p>
            )}
          </div>

          <button
            onClick={handleBooking}
            disabled={bookingMutation.isPending || !selectedSlotId}
            className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 px-8 font-black text-white shadow-[0_10px_24px_rgba(6,182,212,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(6,182,212,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {bookingMutation.isPending ? "در حال رزرو..." : "رزرو نوبت"}
          </button>
        </div>
      </div>
    </div>
  );
}