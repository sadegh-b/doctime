import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Wallet,
  Stethoscope,
  Briefcase,
} from "lucide-react";

import { getDoctors } from "../services/doctors";

function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

function formatConsultationFee(fee?: number | null): string {
  if (fee == null || Number.isNaN(Number(fee)) || Number(fee) <= 0) {
    return "هزینه ثبت نشده";
  }

  const formattedFee = new Intl.NumberFormat("fa-IR").format(Number(fee));
  return `${formattedFee} تومان`;
}

function safeText(value?: string | null, fallback = "ثبت نشده"): string {
  if (!value) return fallback;

  const trimmed = value.trim();

  if (!trimmed) return fallback;

  // اگر داده خراب و به صورت ???? ذخیره شده باشد
  if (/^\?+$/.test(trimmed.replace(/\s/g, ""))) {
    return fallback;
  }

  return trimmed;
}

export default function Doctors() {
  const {
    data: doctors = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-50"
        dir="rtl"
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent" />
          <p className="text-lg text-slate-600">در حال دریافت پزشکان...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-50 px-4"
        dir="rtl"
      >
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="mb-4 font-bold text-red-500">خطا در دریافت پزشکان</p>

          <p className="mb-6 text-sm leading-7 text-slate-500">
            {error instanceof Error
              ? error.message
              : "مشکلی در دریافت اطلاعات پزشکان به وجود آمد."}
          </p>

          <button
            type="button"
            disabled={isFetching}
            onClick={() => {
              void refetch();
            }}
            className="rounded-xl bg-cyan-600 px-6 py-2 text-sm text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFetching ? "در حال تلاش..." : "تلاش مجدد"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12" dir="rtl">
      <div className="mx-auto max-w-6xl px-4">
        <header className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-black text-slate-800">
            نوبت‌دهی پزشکان
          </h1>

          <p className="text-slate-500">
            پزشک مورد نظر خود را انتخاب و به‌صورت آنلاین نوبت رزرو کنید
          </p>
        </header>

        {doctors.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm">
            <Stethoscope className="mx-auto mb-4 h-12 w-12 text-slate-300" />

            <p className="font-semibold text-slate-600">پزشکی یافت نشد.</p>

            <p className="mt-2 text-sm text-slate-400">
              در حال حاضر هیچ پزشک فعالی در سامانه ثبت نشده است.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <article
                key={doctor.id}
                className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div>
                  <div className="mb-5 flex items-center gap-4">
                    {doctor.image ? (
                      <img
                        src={doctor.image}
                        alt={
                          doctor.name
                            ? `تصویر ${doctor.name}`
                            : "تصویر پزشک"
                        }
                        className="h-20 w-20 rounded-full border border-cyan-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-cyan-200 bg-cyan-100 text-lg font-black text-cyan-700">
                        دکتر
                      </div>
                    )}

                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-black text-slate-800">
                        {safeText(
                          doctor.name,
                          `پزشک شماره ${toPersianDigits(doctor.id)}`
                        )}
                      </h2>

                      <p className="mt-1 text-sm font-semibold text-cyan-600">
                        {safeText(doctor.specialty, "تخصص ثبت نشده")}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-cyan-600" />
                      <span>{safeText(doctor.city, "شهر ثبت نشده")}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 shrink-0 text-cyan-600" />
                      <span>
                        {formatConsultationFee(doctor.consultation_fee)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-cyan-600" />
                      <span>
                        {safeText(doctor.phone, "شماره تماس ثبت نشده")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 shrink-0 text-cyan-600" />
                      <span>
                        {safeText(doctor.specialty, "تخصص ثبت نشده")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 shrink-0 text-cyan-600" />
                      <span>
                        {doctor.experience_years > 0
                          ? `${toPersianDigits(
                              doctor.experience_years
                            )} سال سابقه`
                          : "سابقه ثبت نشده"}
                      </span>
                    </div>

                    {doctor.address && safeText(doctor.address, "") && (
                      <div className="rounded-xl bg-slate-50 p-3 leading-6 text-slate-500">
                        {safeText(doctor.address)}
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  to={`/doctors/${doctor.id}`}
                  className="mt-6 block rounded-xl bg-cyan-600 py-3 text-center font-medium text-white transition hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
                >
                  مشاهده و دریافت نوبت
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
