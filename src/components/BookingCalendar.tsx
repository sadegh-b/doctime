// Path: frontend/src/components/BookingCalendar.tsx

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

// تبدیل تاریخ میلادی به جلالی برای نمایش عنوان ماه و سال
function formatJalaliMonthTitle(isoDateStr: string) {
  if (!isoDateStr) return "";
  try {
    const d = new Date(`${isoDateStr}T12:00:00`);
    return new Intl.DateTimeFormat("fa-IR", {
      month: "long",
      year: "numeric",
    }).format(d);
  } catch (e) {
    return "تیر ۱۴۰۵";
  }
}

function persianDate(date: string) {
  const d = new Date(`${date}T12:00:00`);
  return {
    weekday: new Intl.DateTimeFormat("fa-IR", { weekday: "long" }).format(d),
    day: new Intl.DateTimeFormat("fa-IR", { day: "numeric" }).format(d),
    month: new Intl.DateTimeFormat("fa-IR", { month: "long" }).format(d),
  };
}

// گرفتن اندیس روز هفته بر اساس شنبه = ۰ تا جمعه = ۶
function getJalaliWeekdayOffset(isoDateStr: string): number {
  const d = new Date(`${isoDateStr}T12:00:00`);
  const day = d.getDay(); // 0 is Sunday, 6 is Saturday
  return (day + 1) % 7;
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
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { data: slots = [], isLoading } = useQuery<AvailabilitySlot[]>({
    queryKey: ["availability", doctorId],
    queryFn: () => getDoctorAvailability(doctorId),
    enabled: !!doctorId,
  });

  const freeSlots = useMemo(() => {
    return slots.filter((slot) => slot.is_available && !slot.is_booked);
  }, [slots]);

  // دسته‌بندی نوبت‌ها بر اساس تاریخ میلادی استاندارد YYYY-MM-DD
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

  // استخراج تمام تاریخ‌های یکتا که دارای نوبت فعال هستند
  const uniqueDatesWithSlots = useMemo(() => {
    return [...groupedByDate.keys()].sort();
  }, [groupedByDate]);

  // اولین تاریخ دارای نوبت فعال
  const firstAvailableDate = uniqueDatesWithSlots[0] || "";

  // هدایت کاربر به اولین روز نوبت‌دار فعال در اولین رندر
  useEffect(() => {
    if (!selectedDate && firstAvailableDate) {
      setSelectedDate(firstAvailableDate);
    }
  }, [selectedDate, firstAvailableDate]);

  const activeDate = selectedDate || firstAvailableDate || "";

  // تشخیص سال و ماه فعلی برای رندر تقویم
  const currentMonthYearGroup = useMemo(() => {
    if (!activeDate) return { year: 2026, month: 6 }; // مقدار پیش‌فرض
    const parts = activeDate.split("-");
    return {
      year: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10),
    };
  }, [activeDate]);

  // فیلتر کردن روزهای دارای نوبت برای نمایش در ماه جاری
  const calendarDays = useMemo<CalendarDay[]>(() => {
    const { year, month } = currentMonthYearGroup;
    const days: CalendarDay[] = [];

    // فرض می‌کنیم کل ماه شامل ۳۱ روز است تا پوشش کامل ماه شمسی فراهم شود
    for (let dayNum = 1; dayNum <= 31; dayNum++) {
      const formattedMonth = String(month).padStart(2, "0");
      const formattedDay = String(dayNum).padStart(2, "0");
      const isoDate = `${year}-${formattedMonth}-${formattedDay}`;

      // فقط روزهایی را به تقویم اضافه کن که در دیتابیس نوبت آزاد دارند
      const slotsForDay = groupedByDate.get(isoDate) ?? [];
      if (slotsForDay.length > 0) {
        days.push({
          isoDate,
          dayNumber: dayNum,
          slots: slotsForDay,
        });
      }
    }
    return days;
  }, [currentMonthYearGroup, groupedByDate]);

  // افست شروع تقویم شمسی بر اساس اولین روز ماه جاری
  const monthOffset = useMemo(() => {
    if (calendarDays.length === 0) return 0;
    // محاسبه بر اساس اولین روز نوبت‌دار واقعی در سیستم
    const firstDay = calendarDays[0];
    return getJalaliWeekdayOffset(firstDay.isoDate);
  }, [calendarDays]);

  const activeDateParts = useMemo(() => {
    if (!activeDate) return null;
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
      setErrorMessage("");
    },
    onError: (error: any) => {
      setErrorMessage(error?.response?.data?.detail || "خطا در ثبت نوبت. لطفاً دوباره تلاش کنید.");
      setMessage("");
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

  function handleSelectDay(day: CalendarDay) {
    setSelectedDate(day.isoDate);
    setSelectedSlotId(null);
    setMessage("");
    setErrorMessage("");
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center text-teal-600 font-bold animate-pulse">
        در حال دریافت زمان‌های نوبت‌دهی...
      </div>
    );
  }

  if (freeSlots.length === 0) {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl text-amber-800 flex gap-2 items-center" dir="rtl">
        <AlertCircle size={20} className="shrink-0 text-amber-600" />
        <span className="font-bold">در حال حاضر نوبت آزادی برای این پزشک ثبت نشده است.</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6" dir="rtl">
      {/* هدر تقویم با تم Teal/Mint */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-2xl p-5 mb-6 shadow-lg shadow-teal-500/10">
        <div className="flex gap-2 items-center">
          <Calendar size={20} className="text-teal-100" />
          <span className="text-sm font-semibold opacity-90">رزرو آنلاین نوبت</span>
        </div>
        <h2 className="text-xl font-black mt-2">{doctorName}</h2>
        {specialty && <p className="text-xs text-teal-500 bg-white/10 w-fit px-3 py-1 rounded-full mt-2 font-semibold">{specialty}</p>}
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          disabled={uniqueDatesWithSlots.indexOf(activeDate) === 0}
          onClick={() => {
            const index = uniqueDatesWithSlots.indexOf(activeDate);
            if (index > 0) {
              setSelectedDate(uniqueDatesWithSlots[index - 1]);
              setSelectedSlotId(null);
            }
          }}
          className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          aria-label="روز قبل"
        >
          <ChevronRight size={18} />
        </button>

        <div className="font-black text-lg text-slate-800">
          {formatJalaliMonthTitle(activeDate)}
        </div>

        <button
          type="button"
          disabled={uniqueDatesWithSlots.indexOf(activeDate) === uniqueDatesWithSlots.length - 1}
          onClick={() => {
            const index = uniqueDatesWithSlots.indexOf(activeDate);
            if (index < uniqueDatesWithSlots.length - 1) {
              setSelectedDate(uniqueDatesWithSlots[index + 1]);
              setSelectedSlotId(null);
            }
          }}
          className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          aria-label="روز بعد"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* روزهای هفته */}
      <div className="grid grid-cols-7 gap-2 mb-3 text-center font-bold text-xs text-slate-500">
        {WEEK_DAYS.map((day, index) => (
          <div key={day} className={index === 6 ? "text-red-500 py-1" : "py-1"}>
            {day}
          </div>
        ))}
      </div>

      {/* تقویم روزها */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: monthOffset }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="h-20 rounded-2xl bg-slate-50/40 border border-slate-100/50"
          />
        ))}

        {calendarDays.map((day) => {
          const hasSlots = day.slots.length > 0;
          const isSelected = activeDate === day.isoDate;

          return (
            <button
              key={day.isoDate}
              type="button"
              onClick={() => handleSelectDay(day)}
              className={[
                "relative h-20 rounded-2xl border p-2 text-right flex flex-col justify-between transition-all duration-200 shadow-sm",
                isSelected
                  ? "bg-gradient-to-br from-teal-600 to-emerald-600 border-teal-600 text-white shadow-md scale-[1.02] z-10"
                  : "bg-white border-slate-200 hover:border-teal-400 hover:shadow-md"
              ].join(" ")}
            >
              <span
                className={[
                  "font-black text-lg leading-none mt-1",
                  isSelected ? "text-white" : "text-slate-800"
                ].join(" ")}
              >
                {toPersianDigits(String(day.dayNumber))}
              </span>

              <span
                className={[
                  "text-[9px] font-bold px-1.5 py-0.5 rounded-md self-start mt-1",
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-teal-50 text-teal-700"
                ].join(" ")}
              >
                {`${toPersianDigits(String(day.slots.length))} نوبت`}
              </span>
            </button>
          );
        })}
      </div>

      {/* زمان‌های آزاد */}
      <div className="flex items-center gap-2 mt-8 mb-4 font-bold text-slate-800">
        <Clock size={18} className="text-teal-600" />
        <span>
          {activeDateParts
            ? `زمان‌های آزاد ${activeDateParts.weekday} ${activeDateParts.day} ${activeDateParts.month}`
            : "زمان‌های آزاد"}
        </span>
      </div>

      {todaySlots.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {todaySlots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              onClick={() => {
                setSelectedSlotId(slot.id);
                setMessage("");
                setErrorMessage("");
              }}
              className={[
                "p-3 rounded-xl border text-center font-bold text-sm transition-all duration-150",
                selectedSlotId === slot.id
                  ? "bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-600/20 scale-[1.01]"
                  : "bg-white border-slate-200 hover:border-teal-500 hover:text-teal-600",
              ].join(" ")}
            >
              {formatTime(slot.start_time)}
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-slate-50 text-slate-500 rounded-2xl border border-slate-100 text-sm">
          برای این روز نوبت آزادی وجود ندارد.
        </div>
      )}

      {/* دکمه نهایی */}
      <button
        type="button"
        disabled={!selectedSlotId || bookingMutation.isPending}
        onClick={handleBooking}
        className="mt-8 w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-4 rounded-xl font-black text-lg transition duration-200 shadow-md shadow-teal-600/10"
      >
        {bookingMutation.isPending ? "در حال ثبت..." : "تایید و ثبت نوبت"}
      </button>

      {/* پیام‌های وضعیت */}
      {message && (
        <div className="mt-5 bg-teal-50 text-teal-800 p-4 rounded-xl flex gap-2 border border-teal-100 text-sm">
          <CheckCircle2 size={20} className="text-teal-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-5 bg-red-50 text-red-800 p-4 rounded-xl flex gap-2 border border-red-100 text-sm">
          <AlertCircle size={20} className="text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
