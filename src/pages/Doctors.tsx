import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MapPin, Phone, Wallet, Stethoscope } from "lucide-react";
import { getDoctors } from "../services/doctors";

function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

export default function Doctors() {
  const {
    data: doctors = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-slate-50"
        dir="rtl"
      >
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent"></div>
          <p className="text-lg text-slate-600">در حال دریافت پزشکان...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-slate-50 px-4"
        dir="rtl"
      >
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="mb-4 font-bold text-red-500">خطا در دریافت پزشکان</p>
          <p className="mb-6 text-sm text-slate-500">
            {error instanceof Error
              ? error.message
              : "مشکلی در دریافت اطلاعات پزشکان به وجود آمد."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-cyan-600 px-6 py-2 text-sm text-white transition hover:bg-cyan-700"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12" dir="rtl">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-slate-800 mb-4">
            نوبت‌دهی پزشکان
          </h1>
          <p className="text-slate-500">
            پزشک مورد نظر خود را انتخاب و آنلاین نوبت رزرو کنید
          </p>
        </div>

        {doctors.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            پزشکی یافت نشد.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div>
                  <div className="mb-5 flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-cyan-200 bg-cyan-100 text-lg font-black text-cyan-700">
                      دکتر
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-xl font-black text-slate-800">
                        {doctor.user_name || "پزشک"}
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-cyan-600">
                        {doctor.specialty}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-cyan-600" />
                      <span>{doctor.city || "نامشخص"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-cyan-600" />
                      <span>
                        {doctor.visit_fee != null
                          ? `${toPersianDigits(doctor.visit_fee)} تومان`
                          : "هزینه ثبت نشده"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-cyan-600" />
                      <span>{doctor.phone || "شماره ثبت نشده"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-cyan-600" />
                      <span>{doctor.specialty}</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/doctor/${doctor.id}`}
                  className="mt-6 block rounded-xl bg-cyan-600 py-3 text-center font-medium text-white transition hover:bg-cyan-700"
                >
                  دریافت نوبت
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}