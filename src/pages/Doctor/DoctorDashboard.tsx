// مسیر فایل: src/pages/doctor/DoctorDashboard.tsx

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Clock3,
  RefreshCw,
  Stethoscope,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getMyProfile } from "../../services/profile";
import {
  getDoctorAppointments,
  cancelAppointment,
  completeAppointment,
  type Appointment,
} from "../../services/appointments";

function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

function formatDate(date?: string | null) {
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
    case "reserved":
    case "booked":
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
      return "bg-cyan-100 text-cyan-700 border-cyan-200";
    case "reserved":
    case "booked":
    default:
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
}

export default function DoctorDashboard() {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["doctor-profile"],
    queryFn: getMyProfile,
  });

  const {
    data: appointments = [],
    isLoading: appointmentsLoading,
    isError: appointmentsError,
    refetch: refetchAppointments,
    isFetching,
  } = useQuery<Appointment[]>({
    queryKey: ["doctor-appointments-dashboard"],
    queryFn: getDoctorAppointments,
  });

  // عملیات اتمام نوبت
  const completeMutation = useMutation({
    mutationFn: (id: number) => completeAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments-dashboard"] });
      alert("وضعیت نوبت با موفقیت به 'انجام شده' تغییر یافت.");
    },
    onError: (error: any) => {
      alert(error?.response?.data?.detail ?? "خطا در ثبت وضعیت اتمام نوبت");
    },
  });

  // عملیات لغو نوبت
  const cancelMutation = useMutation({
    mutationFn: (id: number) => cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments-dashboard"] });
      alert("نوبت با موفقیت لغو شد.");
    },
    onError: (error: any) => {
      alert(error?.response?.data?.detail ?? "خطا در لغو نوبت");
    },
  });

  const stats = useMemo(() => {
    const total = appointments.length;
    const booked = appointments.filter((a) =>
      ["booked", "reserved", "confirmed"].includes(a.status ?? "")
    ).length;
    const pending = appointments.filter((a) => a.status === "pending").length;
    const completed = appointments.filter((a) => a.status === "completed").length;
    const cancelled = appointments.filter((a) => a.status === "cancelled").length;

    return { total, booked, pending, completed, cancelled };
  }, [appointments]);

  const recentAppointments = useMemo(() => {
    return [...appointments]
      .sort((a, b) => {
        const aDate = `${a.date ?? ""} ${a.start_time ?? ""}`;
        const bDate = `${b.date ?? ""} ${b.start_time ?? ""}`;
        return bDate.localeCompare(aDate);
      })
      .slice(0, 5);
  }, [appointments]);

  if (profileLoading) {
    return (
      <div dir="rtl" className="p-10 text-center font-black">
        در حال دریافت اطلاعات پزشک...
      </div>
    );
  }

  if (profileError || !profile) {
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
              Doctor Dashboard
            </div>

            <h1 className="mt-4 text-3xl font-black">
              خوش آمدی {profile.name ?? "پزشک"}
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-300">
              {profile.specialty ?? "پزشک"} — از این داشبورد می‌توانی نوبت‌ها،
              بیماران و برنامه کاری خودت را مدیریت کنی.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => refetchAppointments()}
              className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-black text-white backdrop-blur"
            >
              <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
              بروزرسانی
            </button>

            <Link
              to="/doctor/appointments"
              className="rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-slate-900"
            >
              نوبت‌های پزشک
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
                  {toPersianDigits(stats.booked)}
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

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  آخرین نوبت‌ها
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  آخرین نوبت‌های ثبت‌شده بیماران برای شما
                </p>
              </div>

              <Link
                to="/doctor/appointments"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700"
              >
                مشاهده همه
                <ArrowLeft size={16} />
              </Link>
            </div>

            {appointmentsLoading ? (
              <div className="py-10 text-center font-black text-slate-600">
                در حال دریافت نوبت‌ها...
              </div>
            ) : appointmentsError ? (
              <div className="rounded-2xl bg-red-50 p-5 text-center font-black text-red-700">
                خطا در دریافت نوبت‌ها
              </div>
            ) : recentAppointments.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-8 text-center font-black text-slate-600">
                هنوز نوبتی ثبت نشده است
              </div>
            ) : (
              <div className="space-y-4">
                {recentAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-3xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-lg font-black text-slate-900">
                          <Users size={18} />
                          {appointment.patient_name ?? "بیمار نامشخص"}
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                          <Stethoscope size={16} />
                          {profile.specialty ?? "تخصص نامشخص"}
                        </div>
                      </div>

                      <div
                        className={`rounded-full border px-4 py-2 text-sm font-black ${statusClass(
                          appointment.status
                        )}`}
                      >
                        {statusText(appointment.status)}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-sm text-slate-500">تاریخ</div>
                        <div className="mt-1 font-black text-slate-900">
                          {formatDate(appointment.date)}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-sm text-slate-500">ساعت</div>
                        <div className="mt-1 flex items-center gap-2 font-black text-slate-900">
                          <Clock3 size={16} />
                          {toPersianDigits(appointment.start_time ?? "")}
                          {" تا "}
                          {toPersianDigits(appointment.end_time ?? "")}
                        </div>
                      </div>
                    </div>

                    {appointment.notes ? (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-sm font-black text-slate-700">
                          توضیحات بیمار
                        </div>
                        <div className="mt-2 text-sm leading-7 text-slate-600">
                          {appointment.notes}
                        </div>
                      </div>
                    ) : null}

                    {/* دکمه‌های کنترل وضعیت نوبت */}
                    {appointment.status !== "completed" && appointment.status !== "cancelled" && (
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => completeMutation.mutate(appointment.id)}
                          disabled={completeMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {completeMutation.isPending ? "درحال انجام..." : <><CheckCircle2 size={18} /> اتمام نوبت</>}
                        </button>
                        <button
                          onClick={() => cancelMutation.mutate(appointment.id)}
                          disabled={cancelMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-red-50 py-3 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          {cancelMutation.isPending ? "درحال لغو..." : <><XCircle size={18} /> لغو نوبت</>}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">
                اطلاعات پزشک
              </h2>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">نام پزشک</div>
                  <div className="mt-1 font-black text-slate-900">
                    {profile.name ?? "-"}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">تخصص</div>
                  <div className="mt-1 font-black text-slate-900">
                    {profile.specialty ?? "-"}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">ایمیل</div>
                  <div className="mt-1 font-black text-slate-900">
                    {profile.email ?? "-"}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">دسترسی سریع</h2>

              <div className="mt-5 grid gap-3">
                <Link
                  to="/doctor/appointments"
                  className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4 text-sm font-black text-slate-800 transition hover:border-cyan-400 hover:bg-cyan-50"
                >
                  <span>مشاهده نوبت‌های پزشک</span>
                  <ArrowLeft size={16} />
                </Link>

                <Link
                  to="/doctor/profile"
                  className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4 text-sm font-black text-slate-800 transition hover:border-cyan-400 hover:bg-cyan-50"
                >
                  <span>مشاهده پروفایل پزشک</span>
                  <ArrowLeft size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
