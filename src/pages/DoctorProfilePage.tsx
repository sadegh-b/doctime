// Path: doctime-frontend/src/pages/DoctorProfilePage.tsx

import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getDoctorById } from "../services/doctors";
import { createAppointment } from "../services/appointments";
import {
  getDoctorAvailability,
  type AvailabilitySlot,
} from "../services/availability";

import ReviewsList from "../components/ReviewsList";
import AddReviewForm from "../components/AddReviewForm";

import doctorPlaceholder from "../assets/images/doctor-placeholder.jpg";

import {
  MapPin,
  Info,
  ChevronLeft,
  Clock,
  Calendar,
  Star,
  ShieldCheck,
  Loader2,
  AlertCircle
} from "lucide-react";

const getPersianDateParts = (dateStr: string) => {
  if (!dateStr) return { weekday: "", dayMonth: "نامشخص" };
  try {
    const date = new Date(dateStr);
    return {
      weekday: new Intl.DateTimeFormat("fa-IR", { weekday: "long" }).format(date),
      dayMonth: new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long" }).format(date),
    };
  } catch (err) {
    console.error("Date conversion error:", err);
    return { weekday: "", dayMonth: dateStr };
  }
};

export default function DoctorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const doctorId = Number(id);
  const isValidDoctorId = Number.isInteger(doctorId) && doctorId > 0;

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  const {
    data: doctor,
    isLoading: isDoctorLoading,
    isError: isDoctorError,
    error: doctorQueryError,
  } = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: () => getDoctorById(doctorId),
    enabled: isValidDoctorId,
    retry: false, // غیرفعال کردن تلاش مجدد برای دیدن سریع خطا در کنسول
  });

  const {
    data: availabilitySlots = [],
    isLoading: isAvailabilityLoading,
  } = useQuery<AvailabilitySlot[]>({
    queryKey: ["availability", doctorId],
    queryFn: () => getDoctorAvailability(doctorId),
    enabled: isValidDoctorId && !!doctor,
  });

  const groupedByDate = useMemo(() => {
    const groups: Record<string, AvailabilitySlot[]> = {};
    availabilitySlots.forEach((slot) => {
      if (!slot.date) return;
      if (!groups[slot.date]) groups[slot.date] = [];
      groups[slot.date].push(slot);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [availabilitySlots]);

  const activeDate = selectedDate || (groupedByDate.length > 0 ? groupedByDate[0][0] : "");

  const visibleSlots = useMemo(() => {
    const currentGroup = groupedByDate.find(([date]) => date === activeDate);
    if (!currentGroup) return [];
    return [...currentGroup[1]]
      .filter((slot) => !slot.is_booked)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [groupedByDate, activeDate]);

  const bookingMutation = useMutation({
    mutationFn: (availability_id: number) => createAppointment({ availability_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability", doctorId] });
      setSelectedSlotId(null);
      alert("✅ نوبت شما با موفقیت رزرو شد.");
    },
    onError: (error: any) => {
      const serverError = error?.response?.data?.detail || error.message || "خطا در ارتباط با سرور";
      alert(`❌ خطا: ${serverError}`);
    },
  });

  const handleBooking = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      const returnTo = encodeURIComponent(location.pathname);
      navigate(`/login?redirect=${returnTo}`);
      return;
    }
    if (!selectedSlotId) return;
    bookingMutation.mutate(selectedSlotId);
  };

  if (!isValidDoctorId) return <div className="p-20 text-center font-bold text-red-500">شناسه پزشک نامعتبر است.</div>;

  if (isDoctorLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="font-black text-slate-600">در حال فراخوانی اطلاعات پزشک...</p>
    </div>
  );

  if (isDoctorError || !doctor) {
    console.error("Doctor Fetch Error Detailed:", doctorQueryError);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
        <AlertCircle className="text-red-500" size={48} />
        <p className="font-black text-slate-800">پزشک مورد نظر یافت نشد یا اطلاعات ارسالی سرور ناقص است.</p>
        <p className="text-sm text-red-600 max-w-md bg-red-50 p-3 rounded-lg border border-red-100 font-mono">
          {doctorQueryError instanceof Error ? doctorQueryError.message : "Data Integrity Error"}
        </p>
        <button onClick={() => navigate(-1)} className="text-blue-600 font-bold underline">بازگشت به لیست</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-20 font-sans" dir="rtl">
      <div className="bg-gradient-to-b from-blue-700 to-blue-500 pt-12 pb-32 text-center text-white px-4">
        <h1 className="text-3xl md:text-4xl font-black">رزرو آنلاین نوبت</h1>
        <p className="mt-4 text-blue-100 font-medium opacity-90">سریع‌ترین راه برای دریافت نوبت از دکتر {doctor.name}</p>
      </div>

      <div className="mx-auto max-w-3xl px-4 -mt-24">
        <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-blue-900/10">
          <div className="p-8 md:p-10 border-b border-slate-50">
            <div className="flex items-start justify-between mb-8">
               <button
                onClick={() => navigate(-1)}
                className="p-3 rounded-2xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
               >
                 <ChevronLeft size={24} />
               </button>
               <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-4 py-2 rounded-full">
                  <Star size={18} fill="currentColor" />
                  <span className="font-black">{doctor.rating || "۴.۵"}</span>
               </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative">
                <img
                  src={doctor.image || doctorPlaceholder}
                  className="h-32 w-32 rounded-[2rem] object-cover ring-4 ring-slate-50 shadow-lg"
                  alt={doctor.name}
                />
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-lg border-2 border-white">
                  <ShieldCheck size={18} />
                </div>
              </div>

              <div className="text-center md:text-right flex-1">
                <h2 className="text-3xl font-black text-slate-900">دکتر {doctor.name}</h2>
                <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-xl font-bold text-sm">
                    {doctor.specialty_name || "پزشک متخصص"}
                  </span>
                </div>
                <p className="mt-5 flex items-center justify-center md:justify-start gap-2 text-slate-500 font-medium">
                  <MapPin size={18} className="text-red-400" />
                  {doctor.city || "نامشخص"} - {doctor.address || "آدرس ثبت نشده"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-center gap-2 mb-6 text-slate-800">
              <Calendar size={20} className="text-blue-600" />
              <h3 className="text-lg font-black">۱. انتخاب روز مراجعه</h3>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {groupedByDate.length > 0 ? (
                groupedByDate.map(([date, slots]) => {
                  const { weekday, dayMonth } = getPersianDateParts(date);
                  const isActive = activeDate === date;
                  const freeCount = slots.filter(s => !s.is_booked).length;

                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedSlotId(null);
                      }}
                      className={`w-32 flex-shrink-0 rounded-[1.5rem] border-2 p-5 transition-all cursor-pointer ${
                        isActive
                          ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-100"
                          : "border-slate-100 bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      <div className={`text-xs font-bold ${isActive ? "text-blue-600" : "text-slate-400"}`}>{weekday}</div>
                      <div className="mt-2 font-black text-slate-800">{dayMonth}</div>
                      <div className="mt-2 text-[10px] font-black py-1 px-2 rounded-lg bg-white inline-block text-emerald-600">
                        {freeCount} نوبت
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="w-full bg-slate-50 rounded-2xl p-6 text-center border-2 border-dashed border-slate-200">
                  <p className="text-slate-500 font-bold">در حال حاضر نوبتی برای این پزشک تعریف نشده است.</p>
                </div>
              )}
            </div>
          </div>

          <div className="px-8 pb-8">
            <div className="flex items-center gap-2 mb-6 text-slate-800">
              <Clock size={20} className="text-blue-600" />
              <h3 className="text-lg font-black">۲. انتخاب ساعت</h3>
            </div>

            {isAvailabilityLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-400" /></div>
            ) : visibleSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {visibleSlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`rounded-2xl border-2 py-4 font-black transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                          : "bg-white border-slate-100 text-slate-700 hover:border-blue-200"
                      }`}
                    >
                      {slot.start_time.slice(0, 5)}
                    </button>
                  );
                })}
              </div>
            ) : (
              activeDate && <p className="rounded-2xl bg-amber-50 p-6 text-center font-bold text-amber-700 border border-amber-100">در این تاریخ تمامی نوبت‌ها رزرو شده است.</p>
            )}
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBooking}
              disabled={bookingMutation.isPending || !selectedSlotId}
              className="w-full rounded-[1.5rem] bg-blue-600 py-5 text-xl font-black text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 hover:-translate-y-1 active:scale-95 disabled:bg-slate-300 disabled:shadow-none disabled:translate-y-0 flex items-center justify-center gap-3 cursor-pointer"
            >
              {bookingMutation.isPending ? (
                <><Loader2 className="animate-spin" /> در حال ثبت نوبت...</>
              ) : (
                "تأیید و رزرو نهایی نوبت"
              )}
            </button>
            <p className="mt-4 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
              <Info size={14} /> پرداخت هزینه ویزیت در محل مطب انجام خواهد شد.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-[2.5rem] bg-white p-8 md:p-10 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
            <h2 className="text-2xl font-black text-slate-900">نظرات و تجربیات</h2>
          </div>
          <ReviewsList doctorId={doctorId} />
          <div className="mt-10 pt-10 border-t border-slate-50">
            <AddReviewForm doctorId={doctorId} />
          </div>
        </div>
      </div>
    </div>
  );
}
