import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getMyAppointments } from "../../services/appointments";

type AppointmentItem = {
  id: number | string;
  doctor_name?: string | null;
  specialty?: string | null;
  date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  status?: string | null;
};

function toPersianDigits(value: string): string {
  return value.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

function formatDate(input?: string | null): string {
  if (!input) return "تاریخ نامشخص";

  // اگر فقط تاریخ باشد، مستقیم برگردان
  // اگر datetime باشد، تاریخ را استخراج کن
  const normalized = input.trim();

  // YYYY-MM-DD یا YYYY/MM/DD
  const dateOnlyMatch = normalized.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
  if (dateOnlyMatch) {
    const [, y, m, d] = dateOnlyMatch;
    return toPersianDigits(`${y}/${m}/${d}`);
  }

  // ISO datetime
  const date = new Date(normalized);
  if (!Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }

  return normalized;
}

function extractTime(input?: string | null): string {
  if (!input) return "";

  const normalized = input.trim();

  // HH:MM or HH:MM:SS
  const timeMatch = normalized.match(/^(\d{2}):(\d{2})/);
  if (timeMatch) return `${timeMatch[1]}:${timeMatch[2]}`;

  // ISO datetime -> time part
  if (normalized.includes("T")) {
    const timePart = normalized.split("T")[1];
    if (timePart) {
      const isoTimeMatch = timePart.match(/^(\d{2}):(\d{2})/);
      if (isoTimeMatch) return `${isoTimeMatch[1]}:${isoTimeMatch[2]}`;
    }
  }

  return normalized;
}

function getStatusLabel(status?: string | null): string {
  const value = (status || "").toLowerCase();

  if (value === "confirmed" || value === "تایید شده") return "تایید شده";
  if (value === "pending" || value === "در انتظار") return "در انتظار تایید";
  if (value === "cancelled" || value === "canceled" || value === "لغو شده") return "لغو شده";

  return status || "نامشخص";
}

function getStatusClass(status?: string | null): string {
  const value = (status || "").toLowerCase();

  if (value === "confirmed" || value === "تایید شده") return "text-green-600 bg-green-50";
  if (value === "pending" || value === "در انتظار") return "text-yellow-600 bg-yellow-50";
  if (value === "cancelled" || value === "canceled" || value === "لغو شده") return "text-red-600 bg-red-50";

  return "text-slate-600 bg-slate-100";
}

export default function MyAppointments() {
  const {
    data: appointments = [],
    isLoading,
    isError,
  } = useQuery<AppointmentItem[]>({
    queryKey: ["my-appointments"],
    queryFn: getMyAppointments,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" dir="rtl">
        در حال دریافت نوبت‌ها...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-600" dir="rtl">
        خطا در دریافت نوبت‌ها
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8" dir="rtl">
      <div className="mx-auto max-w-5xl px-4">
        <h1 className="mb-2 text-3xl font-black">نوبت‌های من</h1>
        <p className="mb-8 text-slate-500">لیست نوبت‌های ثبت شده</p>

        {appointments.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow">
            <p>هنوز نوبتی ثبت نکرده‌اید</p>

            <Link
              to="/doctors"
              className="inline-block mt-5 rounded-xl bg-cyan-600 px-6 py-3 text-white"
            >
              جستجوی پزشک
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {appointments.map((item) => {
              const dateSource = item.date || item.start_time;
              const formattedDate = formatDate(dateSource);
              const startTime = extractTime(item.start_time);
              const endTime = extractTime(item.end_time);

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border bg-white p-6 shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black">
                        {item.doctor_name || "پزشک"}
                      </h2>
                      <p className="mt-2 text-cyan-600">
                        {item.specialty || "تخصص نامشخص"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-bold ${getStatusClass(
                        item.status
                      )}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-slate-600">
                    <p>
                      📅 <span className="font-bold">تاریخ نوبت:</span>{" "}
                      {formattedDate}
                    </p>

                    <p>
                      ⏰ <span className="font-bold">ساعت نوبت:</span>{" "}
                      {startTime ? toPersianDigits(startTime) : "نامشخص"}
                      {endTime ? ` تا ${toPersianDigits(endTime)}` : ""}
                    </p>
                  </div>

                  <div className="mt-4 text-xs text-slate-400">
                    کد پیگیری: #{toPersianDigits(String(item.id))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
