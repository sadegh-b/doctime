// src/components/BookingCalendar.tsx

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Calendar, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

import {
  getDoctorAvailability,
  type AvailabilitySlot,
} from "../services/availability";
import { createAppointment } from "../services/appointments";
import { getAccessToken } from "../services/auth";

interface Props {
  doctorId: number;
  doctorName?: string;
  specialty?: string;
}

interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

const toPersianDigits = (v: string | number) => String(v).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

const getPersianDateDetails = (dateStr: string) => {
  try {
    const parts = dateStr.split("-").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
      throw new Error("Invalid format");
    }

    const [year, month, day] = parts;
    let date: Date;

    if (year > 1900) {
      date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    } else {
      date = jalaliToGregorian(year, month, day);
    }

    const weekday = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "long" }).format(date);
    const dayNum = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { day: "numeric" }).format(date);
    const monthName = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { month: "long" }).format(date);

    return { weekday, day: dayNum, month: monthName };
  } catch (error) {
    const parts = dateStr.split("-");
    return {
      weekday: "روز",
      day: toPersianDigits(parts[2] || ""),
      month: toPersianDigits(parts[1] || ""),
    };
  }
};

function jalaliToGregorian(jy: number, jm: number, jd: number): Date {
  const salA = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy = jy <= 979 ? 621 : 1600;
  jy -= jy <= 979 ? 0 : 979;
  const jy2 = jm > 2 ? jy + 1 : jy;
  let days = (365 * jy) + Math.floor(jy2 / 33) + Math.floor((jy2 % 33 + 3) / 4) - 224427 + jd + (jm > 2 ? salA[jm - 1] + 1 : salA[jm - 1]);
  gy += 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const salB = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  for (let i = 0; i < 13; i++) {
    gm = i;
    if (gd <= salB[i]) break;
    gd -= salB[i];
  }
  return new Date(Date.UTC(gy, gm - 1, gd, 12, 0, 0));
}

const formatTime = (t: string) => toPersianDigits(t.slice(0, 5));

export default function BookingCalendar({ doctorId, doctorName, specialty }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [showOtherTimes, setShowOtherTimes] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data: availabilitySlots = [], isLoading, isError } = useQuery<AvailabilitySlot[]>({
    queryKey: ["availability", doctorId],
    queryFn: () => getDoctorAvailability(doctorId),
    enabled: !!doctorId,
  });

  const freeSlots = useMemo(() => {
    return availabilitySlots.filter((s) => !s.is_booked && s.is_available !== false);
  }, [availabilitySlots]);

  const groupedSlots = useMemo(() => {
    const groups: Record<string, AvailabilitySlot[]> = {};
    freeSlots.forEach((slot) => {
      if (!groups[slot.date]) groups[slot.date] = [];
      groups[slot.date].push(slot);
    });
    return groups;
  }, [freeSlots]);

  const dates = useMemo(() => {
    return Object.keys(groupedSlots).sort();
  }, [groupedSlots]);

  // پیدا کردن نزدیک‌ترین نوبت خالی
  const nearestSlot = useMemo(() => {
    if (dates.length === 0) return null;
    const firstDate = dates[0];
    const slotsForDate = groupedSlots[firstDate] || [];
    if (slotsForDate.length === 0) return null;

    // مرتب‌سازی بر اساس زمان شروع برای پیدا کردن اولین نوبت روز
    const sorted = [...slotsForDate].sort((a, b) => a.start_time.localeCompare(b.start_time));
    return {
      date: firstDate,
      slot: sorted[0]
    };
  }, [dates, groupedSlots]);

  // مقداردهی اولیه نوبت پیش‌فرض به عنوان نزدیک‌ترین نوبت خالی
  useMemo(() => {
    if (nearestSlot && !selectedSlotId && !selectedDate) {
      setSelectedDate(nearestSlot.date);
      setSelectedSlotId(nearestSlot.slot.id);
    }
  }, [nearestSlot, selectedSlotId, selectedDate]);

  const bookingMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["availability", doctorId] });
      setSelectedSlotId(null);
      setMessage({ type: "success", text: "نوبت شما با موفقیت رزرو گردید." });
    },
    onError: (err: unknown) => {
      let msg = "خطا در ثبت نوبت";
      if (err instanceof AxiosError) {
        const data = err.response?.data as ApiErrorResponse;
        msg = data?.detail || data?.message || err.message || msg;
      }
      setMessage({ type: "error", text: msg });
    },
  });

  const handleBooking = () => {
    if (!getAccessToken()) {
      setMessage({ type: "error", text: "لطفاً ابتدا وارد حساب کاربری خود شوید." });
      setTimeout(() => navigate("/login"), 1500);
      return;
    }
    if (!selectedSlotId) return;
    bookingMutation.mutate({ doctor_id: doctorId, availability_id: selectedSlotId });
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse text-slate-500 font-bold">در حال بارگذاری نوبت‌ها...</div>;
  if (isError || freeSlots.length === 0) {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl text-amber-800 flex items-center gap-3">
        <AlertCircle /> <span>نوبت آزادی برای این پزشک یافت نشد.</span>
      </div>
    );
  }

  const nearestDateDetails = nearestSlot ? getPersianDateDetails(nearestSlot.date) : null;
  const selectedDateDetails = selectedDate ? getPersianDateDetails(selectedDate) : null;

  return (
    <div className="bg-white border border-slate-200/80 rounded-[30px] shadow-[0_20px_50px_rgba(15,23,42,0.06)] overflow-hidden">
      {/* هدر باکس رزرو */}
      <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-5 h-5 opacity-90" />
          <span className="text-xs font-black tracking-wide uppercase opacity-90">رزرو آنلاین نوبت</span>
        </div>
        <h3 className="text-xl font-black">{doctorName || "پزشک متخصص"}</h3>
        <p className="text-blue-100 text-sm mt-1 font-bold">{specialty}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* بخش نمایش نزدیک‌ترین زمان خالی */}
        {nearestSlot && nearestDateDetails && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold text-blue-700 block">نزدیک‌ترین زمان خالی</span>
                <span className="text-base font-black text-slate-900 mt-1 block">
                  {nearestDateDetails.weekday} {nearestDateDetails.day} {nearestDateDetails.month} - ساعت {formatTime(nearestSlot.slot.start_time)}
                </span>
              </div>

              {!showOtherTimes && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate(nearestSlot.date);
                    setSelectedSlotId(nearestSlot.slot.id);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                    selectedSlotId === nearestSlot.slot.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {selectedSlotId === nearestSlot.slot.id ? "انتخاب شده" : "انتخاب این زمان"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* دکمه کشویی برای زمان‌های دیگر */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowOtherTimes(!showOtherTimes)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 bg-slate-50 text-xs font-black text-slate-700 transition hover:bg-slate-100"
          >
            <span>{showOtherTimes ? "پنهان کردن زمان‌های دیگر" : "زمان انتخابی دیگری"}</span>
            {showOtherTimes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* بخش تقویم و ساعت‌ها که به صورت کشویی باز می‌شود */}
        {showOtherTimes && (
          <div className="space-y-6 pt-2 border-t border-slate-100 animate-fadeIn">
            {/* انتخاب تاریخ */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
              {dates.map((date) => {
                const { weekday, day, month } = getPersianDateDetails(date);
                const isSelected = selectedDate === date;

                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedSlotId(null);
                    }}
                    className={`flex-shrink-0 min-w-[100px] p-3 rounded-2xl transition-all border text-center ${
                      isSelected
                        ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100 scale-[1.02]"
                        : "bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div className={`text-[11px] font-bold ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                      {weekday}
                    </div>
                    <div className="text-lg font-black mt-1">
                      {day}
                    </div>
                    <div className={`text-[10px] font-bold ${isSelected ? "text-blue-100/90" : "text-slate-400"}`}>
                      {month}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* انتخاب ساعت برای تاریخ انتخاب شده */}
            {selectedDate && (
              <div>
                <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold text-sm">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>
                    ساعت‌های در دسترس {selectedDateDetails?.weekday} {selectedDateDetails?.day} {selectedDateDetails?.month}:
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {groupedSlots[selectedDate].map((slot) => {
                    const isSelected = selectedSlotId === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`py-3 px-2 rounded-xl text-xs font-black border transition-all text-center ${
                          isSelected
                            ? "bg-blue-50 border-blue-600 text-blue-700 ring-1 ring-blue-600 shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:border-blue-400"
                        }`}
                      >
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* بخش پایین - تایید نهایی */}
      <div className="p-6 bg-slate-50 border-t border-slate-200/60">
        {message && (
          <div className={`mb-4 p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
            message.type === "success" ? "bg-emerald-50 border border-emerald-100 text-emerald-700" : "bg-red-50 border border-red-100 text-red-700"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="w-4.5 h-4.5" /> : <AlertCircle className="w-4.5 h-4.5" />}
            {message.text}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-right w-full sm:w-auto">
            <span className="text-[11px] font-extrabold text-slate-400 block uppercase tracking-wider">زمان انتخابی شما</span>
            <span className="text-[14px] font-black text-slate-900 mt-1 block">
              {selectedSlotId && selectedDate
                ? `${getPersianDateDetails(selectedDate).weekday} ${getPersianDateDetails(selectedDate).day} ${getPersianDateDetails(selectedDate).month} ساعت ${formatTime(groupedSlots[selectedDate].find(s => s.id === selectedSlotId)!.start_time)}`
                : "هنوز انتخابی نکرده‌اید"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleBooking}
            disabled={!selectedSlotId || bookingMutation.isPending}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-2xl font-black text-sm shadow-[0_10px_24px_rgba(37,99,235,0.2)] transition active:scale-95 disabled:shadow-none"
          >
            {bookingMutation.isPending ? "در حال پردازش..." : "تایید و رزرو نوبت"}
          </button>
        </div>
      </div>
    </div>
  );
}
