import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  MapPin,
  Clock3,
  CalendarDays,
  Stethoscope,
  Phone,
  Wallet,
  Briefcase,
} from "lucide-react";

// سرویس‌ها
import { getDoctorById, type Doctor } from "../services/doctors";
import {
  getDoctorAvailability,
  type AvailabilityItem,
} from "../services/availability";
import { createAppointment } from "../services/appointments";

// کامپوننت‌ها
import ReviewsList from "../components/ReviewsList";
import AddReviewForm from "../components/AddReviewForm";

// ======================================================
// Helper Functions (توابع کمکی با دقت بالا)
// ======================================================

function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

function safeText(value?: string | null, fallback = "ثبت نشده") {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (!trimmed || /^\?+$/.test(trimmed.replace(/\s/g, ""))) return fallback;
  return trimmed;
}

function formatTime(value?: string | null) {
  if (!value) return "--:--";
  return toPersianDigits(value.slice(0, 5));
}

function formatPersianDate(dateStr?: string | null) {
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

function formatPrice(value?: number | string | null) {
  const numericValue = Number(value);
  if (value == null || isNaN(numericValue) || numericValue <= 0) {
    return "هزینه ثبت نشده";
  }
  return `${new Intl.NumberFormat("fa-IR").format(numericValue)} تومان`;
}

interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

export default function DoctorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const doctorId = Number(id);
  // بررسی سخت‌گیرانه معتبر بودن ID
  const isValidDoctorId = !isNaN(doctorId) && doctorId > 0;

  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // دریافت اطلاعات پزشک
  const {
    data: doctor,
    isLoading: doctorLoading,
    isError: doctorError,
  } = useQuery<Doctor>({
    queryKey: ["doctor", doctorId],
    queryFn: () => getDoctorById(doctorId),
    enabled: isValidDoctorId,
    retry: 1,
  });

  // دریافت زمان‌های آزاد
  const {
    data: availabilitySlots = [],
    isLoading: availabilityLoading,
    isError: availabilityError,
    error: availabilityQueryError,
  } = useQuery<AvailabilityItem[]>({
    queryKey: ["availability", doctorId],
    queryFn: () => getDoctorAvailability(doctorId),
    enabled: isValidDoctorId,
    retry: false,
  });

  // ============================================================
  // ⚠️ اصلاح بحرانی: منطق فیلتر اسلات‌ها
  // مشکل قبلی: خط `if (slot.status) return slot.status === "available"`
  // باعث می‌شد هر اسلاتی که status داشت ولی دقیقاً "available" نبود
  // (مثلاً "open" یا "active") حذف شود → نتیجه: "۰ نوبت موجود"
  //
  // منطق درست:
  //   1. اگر is_booked === true → حذف (رزرو شده)
  //   2. اگر is_available === false → حذف (غیرفعال)
  //   3. در غیر این صورت → نگه دار
  // ============================================================
  const freeSlots = useMemo(() => {
    if (!Array.isArray(availabilitySlots)) return [];

    const filtered = availabilitySlots.filter((slot) => {
      // رزرو شده → حذف
      if (slot.is_booked) return false;

      // صراحتاً غیرفعال → حذف
      if (slot.is_available === false) return false;

      // در همه‌ی حالات دیگر → نگه دار
      return true;
    });

    // دیباگ: برای عیب‌یابی در کنسول مرورگر (F12)
    console.log("DEBUG [DoctorProfilePage] availabilitySlots raw:", availabilitySlots);
    console.log("DEBUG [DoctorProfilePage] freeSlots after filter:", filtered);

    return filtered;
  }, [availabilitySlots]);

  // منطق رزرو نوبت
  const bookingMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["availability", doctorId],
      });
      setSelectedSlotId(null);
      setErrorMessage(null);
      setSuccessMessage(
        "نوبت شما با موفقیت ثبت شد. می‌توانید در پنل کاربری نوبت‌های خود را مشاهده کنید."
      );
    },
    onError: (err: unknown) => {
      setSuccessMessage(null);
      if (err instanceof AxiosError) {
        const errorData = err.response?.data as ApiErrorResponse | undefined;
        setErrorMessage(
          errorData?.detail || errorData?.message || "خطا در ارتباط با سرور"
        );
      } else {
        setErrorMessage("یک خطای غیرمنتظره رخ داد.");
      }
    },
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const token =
      localStorage.getItem("token") || localStorage.getItem("access_token");

    if (!token) {
      setErrorMessage("برای رزرو نوبت ابتدا باید وارد حساب کاربری خود شوید.");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    if (!selectedSlotId) {
      setErrorMessage("لطفاً ابتدا یکی از زمان‌های موجود را انتخاب کنید.");
      return;
    }

    bookingMutation.mutate({
      availability_id: selectedSlotId,
    });
  };

  // State: ID نامعتبر
  if (!isValidDoctorId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" dir="rtl">
        <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-200">
          <p className="text-red-500 font-bold">شناسه پزشک یافت نشد یا نامعتبر است.</p>
          <button
            onClick={() => navigate("/doctors")}
            className="mt-4 text-cyan-600 font-bold hover:underline"
          >
            بازگشت به لیست پزشکان
          </button>
        </div>
      </div>
    );
  }

  // State: در حال بارگذاری
  if (doctorLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent" />
          <p className="font-bold text-slate-600">در حال دریافت اطلاعات پزشک...</p>
        </div>
      </div>
    );
  }

  // State: خطا در دریافت یا عدم وجود پزشک
  if (doctorError || !doctor) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" dir="rtl">
        <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-red-100">
          <p className="text-red-600 font-black text-lg">پزشک مورد نظر در سیستم یافت نشد.</p>
          <button
            onClick={() => navigate("/doctors")}
            className="mt-6 px-6 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors"
          >
            بازگشت به جستجوی پزشکان
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* بخش معرفی پزشک (Hero Section) */}
        <div className="mb-8 overflow-hidden rounded-[32px] bg-gradient-to-br from-cyan-600 to-blue-700 p-1 shadow-xl">
          <div className="rounded-[31px] bg-white/5 backdrop-blur-sm p-6 sm:p-10 text-white">
            <div className="flex flex-col gap-8 md:flex-row md:items-center">
              {/* تصویر */}
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-3xl border-4 border-white/20 bg-white/10 shadow-2xl md:h-40 md:w-40">
                {doctor.image ? (
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-black">
                    {doctor.name?.[0] || "D"}
                  </div>
                )}
              </div>

              {/* متون اصلی */}
              <div className="flex-1">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-black tracking-wide backdrop-blur-md">
                  <Stethoscope className="h-4 w-4" />
                  عضو رسمی نظام پزشکی
                </div>
                <h1 className="text-3xl font-black sm:text-4xl">
                  {safeText(doctor.name, "پزشک ناشناس")}
                </h1>
                <p className="mt-3 text-lg font-bold text-cyan-100">
                  {safeText(doctor.specialty, "تخصص ثبت نشده")}
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                    <MapPin className="h-5 w-5 text-cyan-200" />
                    <span className="text-sm font-bold">
                      {safeText(doctor.city, "نامشخص")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                    <Briefcase className="h-5 w-5 text-cyan-200" />
                    <span className="text-sm font-bold">
                      {doctor.experience_years
                        ? `${toPersianDigits(doctor.experience_years)} سال سابقه`
                        : "سابقه نامشخص"}
                    </span>
                  </div>
                </div>
              </div>

              {/* هزینه ویزیت */}
              <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-xl md:w-64">
                <div className="mb-2 flex items-center gap-2 text-slate-500">
                  <Wallet className="h-5 w-5" />
                  <span className="text-xs font-black uppercase">هزینه ویزیت</span>
                </div>
                <div className="text-xl font-black text-cyan-700">
                  {formatPrice(doctor.consultation_fee)}
                </div>
                <p className="mt-2 text-[10px] font-bold text-slate-400">
                  پرداخت امن از طریق درگاه مستقیم
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ستون راست: رزرو نوبت */}
          <div className="lg:col-span-2 space-y-8">
            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-6">
                <h2 className="flex items-center gap-3 text-xl font-black text-slate-900">
                  <CalendarDays className="h-6 w-6 text-cyan-600" />
                  انتخاب زمان نوبت
                </h2>
                <span className="rounded-full bg-cyan-50 px-4 py-1 text-xs font-black text-cyan-700">
                  {toPersianDigits(freeSlots.length)} نوبت موجود
                </span>
              </div>

              {successMessage && (
                <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700 border border-emerald-100">
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 border border-red-100">
                  {errorMessage}
                </div>
              )}

              {/* پیام خطای availability */}
              {availabilityError && (
                <div className="mb-6 rounded-2xl bg-orange-50 p-4 text-sm font-bold text-orange-700 border border-orange-100">
                  خطا در دریافت زمان‌های خالی. لطفاً صفحه را رفرش کنید.
                </div>
              )}

              <form onSubmit={handleBookingSubmit}>
                {availabilityLoading ? (
                  <div className="py-12 text-center text-slate-400">
                    در حال جستجوی زمان‌های خالی...
                  </div>
                ) : freeSlots.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {freeSlots.map((slot) => {
                      const isSelected = selectedSlotId === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`group relative overflow-hidden rounded-[24px] border-2 p-5 text-right transition-all duration-300 ${
                            isSelected
                              ? "border-cyan-600 bg-cyan-600 text-white shadow-lg shadow-cyan-200"
                              : "border-slate-100 bg-slate-50 hover:border-cyan-200 hover:bg-white"
                          }`}
                        >
                          <div
                            className={`text-sm font-black ${
                              isSelected ? "text-white" : "text-slate-800"
                            }`}
                          >
                            {formatPersianDate(slot.date)}
                          </div>
                          <div
                            className={`mt-3 flex items-center gap-2 text-xs font-bold ${
                              isSelected ? "text-cyan-100" : "text-slate-500"
                            }`}
                          >
                            <Clock3 className="h-4 w-4" />
                            ساعت {formatTime(slot.start_time)} الی{" "}
                            {formatTime(slot.end_time)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-3xl bg-amber-50 p-10 text-center">
                    <p className="text-sm font-bold text-amber-800">
                      در حال حاضر نوبت فعالی برای رزرو یافت نشد.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={bookingMutation.isPending || !selectedSlotId}
                  className="mt-8 w-full rounded-[20px] bg-cyan-600 py-5 text-lg font-black text-white shadow-lg shadow-cyan-100 transition-all hover:bg-cyan-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {bookingMutation.isPending
                    ? "در حال ثبت نوبت..."
                    : "تأیید نهایی و رزرو"}
                </button>
              </form>
            </section>

            {/* نظرات */}
            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="mb-8 text-xl font-black text-slate-900">
                نظرات و امتیاز بیماران
              </h2>
              <ReviewsList doctorId={doctorId} />
              <div className="mt-10 border-t border-slate-100 pt-8">
                <AddReviewForm doctorId={doctorId} />
              </div>
            </section>
          </div>

          {/* ستون چپ: بیوگرافی و آدرس */}
          <div className="space-y-8">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-base font-black text-slate-900">درباره پزشک</h3>
              <p className="text-sm leading-8 text-slate-600">
                {safeText(doctor.bio, "توضیحاتی برای این پزشک ثبت نشده است.")}
              </p>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-base font-black text-slate-900">اطلاعات تماس</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-slate-400">
                      آدرس مطب
                    </div>
                    <div className="mt-1 text-sm font-bold leading-7 text-slate-700">
                      {safeText(doctor.address, "آدرس ثبت نشده")}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-slate-400">
                      شماره تلفن
                    </div>
                    <div className="mt-1 text-sm font-black text-slate-700">
                      {safeText(doctor.phone, "تماس ثبت نشده")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
