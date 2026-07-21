import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Clock3,
  RefreshCw,
  Search,
  Stethoscope,
  Users,
  XCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";

import { getMyProfile } from "../../services/profile";
import {
  getDoctorAppointments,
  completeAppointment,
  type Appointment,
} from "../../services/appointments";

function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

function formatDate(date?: string | null) {
  if (!date) return "تاریخ نامشخص";

  try {
    const cleanDate = date.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
      const dateObj = new Date(`${cleanDate}T12:00:00`);
      return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      }).format(dateObj);
    }

    const parsedDate = new Date(cleanDate);
    if (!Number.isNaN(parsedDate.getTime())) {
      parsedDate.setHours(12, 0, 0, 0);
      return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      }).format(parsedDate);
    }

    return toPersianDigits(cleanDate);
  } catch {
    return date;
  }
}

function statusText(status?: string) {
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
    default:
      return "رزرو شده";
  }
}

function statusClass(status?: string) {
  switch (status) {
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-200";
    case "completed":
      return "bg-slate-200 text-slate-700 border-slate-300";
    case "pending":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "confirmed":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "booked":
    case "reserved":
    default:
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
}

function canComplete(status?: string) {
  return status !== "completed" && status !== "cancelled";
}

export default function DoctorAppointments() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "reserved" | "pending" | "completed" | "cancelled"
  >("all");

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["doctor-profile"],
    queryFn: getMyProfile,
  });

  const doctorId = profile?.id;

  const {
    data: appointments = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<Appointment[]>({
    queryKey: ["doctor-appointments", doctorId],
    queryFn: () => getDoctorAppointments(doctorId),
    enabled: Boolean(doctorId),
  });

  const completeMutation = useMutation({
    mutationFn: (appointmentId: number) => completeAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["patient-appointments"] });
    },
    onError: () => {
      alert("تکمیل نوبت انجام نشد");
    },
  });

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((item) => {
        const matchesSearch =
          !search.trim() ||
          (item.patient_name ?? "")
            .toLowerCase()
            .includes(search.trim().toLowerCase()) ||
          (item.notes ?? "")
            .toLowerCase()
            .includes(search.trim().toLowerCase());

        const normalizedStatus =
          item.status === "booked" ? "reserved" : item.status ?? "reserved";

        const matchesStatus =
          statusFilter === "all" ? true : normalizedStatus === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const aDate = `${a.date ?? ""} ${a.start_time ?? ""}`;
        const bDate = `${b.date ?? ""} ${b.start_time ?? ""}`;
        return bDate.localeCompare(aDate);
      });
  }, [appointments, search, statusFilter]);

  const stats = useMemo(() => {
    const normalize = (status?: string) =>
      status === "booked" ? "reserved" : status;

    return {
      total: appointments.length,
      reserved: appointments.filter((a) => normalize(a.status) === "reserved")
        .length,
      pending: appointments.filter((a) => normalize(a.status) === "pending")
        .length,
      completed: appointments.filter((a) => normalize(a.status) === "completed")
        .length,
      cancelled: appointments.filter((a) => normalize(a.status) === "cancelled")
        .length,
    };
  }, [appointments]);

  if (profileLoading) {
    return (
      <div dir="rtl" className="p-10 text-center font-black">
        در حال دریافت اطلاعات پزشک...
      </div>
    );
  }

  if (profileError || !doctorId) {
    return (
      <div dir="rtl" className="p-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
          <div className="text-lg font-black text-red-700">
            دریافت اطلاعات پزشک انجام نشد
          </div>

          <button
            onClick={() => refetchProfile()}
            className="mt-4 rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-black text-white"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-5">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-6 text-white shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black text-cyan-100 backdrop-blur">
              Doctor Appointments
            </div>

            <h1 className="mt-4 text-3xl font-black">نوبت‌های پزشک</h1>

            <p className="mt-3 text-sm leading-7 text-slate-300">
              {profile?.name ?? "پزشک"} — همه نوبت‌های ثبت‌شده برای این پزشک در
              این صفحه نمایش داده می‌شود.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-black text-white backdrop-blur"
            >
              <RefreshCw
                size={16}
                className={isFetching ? "animate-spin" : ""}
              />
              بروزرسانی
            </button>

            <Link
              to="/doctor-dashboard"
              className="rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-slate-900"
            >
              بازگشت به داشبورد
            </Link>

            <Link
              to="/doctor-availability"
              className="rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-black text-white"
            >
              مدیریت برنامه زمانی
            </Link>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-500">کل نوبت‌ها</div>
                <div className="mt-2 text-3xl font-black text-slate-900">
                  {toPersianDigits(stats.total)}
                </div>
              </div>
              <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700">
                <CalendarDays size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-500">رزرو شده</div>
                <div className="mt-2 text-3xl font-black text-slate-900">
                  {toPersianDigits(stats.reserved)}
                </div>
              </div>
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <Users size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-500">در انتظار</div>
                <div className="mt-2 text-3xl font-black text-slate-900">
                  {toPersianDigits(stats.pending)}
                </div>
              </div>
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <AlertCircle size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-500">انجام شده</div>
                <div className="mt-2 text-3xl font-black text-slate-900">
                  {toPersianDigits(stats.completed)}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-200 p-3 text-slate-700">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-500">لغو شده</div>
                <div className="mt-2 text-3xl font-black text-slate-900">
                  {toPersianDigits(stats.cancelled)}
                </div>
              </div>
              <div className="rounded-2xl bg-red-100 p-3 text-red-700">
                <XCircle size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجو بر اساس نام بیمار یا توضیحات"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-11 pl-4 text-sm outline-none transition focus:border-cyan-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as
                    | "all"
                    | "reserved"
                    | "pending"
                    | "completed"
                    | "cancelled"
                )
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="reserved">رزرو شده</option>
              <option value="pending">در انتظار</option>
              <option value="completed">انجام شده</option>
              <option value="cancelled">لغو شده</option>
            </select>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-black text-slate-900">لیست نوبت‌ها</h2>
            <p className="mt-2 text-sm text-slate-500">
              نوبت‌های ثبت‌شده برای پزشک با توجه به داده‌های بک‌اند
            </p>
          </div>

          {isLoading ? (
            <div className="py-10 text-center font-black text-slate-600">
              در حال دریافت نوبت‌ها...
            </div>
          ) : isError ? (
            <div className="rounded-2xl bg-red-50 p-5 text-center font-black text-red-700">
              خطا در دریافت نوبت‌های پزشک
            </div>
                    ) : filteredAppointments.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 py-12 text-center text-slate-500">
              <CalendarDays className="mx-auto mb-3 text-slate-400" size={48} />
              <p className="text-base font-black">هیچ نوبتی یافت نشد</p>
              <p className="mt-1 text-xs font-bold text-slate-400">
                برنامه زمانی یا فیلترهای جستجوی خود را بررسی کنید.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 transition hover:shadow-md md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                      <Stethoscope size={24} />
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-black text-slate-900">
                          {app.patient_name || "بیمار مهمان"}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusClass(
                            app.status
                          )}`}
                        >
                          {statusText(app.status)}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={14} className="text-slate-400" />
                          {formatDate(app.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock3 size={14} className="text-slate-400" />
                          ساعت {toPersianDigits(app.start_time || "")} تا{" "}
                          {toPersianDigits(app.end_time || "")}
                        </span>
                      </div>

                      {app.notes && (
                        <div className="mt-3 flex items-start gap-1.5 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600">
                          <FileText size={14} className="mt-0.5 shrink-0 text-slate-400" />
                          <span>توضیحات بیمار: {app.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-slate-50 pt-3 md:border-t-0 md:pt-0">
                    {canComplete(app.status) && (
                      <button
                        onClick={() => {
                          if (
                            confirm("آیا از تغییر وضعیت این نوبت به 'انجام شده' اطمینان دارید؟")
                          ) {
                            completeMutation.mutate(app.id);
                          }
                        }}
                        disabled={completeMutation.isPending}
                        className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-black text-white hover:bg-cyan-700 disabled:opacity-50"
                      >
                        {completeMutation.isPending ? "در حال ثبت..." : "تکمیل نوبت"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
