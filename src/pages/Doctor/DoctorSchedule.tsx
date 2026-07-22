import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  CalendarDays,
  Clock3,
  RefreshCw,
  CheckCircle2,
  CalendarClock,
  Trash2
} from "lucide-react";

// --- تایپ‌های دیتای خام دریافتی از سرور (طبق لاگ کنسول شما) ---
interface RawSlot {
  id: number;
  doctor_id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_booked: boolean;
  status: string;
}

interface RawApiResponse {
  success: boolean;
  count: number;
  items: RawSlot[];
}

// --- تایپ‌های داخلی مورد نیاز کامپوننت تقویم ---
interface Slot {
  slot_id: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_booked: boolean;
}

interface DailySchedule {
  date: string;
  persian_date: string;
  persian_formatted_date: string;
  persian_day_name: string;
  slots: Slot[];
}

// تابع کمکی برای تبدیل اعداد انگلیسی به فارسی
function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

// تبدیل تاریخ میلادی به اطلاعات تاریخ شمسی در فرانت‌اِند
function getJalaliDetails(gregorianDateStr: string): {
  persianDate: string;
  persianFormattedDate: string;
  persianDayName: string;
} {
  const dateObj = new Date(gregorianDateStr);

  // نام روز هفته به فارسی
  const persianDayName = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(dateObj);

  // تاریخ عددی شمسی: ۱۴۰۵/۰۵/۰۳
  const persianDate = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(dateObj);

  // تاریخ متنی شمسی: ۳ مرداد ۱۴۰۵
  const persianFormattedDate = new Intl.DateTimeFormat('fa-IR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(dateObj);

  return {
    persianDate,
    persianFormattedDate,
    persianDayName
  };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function DoctorSchedule({ doctorId }: { doctorId: number }) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const queryClient = useQueryClient();

  // دریافت داده‌ها از بک‌اِند
  const { data: rawData, isLoading, isError, refetch, isFetching } = useQuery<RawApiResponse>({
    queryKey: ['doctor-schedule', doctorId],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/appointments/doctors/${doctorId}/schedule`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!doctorId,
  });

  // عملیات حذف بازه زمانی
  const deleteSlotMutation = useMutation({
    mutationFn: async (slotId: number) => {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/availabilities/${slotId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-schedule', doctorId] });
      alert("بازه زمانی با موفقیت حذف شد.");
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || "خطا در حذف بازه زمانی رخ داد.";
      alert(errorMsg);
    }
  });

  const handleDeleteSlot = (slotId: number, isBooked: boolean) => {
    if (isBooked) {
      alert("این نوبت رزرو شده است و نمی‌توانید آن را حذف کنید.");
      return;
    }
    if (confirm("آیا از حذف این بازه زمانی مطمئن هستید؟")) {
      deleteSlotMutation.mutate(slotId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-['Vazirmatn']" dir="rtl">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 animate-spin text-cyan-600" size={40} />
          <p className="text-lg font-black text-slate-700">در حال دریافت برنامه زمانی نوبت‌ها...</p>
        </div>
      </div>
    );
  }

  if (isError || !rawData || !rawData.items) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-['Vazirmatn']" dir="rtl">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm border border-red-100">
          <p className="text-lg font-black text-red-500 mb-4">خطا در برقرار ارتباط یا عدم یافتن اطلاعات پزشک</p>
          <button onClick={() => refetch()} className="rounded-2xl bg-slate-950 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-all">
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  // --- پروسس و گروه‌بندی کلاینت‌ساید داده‌های تخت (Flat) سرور ---
  const rawItems = rawData.items;

  // ۱. گروه‌بندی بر اساس تاریخ میلادی
  const groups: { [dateStr: string]: Slot[] } = {};
  rawItems.forEach((item) => {
    const slotDetail: Slot = {
      slot_id: item.id,
      // پاکسازی ثانیه‌ها از فرمت مثلاً 08:30:00 به 08:30
      start_time: item.start_time.substring(0, 5),
      end_time: item.end_time.substring(0, 5),
      is_available: item.is_available,
      is_booked: item.is_booked
    };
    if (!groups[item.date]) {
      groups[item.date] = [];
    }
    groups[item.date].push(slotDetail);
  });

  // ۲. ساخت آرایه مرتب شده از روزها همراه با جزئیات تاریخ شمسی
  const schedule: DailySchedule[] = Object.keys(groups)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map((dateStr) => {
      const { persianDate, persianFormattedDate, persianDayName } = getJalaliDetails(dateStr);
      // مرتب‌سازی اسلات‌های هر روز براساس زمان شروع
      const sortedSlots = groups[dateStr].sort((a, b) => a.start_time.localeCompare(b.start_time));

      return {
        date: dateStr,
        persian_date: persianDate,
        persian_formatted_date: persianFormattedDate,
        persian_day_name: persianDayName,
        slots: sortedSlots
      };
    });

  const activeDay = schedule[selectedDayIndex];

  // محاسبه آمارهای کلی
  const totalSlots = rawItems.length;
  const freeSlotsCount = rawItems.filter(s => s.is_available && !s.is_booked).length;
  const bookedSlotsCount = rawItems.filter(s => s.is_booked).length;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-5 font-['Vazirmatn']">
      <div className="mx-auto max-w-7xl">

        {/* هدر بخش مدیریت */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-slate-900 p-6 text-white shadow-lg">
          <div>
            <h1 className="text-2xl font-black">مدیریت زمان‌بندی نوبت‌ها</h1>
            <p className="mt-2 text-sm text-slate-400">تاریخ امروز به شمسی: {toPersianDigits(new Date().toLocaleDateString('fa-IR'))}</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-bold backdrop-blur hover:bg-white/20 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={isFetching ? "animate-spin" : ""} />
            بروزرسانی وضعیت نوبت‌ها
          </button>
        </div>

        {/* بخش کارت‌های آمار بالای صفحه */}
        <div className="grid gap-5 md:grid-cols-3 mb-8">
          <StatCard title="کل نوبت‌ها" value={totalSlots} icon={<CalendarDays />} color="cyan" />
          <StatCard title="نوبت‌های آزاد" value={freeSlotsCount} icon={<CheckCircle2 />} color="emerald" />
          <StatCard title="رزرو شده" value={bookedSlotsCount} icon={<CalendarClock />} color="amber" />
        </div>

        {/* ساختار ستونی: سایدبار سمت راست و محتوای اصلی سمت چپ */}
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">

          {/* لیست انتخاب روزها */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            <h3 className="text-lg font-black text-slate-800 mb-4">انتخاب روز نوبت‌دهی</h3>
            {schedule.length === 0 ? (
              <p className="text-sm font-bold text-slate-400 py-4">هیچ روزی برنامه‌ریزی نشده است.</p>
            ) : (
              schedule.map((day, idx) => (
                <button
                  key={day.date || idx}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    selectedDayIndex === idx
                    ? 'border-cyan-500 bg-cyan-50/70 shadow-sm'
                    : 'border-white bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="text-right">
                    <div className={`font-black ${selectedDayIndex === idx ? 'text-cyan-700' : 'text-slate-900'}`}>
                      {day.persian_day_name}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{toPersianDigits(day.persian_formatted_date)}</div>
                  </div>
                  <div className={`text-xs font-bold px-2.5 py-1 rounded-xl ${selectedDayIndex === idx ? 'bg-cyan-200 text-cyan-800' : 'bg-slate-100 text-slate-500'}`}>
                    {toPersianDigits(day.slots?.length || 0)} نوبت
                  </div>
                </button>
              ))
            )}
          </div>

          {/* جزئیات ساعت‌های روز انتخاب شده */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            {activeDay ? (
              <>
                <div className="mb-6 flex items-center justify-between border-b pb-4">
                  <h2 className="text-xl font-black text-slate-900">
                    لیست ساعت‌های {activeDay.persian_day_name} ({toPersianDigits(activeDay.persian_formatted_date)})
                  </h2>
                </div>

                {(!activeDay.slots || activeDay.slots.length === 0) ? (
                  <div className="py-20 text-center text-slate-400 font-bold">
                    هیچ ساعتی برای این روز تعریف نشده است.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {activeDay.slots.map((slot) => (
                      <div
                        key={slot.slot_id}
                        className={`relative overflow-hidden rounded-2xl p-5 border-2 transition-all ${
                          slot.is_booked
                          ? 'bg-amber-50/20 border-amber-100/55'
                          : 'bg-white border-slate-100 hover:border-cyan-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 font-black text-slate-800">
                          <Clock3 size={20} className="text-cyan-600" />
                          <span>{toPersianDigits(slot.start_time)} الی {toPersianDigits(slot.end_time)}</span>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          {slot.is_booked ? (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black text-amber-700">رزرو شده</span>
                          ) : (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black text-emerald-700">آماده رزرو</span>
                          )}
                          <button
                            onClick={() => handleDeleteSlot(slot.slot_id, slot.is_booked)}
                            disabled={deleteSlotMutation.isPending}
                            className="flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline disabled:opacity-50"
                          >
                            <Trash2 size={12} />
                            حذف بازه
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center font-bold text-slate-400">یک روز را از لیست سمت راست انتخاب کنید.</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// کامپوننت کمکی برای نمایش کارت‌های اطلاعاتی
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'cyan' | 'emerald' | 'amber';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colors = {
    cyan: "bg-cyan-100 text-cyan-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700"
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-slate-500">{title}</div>
          <div className="mt-2 text-3xl font-black text-slate-900">{toPersianDigits(value)}</div>
        </div>
        <div className={`rounded-2xl p-4 ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  );
}
