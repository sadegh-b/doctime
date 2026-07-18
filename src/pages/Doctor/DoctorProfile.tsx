// مسیر فایل: src/pages/Doctor/DoctorProfile.tsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, Stethoscope, MapPin, Phone, Edit2, X, Check } from "lucide-react";
import { getMyProfile, updateMyProfile, UpdateProfilePayload } from "../../services/profile";

export default function DoctorProfile() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // تعریف Stateها بر اساس فیلدهای واقعی تایپ کامپوننت
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  // دریافت اطلاعات پروفایل
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["doctor-profile-detail"],
    queryFn: getMyProfile,
  });

  // پر کردن اولیه فرم به محض دریافت اطلاعات از بک‌اند
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setSpecialty(profile.specialty || "");
      setCity(profile.city || "");
      setAddress(profile.address || "");
    }
  }, [profile]);

  // Mutation برای ارسال اطلاعات جدید به سرور
  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      // بروزرسانی کش برای نمایش اطلاعات جدید در تمام برنامه
      queryClient.invalidateQueries({ queryKey: ["doctor-profile-detail"] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      alert(error?.response?.data?.detail || "خطا در بروزرسانی اطلاعات رخ داد.");
    }
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

  const handleCancel = () => {
    // بازگرداندن مقادیر فرم به مقادیر کش شده اصلی سرور
    setName(profile.name || "");
    setSpecialty(profile.specialty || "");
    setCity(profile.city || "");
    setAddress(profile.address || "");
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updateData: UpdateProfilePayload = {
      name,
      specialty: specialty || null,
      city: city || null,
      address: address || null,
    };

    updateMutation.mutate(updateData);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8" dir="rtl">
      <div className="mx-auto max-w-3xl px-4">
        {/* هدر کارت اطلاعات پزشک */}
        <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-8 text-white shadow-xl mb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl border-4 border-white/20 bg-white/10 flex items-center justify-center text-3xl font-black">
                {name?.[0] || "D"}
              </div>
              <div>
                <h1 className="text-2xl font-black">{profile.name || "پزشک گرامی"}</h1>
                <p className="mt-2 text-sm text-cyan-200">{profile.specialty || "تخصص ثبت نشده"}</p>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 self-start sm:self-center rounded-2xl bg-cyan-600/30 px-5 py-3 text-sm font-bold text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/50 transition-all duration-200"
              >
                <Edit2 className="h-4 w-4" />
                ویرایش اطلاعات مطب
              </button>
            )}
          </div>
        </div>

        {/* بدنه اصلی فرم و اطلاعات */}
        <form onSubmit={handleSubmit} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-900">
              {isEditing ? "ویرایش مشخصات و اطلاعات مطب" : "مشخصات و اطلاعات مطب"}
            </h2>
            {isEditing && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 text-xs font-bold transition-all"
                >
                  <X className="h-4 w-4" />
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold disabled:opacity-50 transition-all"
                >
                  <Check className="h-4 w-4" />
                  {updateMutation.isPending ? "در حال ذخیره..." : "ذخیره تغییرات"}
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* نام و نام خانوادگی */}
            <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <User className="h-5 w-5" />
              </div>
              <div className="w-full">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">نام و نام خانوادگی</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:border-cyan-500 focus:outline-none"
                    placeholder="نام و نام خانوادگی خود را وارد کنید"
                    required
                  />
                ) : (
                  <div className="mt-1 text-sm font-bold text-slate-700">{profile.name || "ثبت نشده"}</div>
                )}
              </div>
            </div>

            {/* آدرس ایمیل (غیرقابل ویرایش) */}
            <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4 opacity-75">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-slate-400">آدرس ایمیل (غیر قابل تغییر)</div>
                <div className="mt-1 text-sm font-bold text-slate-700">{profile.email || "ثبت نشده"}</div>
              </div>
            </div>

            {/* تخصص */}
            <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div className="w-full">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">تخصص</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:border-cyan-500 focus:outline-none"
                    placeholder="مثال: زنان و زایمان"
                  />
                ) : (
                  <div className="mt-1 text-sm font-bold text-slate-700">{profile.specialty || "ثبت نشده"}</div>
                )}
              </div>
            </div>

            {/* شماره تلفن (غیرقابل ویرایش از این فرم) */}
            <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4 opacity-75">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-slate-400">شماره تلفن</div>
                <div className="mt-1 text-sm font-bold text-slate-700">{profile.phone || "ثبت نشده"}</div>
              </div>
            </div>

            {/* شهر */}
            <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4 md:col-span-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="w-full">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">شهر</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:border-cyan-500 focus:outline-none"
                    placeholder="مثال: زاهدان"
                  />
                ) : (
                  <div className="mt-1 text-sm font-bold text-slate-700">{profile.city || "ثبت نشده"}</div>
                )}
              </div>
            </div>

            {/* آدرس مطب */}
            <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4 md:col-span-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="w-full">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">آدرس مطب</label>
                {isEditing ? (
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:border-cyan-500 focus:outline-none resize-y"
                    placeholder="آدرس دقیق مطب را وارد کنید"
                  />
                ) : (
                  <div className="mt-1 text-sm font-bold text-slate-700 leading-6">{profile.address || "ثبت نشده"}</div>
                )}
              </div>
            </div>
          </div>

          {/* دکمه‌های انتهای فرم در حالت ویرایش */}
          {isEditing && (
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 font-bold text-sm transition-all"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 font-bold text-sm disabled:opacity-50 transition-all shadow-sm"
              >
                {updateMutation.isPending ? "در حال ذخیره تغییرات..." : "ذخیره تغییرات"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
