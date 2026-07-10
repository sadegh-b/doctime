import { useState } from "react";
import { CalendarDays } from "lucide-react";

export default function BookAppointment() {
  const [message, setMessage] = useState("");

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-5">
      <div className="mx-auto max-w-4xl">

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <CalendarDays className="text-cyan-600" size={28} />

            <h1 className="text-2xl font-black text-slate-900">
              رزرو نوبت پزشک
            </h1>
          </div>

          <p className="mt-4 text-slate-600">
            در این بخش بیمار می‌تواند زمان مناسب را انتخاب و نوبت ثبت کند.
          </p>

          <button
            onClick={() =>
              setMessage("صفحه رزرو نوبت آماده اتصال به تقویم پزشک است")
            }
            className="mt-6 rounded-2xl bg-cyan-600 px-5 py-3 font-black text-white"
          >
            شروع رزرو
          </button>

          {message && (
            <div className="mt-5 rounded-2xl bg-cyan-50 p-4 font-bold text-cyan-700">
              {message}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}