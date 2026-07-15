import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  CalendarDays,
  Clock3,
  UserRound,
  XCircle,
  RefreshCw,
} from "lucide-react";

import {
  cancelAppointment,
  getMyAppointments,
  type Appointment,
} from "../../services/appointments";

function toPersianDigits(value: string | number) {
  return String(value).replace(
    /\d/g,
    (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]
  );
}

function extractDate(value?: string | null) {
  if (!value) return null;

  if (value.includes("T")) {
    return value.split("T")[0];
  }

  if (value.includes(" ")) {
    return value.split(" ")[0];
  }

  return value.includes("-") ? value : null;
}

function extractTime(value?: string | null) {
  if (!value) return "";

  if (value.includes("T")) {
    const timePart = value.split("T")[1] ?? "";
    return timePart.slice(0, 8);
  }

  if (value.includes(" ")) {
    const timePart = value.split(" ")[1] ?? "";
    return timePart.slice(0, 8);
  }

  return value.slice(0, 8);
}

function formatDate(dateValue?: string | null) {
  const date = extractDate(dateValue);

  if (!date) return "تاریخ نامشخص";

  try {
    const [year, month, day] = date.split("-").map(Number);

    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(new Date(year, month - 1, day));
  } catch {
    return date;
  }
}

function statusText(status: string) {
  switch (status) {
    case "cancelled":
      return "لغو شده";
    case "completed":
      return "انجام شده";
    case "pending":
      return "در انتظار";
    case "confirmed":
      return "تایید شده";
    default:
      return "رزرو شده";
  }
}

function statusClassName(status: string) {
  switch (status) {
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "completed":
      return "bg-slate-200 text-slate-700";
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "confirmed":
    case "reserved":
    case "booked":
    default:
      return "bg-green-100 text-green-700";
  }
}

export default function MyAppointments() {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const {
    data: appointments = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<Appointment[]>({
    queryKey: ["my-appointments"],
    queryFn: getMyAppointments,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelAppointment,

    onSuccess: async () => {
      setErrorMessage(null);

      await queryClient.invalidateQueries({
        queryKey: ["my-appointments"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["availability"],
      });
    },

    onError: () => {
      setErrorMessage(
        "خطا در لغو نوبت. دوباره تلاش کنید."
      );
    },
  });

  if (isLoading) {
    return (
      <div
        className="p-10 text-center font-black"
        dir="rtl"
      >
        در حال دریافت نوبت‌ها...
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="p-10 text-center font-black text-red-600"
        dir="rtl"
      >
        خطا در دریافت نوبت‌ها
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-50 p-5"
      dir="rtl"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between rounded-3xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-xl font-black text-slate-900">
              نوبت‌های من
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              لیست نوبت‌های ثبت شده
            </p>
          </div>

          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-black text-white"
          >
            <RefreshCw
              size={16}
              className={isFetching ? "animate-spin" : ""}
            />
            بروزرسانی
          </button>
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-2xl bg-red-50 p-4 text-center font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        {appointments.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center font-black">
            هنوز نوبتی ثبت نکرده‌اید
          </div>
        ) : (
          <div className="space-y-5">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-lg font-black">
                      <UserRound size={18} />
                      {appointment.doctor_name ??
                        "پزشک نامشخص"}
                    </div>

                    <div className="mt-2 text-sm text-slate-500">
                      {appointment.doctor_specialty ||
                        "تخصص نامشخص"}
                    </div>
                  </div>

                  <div
                    className={`rounded-full px-4 py-2 text-sm font-black ${statusClassName(
                      appointment.status
                    )}`}
                  >
                    {statusText(appointment.status)}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <CalendarDays size={18} />

                    <div className="mt-2 text-sm text-slate-500">
                      تاریخ نوبت
                    </div>

                    <div className="mt-1 font-black">
                      {formatDate(appointment.start_time)}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <Clock3 size={18} />

                    <div className="mt-2 text-sm text-slate-500">
                      ساعت نوبت
                    </div>

                    <div className="mt-1 font-black">
                      {toPersianDigits(
                        extractTime(
                          appointment.start_time
                        ) || ""
                      )}
                      {" تا "}
                      {toPersianDigits(
                        extractTime(
                          appointment.end_time
                        ) || ""
                      )}
                    </div>
                  </div>
                </div>

                {appointment.status !== "cancelled" && (
                  <button
                    disabled={cancelMutation.isPending}
                    onClick={() =>
                      cancelMutation.mutate(
                        appointment.id
                      )
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 py-3 font-black text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle size={18} />
                    {cancelMutation.isPending
                      ? "در حال لغو..."
                      : "لغو نوبت"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
