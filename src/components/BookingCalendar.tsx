import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

type CalendarDay = {
  isoDate: string;
  dayNumber: number;
  slots: AvailabilitySlot[];
};

const WEEK_DAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
];

const toPersianDigits = (value: string) =>
  value.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

function formatTime(time: string) {
  return toPersianDigits(time.substring(0, 5));
}

function formatMonthTitle(date: Date) {
  return new Intl.DateTimeFormat("fa-IR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function persianDate(date: string) {
  const d = new Date(`${date}T12:00:00`);

  return {
    weekday: new Intl.DateTimeFormat("fa-IR", { weekday: "long" }).format(d),
    day: new Intl.DateTimeFormat("fa-IR", { day: "numeric" }).format(d),
    month: new Intl.DateTimeFormat("fa-IR", { month: "long" }).format(d),
  };
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// JavaScript getDay(): Sunday=0 ... Saturday=6
// We need: Saturday=0 ... Friday=6
function getSaturdayBasedOffset(date: Date) {
  return (date.getDay() + 1) % 7;
}

export default function BookingCalendar({
  doctorId,
  doctorName,
  specialty,
}: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");

  const { data: slots = [], isLoading } = useQuery<AvailabilitySlot[]>({
    queryKey: ["availability", doctorId],
    queryFn: () => getDoctorAvailability(doctorId),
    enabled: !!doctorId,
  });

  const freeSlots = useMemo(() => {
    return slots.filter((slot) => slot.is_available && !slot.is_booked);
  }, [slots]);

  const dates = useMemo(() => {
    return [...new Set(freeSlots.map((slot) => slot.date))].sort();
  }, [freeSlots]);

  const groupedByDate = useMemo(() => {
    const map = new Map<string, AvailabilitySlot[]>();

    for (const slot of freeSlots) {
      const current = map.get(slot.date) ?? [];
      current.push(slot);
      map.set(slot.date, current);
    }

    for (const entry of map.values()) {
      entry.sort((a, b) => a.start_time.localeCompare(b.start_time));
    }

    return map;
  }, [freeSlots]);

  const firstAvailableDate = dates[0] || "";

  useEffect(() => {
    if (!selectedDate && firstAvailableDate) {
      setSelectedDate(firstAvailableDate);
    }
  }, [selectedDate, firstAvailableDate]);

  const baseDate = useMemo(() => {
    if (selectedDate) {
      return new Date(`${selectedDate}T12:00:00`);
    }

    if (firstAvailableDate) {
      return new Date(`${firstAvailableDate}T12:00:00`);
    }

    return new Date();
  }, [selectedDate, firstAvailableDate]);

  const [visibleMonth, setVisibleMonth] = useState<number>(() => baseDate.getMonth());
  const [visibleYear, setVisibleYear] = useState<number>(() => baseDate.getFullYear());

  useEffect(() => {
    setVisibleMonth(baseDate.getMonth());
    setVisibleYear(baseDate.getFullYear());
  }, [baseDate]);

  const monthStart = useMemo(() => {
    return new Date(visibleYear, visibleMonth, 1, 12, 0, 0);
  }, [visibleYear, visibleMonth]);

  const monthEnd = useMemo(() => {
    return new Date(visibleYear, visibleMonth + 1, 0, 12, 0, 0);
  }, [visibleYear, visibleMonth]);

  const daysInMonth = monthEnd.getDate();
  const monthOffset = getSaturdayBasedOffset(monthStart);

  const calendarDays = useMemo<CalendarDay[]>(() => {
    return Array.from({ length: daysInMonth }, (_, index) => {
      const dayDate = new Date(visibleYear, visibleMonth, index + 1, 12, 0, 0);
      const isoDate = toIsoDate(dayDate);

      return {
        isoDate,
        dayNumber: index + 1,
        slots: groupedByDate.get(isoDate) ?? [],
      };
    });
  }, [daysInMonth, groupedByDate, visibleMonth, visibleYear]);

  const activeDate = selectedDate || firstAvailableDate || "";

  const activeDateParts = useMemo(() => {
    if (!activeDate) {
      return null;
    }

    return persianDate(activeDate);
  }, [activeDate]);

  const todaySlots = useMemo(() => {
    return freeSlots
      .filter((slot) => slot.date === activeDate)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [freeSlots, activeDate]);

  const bookingMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["availability", doctorId],
      });

      setSelectedSlotId(null);
      setMessage("نوبت شما با موفقیت ثبت شد.");
    },
    onError: (error: any) => {
      setMessage(error?.response?.data?.detail || "خطا در ثبت نوبت");
    },
  });

  function handleBooking() {
    const token = getAccessToken();

    if (!token) {
      navigate("/login");
      return;
    }

    if (!selectedSlotId) {
      return;
    }

    bookingMutation.mutate({
      availability_id: selectedSlotId,
    });
  }

  function handlePrevMonth() {
    setSelectedSlotId(null);
    setMessage("");

    if (visibleMonth === 0) {
      setVisibleMonth(11);
      setVisibleYear((prev) => prev - 1);
      return;
    }

    setVisibleMonth((prev) => prev - 1);
  }

  function handleNextMonth() {
    setSelectedSlotId(null);
    setMessage("");

    if (visibleMonth === 11) {
      setVisibleMonth(0);
      setVisibleYear((prev) => prev + 1);
      return;
    }

    setVisibleMonth((prev) => prev + 1);
  }

  function handleSelectDay(day: CalendarDay) {
    if (day.slots.length === 0) {
      return;
    }

    setSelectedDate(day.isoDate);
    setSelectedSlotId(null);
    setMessage("");
  }

  if (isLoading) {
    return <div className="p-8 text-center">در حال دریافت زمان‌ها...</div>;
  }

  if (freeSlots.length === 0) {
    return (
      <div className="p-6 bg-yellow-50 rounded-2xl text-yellow-700 flex gap-2" dir="rtl">
        <AlertCircle />
        نوبت آزادی وجود ندارد
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6" dir="rtl">
      <div className="bg-blue-600 text-white rounded-2xl p-5 mb-6">
        <div className="flex gap-2 items-center">
          <Calendar size={20} />
          <span>رزرو آنلاین نوبت</span>
        </div>

        <h2 className="text-xl font-black mt-3">{doctorName}</h2>

        <p>{specialty}</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handleNextMonth}
          className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition"
          aria-label="ماه بعد"
        >
          <ChevronRight size={18} />
        </button>

        <div className="font-black text-lg text-slate-800">
          {formatMonthTitle(monthStart)}
        </div>

        <button
          type="button"
          onClick={handlePrevMonth}
          className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition"
          aria-label="ماه قبل"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-3 text-center font-bold text-sm">
        {WEEK_DAYS.map((day, index) => (
          <div
            key={day}
            className={index === 6 ? "text-red-600 py-2" : "text-slate-700 py-2"}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: monthOffset }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="h-24 rounded-2xl bg-slate-50/50 border border-slate-100"
          />
        ))}

        {calendarDays.map((day, index) => {
          const hasSlots = day.slots.length > 0;
          const isSelected = activeDate === day.isoDate;
          const isFriday = (monthOffset + index) % 7 === 6;

          return (
            <button
              key={day.isoDate}
              type="button"
              disabled={!hasSlots}
              onClick={() => handleSelectDay(day)}
              className={[
                "relative h-28 rounded-2xl border p-3 text-right flex flex-col justify-between transition-all duration-200 overflow-hidden shadow-sm",
                isSelected
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 border-blue-600 text-white shadow-md scale-[1.01]"
                  : hasSlots
                    ? "bg-white border-slate-200 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5"
                    : "bg-slate-50/70 border-slate-100 text-slate-300 cursor-not-allowed",
              ].join(" ")}
            >
              {/* نوار رنگی بالای کارت */}
              <div
                className={[
                  "absolute top-0 right-0 left-0 h-1.5",
                  isSelected
                    ? "bg-white/40"
                    : hasSlots
                      ? "bg-gradient-to-l from-blue-500 to-sky-400"
                      : "bg-slate-200",
                ].join(" ")}
              />

              <span
                className={[
                  "font-black text-xl leading-none mt-2",
                  isSelected
                    ? "text-white"
                    : hasSlots
                      ? isFriday
                        ? "text-red-600"
                        : "text-slate-800"
                      : "text-slate-300",
                ].join(" ")}
              >
                {toPersianDigits(String(day.dayNumber))}
              </span>

              <span
                className={[
                  "text-[10px] font-bold px-2 py-0.5 rounded-full self-start",
                  isSelected
                    ? "bg-white/20 text-white"
                    : hasSlots
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-400",
                ].join(" ")}
              >
                {hasSlots
                  ? `${toPersianDigits(String(day.slots.length))} نوبت`
                  : "بدون نوبت"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mt-8 mb-4 font-bold">
        <Clock size={18} />
        <span>
          {activeDateParts
            ? `زمان‌های آزاد ${activeDateParts.weekday} ${activeDateParts.day} ${activeDateParts.month}`
            : "زمان‌های آزاد"}
        </span>
      </div>

      {todaySlots.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {todaySlots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              onClick={() => {
                setSelectedSlotId(slot.id);
                setMessage("");
              }}
              className={[
                "p-4 rounded-xl border font-black transition",
                selectedSlotId === slot.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white border-slate-200 hover:border-blue-400",
              ].join(" ")}
            >
              {formatTime(slot.start_time)}
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-slate-50 text-slate-500 rounded-2xl border border-slate-100">
          برای این روز نوبت آزادی وجود ندارد.
        </div>
      )}

      <button
        type="button"
        disabled={!selectedSlotId || bookingMutation.isPending}
        onClick={handleBooking}
        className="mt-8 w-full bg-blue-600 disabled:bg-gray-300 text-white p-5 rounded-full font-black text-lg"
      >
        {bookingMutation.isPending ? "در حال ثبت..." : "تایید و ثبت نوبت"}
      </button>

      {message && (
        <div className="mt-5 bg-green-50 text-green-700 p-4 rounded-xl flex gap-2">
          <CheckCircle2 size={20} />
          {message}
        </div>
      )}
    </div>
  );
}
