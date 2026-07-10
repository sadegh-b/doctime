// src/pages/DoctorProfilePage.tsx
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
} from "lucide-react";

import { getDoctorById } from "../services/doctors";
import {
  getDoctorAvailability,
  type AvailabilityItem,
} from "../services/availability";
import { createAppointment } from "../services/appointments";

import ReviewsList from "../components/ReviewsList";
import AddReviewForm from "../components/AddReviewForm";

function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
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

function formatPrice(value?: number | null) {
  if (value == null) return "ثبت نشده";
  return `${toPersianDigits(Math.round(value))} تومان`;
}

interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

type DoctorProfile = {
  id: number;
  name: string;
  specialty: string;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  image?: string | null;
  about?: string | null;
  visit_fee?: number | null;
  experience?: string | null;
  patients?: number | null;
};

export default function DoctorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const doctorId = Number(id);
  const isValidDoctorId = Number.isFinite(doctorId) && doctorId > 0;

  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    data: doctor,
    isLoading: doctorLoading,
    isError: doctorError,
    error: doctorQueryError,
  } = useQuery<DoctorProfile>({
    queryKey: ["doctor", doctorId],
    queryFn: () => getDoctorById(doctorId),
    enabled: isValidDoctorId,
    retry: false,
  });

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

  // سازگار با availability.ts فعلی:
  // اگر slot رزرو شده باشد حذف می‌شود
  // اگر status داشته باشد فقط available قبول می‌شود
  // اگر status نداشته باشد ولی is_booked=false باشد آزاد حساب می‌شود
  const freeSlots = useMemo(() => {
    return availabilitySlots.filter((slot) => {
      if (slot.is_booked) return false;
      if (slot.status) return slot.status === "available";
      return true;
    });
  }, [availabilitySlots]);

  const bookingMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["availability", doctorId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["doctor", doctorId],
      });

      setSelectedSlotId(null);
      setErrorMessage(null);
      setSuccessMessage("نوبت شما با موفقیت ثبت شد.");
    },
    onError: (err: unknown) => {
      setSuccessMessage(null);

      if (err instanceof AxiosError) {
        const errorData = err.response?.data as ApiErrorResponse | undefined;
        const msg =
          errorData?.detail ||
          errorData?.message ||
          err.message ||
          "خطا در ثبت نوبت";
        setErrorMessage(msg);
      } else {
        setErrorMessage("یک خطای ناشناخته رخ داده است.");
      }
    },
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("access_token");

    if (!token) {
      setErrorMessage("برای رزرو نوبت ابتدا وارد حساب کاربری شوید.");
      setTimeout(() => navigate("/login"), 1200);
      return;
    }

    if (!selectedSlotId) {
      setErrorMessage("لطفاً یکی از زمان‌های آزاد پزشک را انتخاب کنید.");
      return;
    }

    bookingMutation.mutate({
      doctor_id: doctorId,
      availability_id: selectedSlotId,
    });
  };

  if (!isValidDoctorId) {
    return (
      <div
        className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4"
        dir="rtl"
      >
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <p className="text-base font-bold text-red-600">
            شناسه پزشک نامعتبر است.
          </p>
          <button
            onClick={() => navigate("/doctors")}
            className="mt-5 rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-700"
          >
            بازگشت به لیست پزشکان
          </button>
        </div>
      </div>
    );
  }

  if (doctorLoading) {
    return (
      <div
        className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4"
        dir="rtl"
      >
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="animate-pulse text-base font-bold text-slate-700">
            در حال بارگذاری اطلاعات پزشک...
          </p>
        </div>
      </div>
    );
  }

  if (doctorError || !doctor) {
    return (
      <div
        className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4"
        dir="rtl"
      >
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <p className="text-base font-bold text-red-600">
            {doctorQueryError instanceof AxiosError
              ? doctorQueryError.response?.data?.detail ||
                doctorQueryError.message ||
                "پزشک موردنظر پیدا نشد."
              : doctorQueryError instanceof Error
              ? doctorQueryError.message
              : "پزشک موردنظر پیدا نشد."}
          </p>
          <button
            onClick={() => navigate("/doctors")}
            className="mt-5 rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-700"
          >
            بازگشت به لیست پزشکان
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8" dir="rtl">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 lg:px-6">
        {/* Hero */}
        <section className="overflow-hidden rounded-[28px] border border-cyan-100 bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-700 text-white shadow-[0_25px_80px_rgba(8,145,178,0.18)]">
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white/10 text-3xl font-black shadow-lg backdrop-blur">
                  {doctor.image ? (
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "دکتر"
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-cyan-50 backdrop-blur">
                    <Stethoscope className="h-4 w-4" />
                    پزشک فعال
                  </div>

                  <h1 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">
                    {doctor.name}
                  </h1>

                  <p className="mt-2 text-sm font-bold text-cyan-50 sm:text-base">
                    {doctor.specialty}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-cyan-50/95">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                      <MapPin className="h-4 w-4" />
                      {doctor.city || "نامشخص"}
                    </span>

                    {doctor.phone ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                        <Phone className="h-4 w-4" />
                        {doctor.phone}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {doctor.about ? (
                <p className="max-w-3xl text-sm leading-8 text-cyan-50/95 sm:text-[15px]">
                  {doctor.about}
                </p>
              ) : (
                <p className="max-w-3xl text-sm leading-8 text-cyan-50/95 sm:text-[15px]">
                  اطلاعات تکمیلی این پزشک هنوز ثبت نشده است.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 self-start sm:grid-cols-2">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-cyan-100">
                  <Stethoscope className="h-4 w-4" />
                  <span className="text-xs font-bold">تخصص</span>
                </div>
                <div className="mt-3 text-sm font-black leading-7 text-white">
                  {doctor.specialty}
                </div>
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-cyan-100">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs font-bold">شهر</span>
                </div>
                <div className="mt-3 text-sm font-black leading-7 text-white">
                  {doctor.city || "نامشخص"}
                </div>
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-cyan-100">
                  <Wallet className="h-4 w-4" />
                  <span className="text-xs font-bold">هزینه ویزیت</span>
                </div>
                <div className="mt-3 text-sm font-black leading-7 text-white">
                  {formatPrice(doctor.visit_fee)}
                </div>
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-cyan-100">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-xs font-bold">زمان آزاد</span>
                </div>
                <div className="mt-3 text-sm font-black leading-7 text-white">
                  {freeSlots.length > 0
                    ? `${toPersianDigits(freeSlots.length)} نوبت آزاد`
                    : "فعلاً نوبت آزادی ثبت نشده"}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Booking */}
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  رزرو نوبت آنلاین
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  یکی از زمان‌های آزاد را انتخاب و نوبت را ثبت کنید.
                </p>
              </div>

              <div className="rounded-2xl bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-700">
                {toPersianDigits(freeSlots.length)} زمان آزاد
              </div>
            </div>

            {successMessage && (
              <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="mt-5 space-y-5">
              {availabilityLoading ? (
                <div className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-600">
                  در حال دریافت زمان‌های آزاد...
                </div>
              ) : availabilityError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">
                  {availabilityQueryError instanceof AxiosError
                    ? availabilityQueryError.response?.status === 404
                      ? "پزشک پیدا نشد."
                      : availabilityQueryError.response?.data?.detail ||
                        availabilityQueryError.message ||
                        "خطا در دریافت زمان‌های آزاد پزشک."
                    : "خطا در دریافت زمان‌های آزاد پزشک."}
                </div>
              ) : freeSlots.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {freeSlots.map((slot) => {
                    const isSelected = selectedSlotId === slot.id;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => {
                          setSelectedSlotId(slot.id);
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className={`rounded-3xl border p-4 text-right transition-all duration-200 ${
                          isSelected
                            ? "border-cyan-500 bg-cyan-600 text-white shadow-lg shadow-cyan-100"
                            : "border-slate-200 bg-slate-50 hover:border-cyan-300 hover:bg-cyan-50/50"
                        }`}
                      >
                        <div
                          className={`text-sm font-black ${
                            isSelected ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {formatPersianDate(slot.date)}
                        </div>

                        <div
                          className={`mt-2 flex items-center gap-2 text-sm font-bold ${
                            isSelected ? "text-cyan-50" : "text-slate-600"
                          }`}
                        >
                          <Clock3 className="h-4 w-4" />
                          <span dir="ltr">
                            {formatTime(slot.start_time)} -{" "}
                            {formatTime(slot.end_time)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-800">
                  فعلاً نوبت آزادی برای این پزشک ثبت نشده است.
                </div>
              )}

              <button
                type="submit"
                disabled={
                  bookingMutation.isPending ||
                  freeSlots.length === 0 ||
                  !selectedSlotId
                }
                className="w-full rounded-2xl bg-cyan-600 py-3.5 text-sm font-black text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {bookingMutation.isPending
                  ? "در حال ثبت نوبت..."
                  : "تأیید و ثبت نوبت"}
              </button>
            </form>
          </section>

          {/* Doctor Info + Reviews */}
          <section className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-black text-slate-900">
                اطلاعات پزشک
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-xs font-bold text-slate-500">نام پزشک</div>
                  <div className="mt-2 text-sm font-black text-slate-900">
                    {doctor.name}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-xs font-bold text-slate-500">تخصص</div>
                  <div className="mt-2 text-sm font-black text-slate-900">
                    {doctor.specialty}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-xs font-bold text-slate-500">شهر</div>
                  <div className="mt-2 text-sm font-black text-slate-900">
                    {doctor.city || "نامشخص"}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-xs font-bold text-slate-500">تلفن</div>
                  <div className="mt-2 text-sm font-black text-slate-900">
                    {doctor.phone || "ثبت نشده"}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-xs font-bold text-slate-500">تجربه</div>
                  <div className="mt-2 text-sm font-black text-slate-900">
                    {doctor.experience || "ثبت نشده"}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-xs font-bold text-slate-500">
                    تعداد بیماران
                  </div>
                  <div className="mt-2 text-sm font-black text-slate-900">
                    {toPersianDigits(doctor.patients ?? 0)}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-xs font-bold text-slate-500">
                    هزینه ویزیت
                  </div>
                  <div className="mt-2 text-sm font-black text-slate-900">
                    {formatPrice(doctor.visit_fee)}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-sm font-black text-slate-900">
                  درباره پزشک
                </div>
                <p className="mt-3 text-sm leading-8 text-slate-600">
                  {doctor.about || "توضیحی برای این پزشک ثبت نشده است."}
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-black text-slate-900">
                نظرات بیماران
              </h2>

              <div className="mt-5 space-y-6">
                <ReviewsList doctorId={doctorId} />
                <AddReviewForm doctorId={doctorId} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}