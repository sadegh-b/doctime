import { useQuery } from "@tanstack/react-query";
import { getPatientAppointments } from "../services/doctors";
import { Link } from "react-router-dom";

export default function MyAppointments() {
  const { data: appointments = [], isLoading, isError, error } = useQuery({
    queryKey: ["appointments"],
    queryFn: getPatientAppointments,
    staleTime: 1000 * 60 * 2, // بازخوانی کش هر ۲ دقیقه یک بار
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600">در حال دریافت لیست نوبت‌های شما...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-md max-w-md">
          <p className="text-red-500 font-bold mb-4">خطا در دریافت اطلاعات نوبت‌ها</p>
          <p className="text-slate-500 text-sm mb-6">
            {error instanceof Error ? error.message : "مشکلی پیش آمده است."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">نوبت‌های رزرو شده من</h1>

        {appointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
            <span className="text-4xl block mb-4">📅</span>
            <p className="text-slate-500 mb-6">هنوز هیچ نوبتی برای شما ثبت نشده است.</p>
            <Link
              to="/doctors"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition text-sm font-semibold inline-block"
            >
              جستجوی پزشک و رزرو نوبت
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment: any) => (
              <div
                key={appointment.id}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{appointment.doctorName}</h3>
                  <p className="text-blue-600 text-sm mb-3">{appointment.doctorSpecialty}</p>
                  <div className="text-slate-500 text-sm space-y-1">
                    <p>🧑 بیمار: {appointment.patientName}</p>
                    <p>📅 تاریخ ثبت: {appointment.date}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                  <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-2 rounded-xl text-center w-full md:w-auto">
                    <span className="text-xs block text-emerald-600">زمان نوبت</span>
                    <span className="font-bold text-sm">{appointment.time}</span>
                  </div>
                  <span className="text-xs text-slate-400">کد رهگیری: #{appointment.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
