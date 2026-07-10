// src/pages/Doctor/DoctorAvailability.tsx

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Clock3,
  RefreshCw,
  PlusCircle,
  Trash2,
  CalendarRange,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { getMyProfile } from "../../services/profile";
import {
  getAvailabilitiesByDoctor,
  autoGenerateAvailability,
  deleteAvailability,
} from "../../services/availability";

type AvailabilityItem = {
  id: number;
  doctor_id: number;
  date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  is_booked?: boolean;
  is_available?: boolean;
  status?: string | null;
};

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

function normalizeStatus(slot: AvailabilityItem) {
  if (slot.is_booked) return "booked";
  if (slot.is_available === false) return "unavailable";
  return "available";
}

function statusText(slot: AvailabilityItem) {
  const status = normalizeStatus(slot);

  switch (status) {
    case "booked":
      return "رزرو شده";
    case "unavailable":
      return "غیرفعال";
    default:
      return "آزاد";
  }
}

function statusClass(slot: AvailabilityItem) {
  const status = normalizeStatus(slot);

  switch (status) {
    case "booked":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "unavailable":
      return "bg-slate-200 text-slate-700 border-slate-300";
    default:
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
}

export default function DoctorAvailability() {
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

  const doctorId = profile?.id;

  const {
    data: availabilities = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<AvailabilityItem[]>({
    queryKey: ["doctor-availability", doctorId],
    queryFn: () => getAvailabilitiesByDoctor(doctorId as number),
    enabled: Boolean(doctorId),
  });

  const autoGenerateMutation = useMutation({
    mutationFn: () => autoGenerateAvailability(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["doctor-availability", doctorId],
      });
      queryClient.invalidateQueries({
        queryKey: ["doctor-schedule-booking"],
      });
      alert("برنامه زمانی با موفقیت ساخته شد");
    },
    onError: () => {
      alert("ساخت خودکار برنامه زمانی انجام نشد");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (availabilityId: number) => deleteAvailability(availabilityId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["doctor-availability", doctorId],
      });
      queryClient.invalidateQueries({
        queryKey: ["doctor-schedule-booking"],
      });
    },
    onError: () => {
      alert("حذف بازه زمانی انجام نشد");
    },
  });

  const sortedAvailabilities = useMemo(() => {
    return [...availabilities].sort((a, b) => {
      const aValue = `${a.date ?? ""} ${a.start_time ?? ""}`;
      const bValue = `${b.date ?? ""} ${b.start_time ?? ""}`;
      return aValue.localeCompare(bValue);
    });
  }, [availabilities]);

  const stats = useMemo(() => {
    const total = availabilities.length;
    const available = availabilities.filter(
      (item) => normalizeStatus(item) === "available"
    ).length;
    const booked = availabilities.filter(
      (item) => normalizeStatus(item) === "booked"
    ).length;
    const unavailable = availabilities.filter(
      (item) => normalizeStatus(item) === "unavailable"
    ).length;

    return { total, available, booked, unavailable };
  }, [availabilities]);

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
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-6 text-white shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black text-cyan-100 backdrop-blur">
              Doctor Availability
            </div>

            <h1 className="mt-4 text-3xl font-black">برنامه زمانی پزشک</h1>

            <p className="mt-3 text-sm leading-7 text-slate-300">
              {profile.name} — در این بخش می‌توانید بازه‌های زمانی آزاد، رزرو شده
              و برنامه کاری خود را مدیریت کنید.
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

            <button
              onClick={() => {
                const confirmed = window.confirm(
                  "برنامه زمانی خودکار برای این پزشک ساخته شود؟"
                );
                if (!confirmed) return;
                autoGenerateMutation.mutate();
              }}
              disabled={autoGenerateMutation.isPending}
              className="flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PlusCircle size={16} />
              {autoGenerateMutation.isPending
                ? "در حال ساخت..."
                : "ساخت خودکار برنامه"}
            </button>

            <Link
              to="/doctor-dashboard"
              className="rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-slate-900"
            >
              بازگشت به داشبورد
            </Link>

            <Link
              to="/doctor-appointments"
              className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white"
            >
              نوبت‌های رزرو شده
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-500">
                  کل بازه‌ها
                </div>
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
                <div className="text-sm font-bold text-slate-500">
                  بازه‌های آزاد
                </div>
                <div className="mt-2 text-3xl font-black text-slate-900">
                  {toPersianDigits(stats.available)}
                </div>
              </div>
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-500">
                  رزرو شده
                </div>
                <div className="mt-2 text-3xl font-black text-slate-900">
                  {toPersianDigits(stats.booked)}
                </div>
              </div>
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <CalendarRange size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-500">
                  غیرفعال
                </div>
                <div className="mt-2 text-3xl font-black text-slate-900">
                  {toPersianDigits(stats.unavailable)}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-200 p-3 text-slate-700">
                <AlertCircle size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-black text-slate-900">
              لیست بازه‌های زمانی
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              بازه‌های ثبت‌شده برای این پزشک از بک‌اند خوانده می‌شود.
            </p>
          </div>

          {isLoading ? (
            <div className="py-10 text-center font-black text-slate-600">
              در حال دریافت برنامه زمانی...
            </div>
          ) : isError ? (
            <div className="rounded-2xl bg-red-50 p-5 text-center font-black text-red-700">
              خطا در دریافت برنامه زمانی پزشک
            </div>
          ) : sortedAvailabilities.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center font-black text-slate-600">
              هنوز هیچ بازه زمانی برای این پزشک ثبت نشده است
            </div>
          ) : (
            <div className="space-y-4">
              {sortedAvailabilities.map((slot) => {
                const deleting =
                  deleteMutation.isPending &&
                  deleteMutation.variables === slot.id;

                const canDelete = !slot.is_booked;

                return (
                  <div
                    key={slot.id}
                    className="rounded-3xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-black text-slate-900">
                          بازه زمانی #{toPersianDigits(slot.id)}
                        </div>

                        <div className="mt-2 text-sm text-slate-500">
                          {profile.name} — {profile.specialty ?? "پزشک"}
                        </div>
                      </div>

                      <div
                        className={`rounded-full border px-4 py-2 text-sm font-black ${statusClass(
                          slot
                        )}`}
                      >
                        {statusText(slot)}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-sm text-slate-500">تاریخ</div>
                        <div className="mt-1 font-black text-slate-900">
                          {formatDate(slot.date)}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="text-sm text-slate-500">ساعت</div>
                        <div className="mt-1 flex items-center gap-2 font-black text-slate-900">
                          <Clock3 size={16} />
                          {toPersianDigits(slot.start_time ?? "")}
                          {" تا "}
                          {toPersianDigits(slot.end_time ?? "")}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                      <div className="text-xs text-slate-400">
                        شناسه پزشک: {toPersianDigits(slot.doctor_id)}
                      </div>

                      {canDelete ? (
                        <button
                          type="button"
                          disabled={deleting}
                          onClick={() => {
                            const confirmed = window.confirm(
                              "این بازه زمانی حذف شود؟"
                            );
                            if (!confirmed) return;
                            deleteMutation.mutate(slot.id);
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                          {deleting ? "در حال حذف..." : "حذف بازه"}
                        </button>
                      ) : (
                        <div className="text-sm font-black text-slate-400">
                          بازه رزرو شده و قابل حذف نیست
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}