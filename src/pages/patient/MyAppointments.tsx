import { useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  CalendarDays,
  Clock3,
  RefreshCw,
  UserRound,
  XCircle,
  Search,
  Filter,
} from "lucide-react";

import {
  cancelAppointment,
  getMyAppointments,
  type Appointment,
} from "../../services/appointments";

const DEFAULT_APPOINTMENT_DURATION_MINUTES = 30;

function toPersianDigits(value: string | number): string {
  return String(value).replace(
    /\d/g,
    (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]
  );
}

function extractDate(value?: string | null): string | null {
  if (!value) return null;
  const match = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  return match?.[0] ?? null;
}

function extractTime(value?: string | null): string {
  if (!value) return "";

  const match = value.match(/(\d{1,2}):(\d{2})/);
  if (!match) return "";

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return "";
  }

  return `${String(hour).padStart(2, "0")}:${String(
    minute
  ).padStart(2, "0")}`;
}

function addMinutesToTime(
  value?: string | null,
  minutes = DEFAULT_APPOINTMENT_DURATION_MINUTES
): string {
  const time = extractTime(value);
  if (!time) return "";

  const [hour, minute] = time.split(":").map(Number);
  const totalMinutes = hour * 60 + minute + minutes;
  const minutesInDay = 24 * 60;
  const normalizedMinutes =
    ((totalMinutes % minutesInDay) + minutesInDay) % minutesInDay;

  const resultHour = Math.floor(normalizedMinutes / 60);
  const resultMinute = normalizedMinutes % 60;

  return `${String(resultHour).padStart(2, "0")}:${String(
    resultMinute
  ).padStart(2, "0")}`;
}

function formatDate(value?: string | null): string {
  const date = extractDate(value);

  if (!date) return "تاریخ نامشخص";

  const [year, month, day] = date.split("-").map(Number);

  if (!year || month < 1 || month > 12 || day < 1 || day > 31) {
    return "تاریخ نامشخص";
  }

  const parsedDate = new Date(year, month - 1, day);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return "تاریخ نامشخص";
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(parsedDate);
}

function formatAppointmentTime(
  startTime?: string | null,
  endTime?: string | null
): string {
  const start = extractTime(startTime);

  if (!start) return "زمان نامشخص";

  const end =
    extractTime(endTime) ||
    addMinutesToTime(
      startTime,
      DEFAULT_APPOINTMENT_DURATION_MINUTES
    );

  if (!end) return toPersianDigits(start);

  return `${toPersianDigits(start)} تا ${toPersianDigits(end)}`;
}

function statusText(status?: string | null): string {
  switch (status) {
    case "cancelled":
      return "لغو شده";
    case "completed":
      return "انجام شده";
    case "pending":
      return "در انتظار";
    case "confirmed":
      return "تایید شده";
    case "booked":
    case "reserved":
      return "رزرو شده";
    default:
      return "رزرو شده";
  }
}

function statusClassName(status?: string | null): string {
  switch (status) {
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "completed":
      return "bg-slate-200 text-slate-700";
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "confirmed":
      return "bg-cyan-100 text-cyan-700";
    case "booked":
    case "reserved":
    default:
      return "bg-green-100 text-green-700";
  }
}

function canCancelAppointment(
  appointment: Appointment
): boolean {
  return !["cancelled", "completed"].includes(
    appointment.status
  );
}

function isFutureAppointment(appointment: Appointment): boolean {
  const dateValue = extractDate(appointment.date);
  const timeValue = extractTime(appointment.start_time);

  if (!dateValue) return false;

  const dateTimeString = `${dateValue}T${timeValue || "00:00"}:00`;
  const appointmentDate = new Date(dateTimeString);

  if (Number.isNaN(appointmentDate.getTime())) return false;

  return appointmentDate.getTime() >= Date.now();
}

export default function MyAppointments() {
  const queryClient = useQueryClient();

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [onlyCancelable, setOnlyCancelable] = useState(false);
  const [onlyFuture, setOnlyFuture] = useState(false);

  const {
    data: appointments = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery<Appointment[]>({
    queryKey: ["my-appointments"],
    queryFn: getMyAppointments,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelAppointment,

    onMutate: () => {
      setErrorMessage(null);
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["my-appointments"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["availability"],
        }),
      ]);
    },

    onError: () => {
      setErrorMessage(
        "خطا در لغو نوبت. لطفاً دوباره تلاش کنید."
      );
    },
  });

  function handleCancel(appointmentId: number) {
    const confirmed = window.confirm(
      "آیا از لغو این نوبت مطمئن هستید؟"
    );

    if (confirmed) {
      cancelMutation.mutate(appointmentId);
    }
  }

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const doctorName = appointment.doctor_name || "";
      const specialty = appointment.doctor_specialty || "";

      const matchesSearch =
        !searchTerm ||
        doctorName.includes(searchTerm) ||
        specialty.includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" ||
        appointment.status === statusFilter;

      const matchesCancelable =
        !onlyCancelable || canCancelAppointment(appointment);

      const matchesFuture =
        !onlyFuture || isFutureAppointment(appointment);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCancelable &&
        matchesFuture
      );
    });
  }, [
    appointments,
    searchTerm,
    statusFilter,
    onlyCancelable,
    onlyFuture,
  ]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-slate-50 p-10 text-center font-black text-slate-700"
        dir="rtl"
      >
        در حال دریافت نوبت‌ها...
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="min-h-screen bg-slate-50 p-10 text-center"
        dir="rtl"
      >
        <p className="font-black text-red-600">
          خطا در دریافت نوبت‌ها
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="mt-5 rounded-2xl bg-cyan-600 px-5 py-3 font-black text-white transition hover:bg-cyan-700"
        >
          تلاش دوباره
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5" dir="rtl">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-black text-slate-900">
                نوبت‌های من
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                لیست نوبت‌های ثبت‌شده و مدیریت وضعیت آن‌ها
              </p>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-black text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={isFetching ? "animate-spin" : ""}
              />
              {isFetching ? "در حال بروزرسانی..." : "بروزرسانی"}
            </button>
          </div>

          {/* Filters */}
          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            <div className="relative lg:col-span-2">
              <Search
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو بر اساس نام پزشک یا تخصص"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-11 pl-4 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-500 focus:bg-white"
              />
            </div>

            <div className="relative">
              <Filter
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-11 pl-4 text-sm font-bold text-slate-700 outline-none transition focus:border-cyan-500 focus:bg-white"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="reserved">رزرو شده</option>
                <option value="booked">بوک شده</option>
                <option value="confirmed">تایید شده</option>
                <option value="pending">در انتظار</option>
                <option value="completed">انجام شده</option>
                <option value="cancelled">لغو شده</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={onlyCancelable}
                  onChange={(e) =>
                    setOnlyCancelable(e.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                فقط قابل لغوها
              </label>

              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={onlyFuture}
                  onChange={(e) =>
                    setOnlyFuture(e.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                فقط نوبت‌های آینده
              </label>
            </div>
          </div>
        </header>

        {errorMessage && (
          <div
            role="alert"
            className="mb-5 rounded-2xl bg-red-50 p-4 text-center font-bold text-red-700"
          >
            {errorMessage}
          </div>
        )}

        {filteredAppointments.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center font-black text-slate-700 shadow-sm">
            موردی با فیلترهای انتخاب‌شده پیدا نشد
          </div>
        ) : (
          <div className="space-y-5">
            {filteredAppointments.map((appointment) => {
              const canCancel =
                canCancelAppointment(appointment);

              const isCancellingThisAppointment =
                cancelMutation.isPending &&
                cancelMutation.variables === appointment.id;

              return (
                <article
                  key={appointment.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-lg font-black text-slate-900">
                        <UserRound size={18} />
                        <span>
                          {appointment.doctor_name ||
                            "پزشک نامشخص"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        {appointment.doctor_specialty ||
                          "تخصص نامشخص"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-4 py-2 text-sm font-black ${statusClassName(
                        appointment.status
                      )}`}
                    >
                      {statusText(appointment.status)}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <CalendarDays
                        size={18}
                        className="text-cyan-700"
                      />
                      <p className="mt-2 text-sm text-slate-500">
                        تاریخ نوبت
                      </p>
                      <p className="mt-1 font-black text-slate-900">
                        {formatDate(appointment.date)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <Clock3
                        size={18}
                        className="text-cyan-700"
                      />
                      <p className="mt-2 text-sm text-slate-500">
                        ساعت نوبت
                      </p>
                      <p className="mt-1 font-black text-slate-900">
                        {formatAppointmentTime(
                          appointment.start_time,
                          appointment.end_time
                        )}
                      </p>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">
                        توضیحات
                      </p>
                      <p className="mt-1 whitespace-pre-wrap font-medium text-slate-800">
                        {appointment.notes}
                      </p>
                    </div>
                  )}

                  {canCancel && (
                    <button
                      type="button"
                      disabled={cancelMutation.isPending}
                      onClick={() =>
                        handleCancel(appointment.id)
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 py-3 font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <XCircle size={18} />
                      {isCancellingThisAppointment
                        ? "در حال لغو..."
                        : "لغو نوبت"}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
