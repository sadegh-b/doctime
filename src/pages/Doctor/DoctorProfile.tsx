// مسیر فایل: src/pages/Doctor/DoctorProfile.tsx

import { useQuery } from "@tanstack/react-query";
import { User, Mail, Stethoscope, MapPin, Phone, Briefcase, Wallet } from "lucide-react";
import { getMyProfile } from "../../services/profile";

function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

function formatPrice(value?: number | string | null) {
  const numericValue = Number(value);
  if (value == null || isNaN(numericValue) || numericValue <= 0) {
    return "هزینه ثبت نشده";
  }
  return `${new Intl.NumberFormat("fa-IR").format(numericValue)} تومان`;
}

export default function DoctorProfile() {
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["doctor-profile-detail"],
    queryFn: getMyProfile,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent" />
          <p className="font-bold text-slate-600">در حال دریافت اطلاعات پروفایل...</p>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" dir="rtl">
        <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-black text-red-600">دریافت اطلاعات پروفایل با خطا مواجه شد.</p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-xl bg-cyan-600 px-6 py-2 text-white transition-colors hover:bg-cyan-700 font-bold"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8" dir="rtl">
      <div className="mx-auto max-w-3xl px-4">
        <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-8 text-white shadow-xl mb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl border-4 border-white/20 bg-white/10">
              {profile.image ? (
                <img src={profile.image} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-black">
                  {profile.name?.[0] || "D"}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black">{profile.name || "پزشک گرامی"}</h1>
              <p className="mt-2 text-sm text-cyan-200">{profile.specialty || "تخصص ثبت نشده"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-6">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-4">
            مشخصات و اطلاعات مطب
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-slate-400">نام و نام خانوادگی</div>
                <div className="mt-1 text-sm font-bold text-slate-700">{profile.name || "ثبت نشده"}</div>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-slate-400">آدرس ایمیل</div>
                <div className="mt-1 text-sm font-bold text-slate-700">{profile.email || "ثبت نشده"}</div>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-slate-400">تخصص</div>
                <div className="mt-1 text-sm font-bold text-slate-700">{profile.specialty || "ثبت نشده"}</div>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-slate-400">سابقه کار</div>
                <div className="mt-1 text-sm font-bold text-slate-700">
                  {profile.experience_years ? `${toPersianDigits(profile.experience_years)} سال` : "ثبت نشده"}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4 md:col-span-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-slate-400">هزینه مشاوره</div>
                <div className="mt-1 text-sm font-black text-cyan-700">{formatPrice(profile.consultation_fee)}</div>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4 md:col-span-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-slate-400">آدرس مطب</div>
                <div className="mt-1 text-sm font-bold text-slate-700 leading-6">{profile.address || "ثبت نشده"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
