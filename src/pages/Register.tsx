// مسیر فایل: src/pages/Register.tsx

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Phone, Lock, Mail, Activity, Calendar, MapPin, DollarSign, CreditCard } from "lucide-react";
import { requestOtp, toEnglishDigits } from "../services/auth";

// استانداردسازی روزهای کاری برای ارسال ایمن به بک‌اند بر اساس نام انگلیسی کوچک
const WORK_DAYS = [
  { id: "saturday", label: "شنبه" },
  { id: "sunday", label: "یکشنبه" },
  { id: "monday", label: "دوشنبه" },
  { id: "tuesday", label: "سه شنبه" },
  { id: "wednesday", label: "چهارشنبه" },
  { id: "thursday", label: "پنجشنبه" },
  { id: "friday", label: "جمعه" },
];

// لیست استاندارد تخصص‌های پزشکی برای جلوگیری از ورود داده‌های نامعتبر
const DOCTOR_SPECIALTIES = [
  "عمومی",
  "داخلی",
  "کودکان و اطفال",
  "زنان و زایمان",
  "قلب و عروق",
  "مغز و اعصاب (نورولوژی)",
  "روانپزشکی (اعصاب و روان)",
  "چشم پزشکی",
  "گوش، حلق و بینی",
  "پوست، مو و زیبایی",
  "ارتوپدی (استخوان و مفاصل)",
  "جراحی عمومی",
  "دندانپزشکی",
  "اورولوژی (کلیه و مجاری ادراری)",
  "غدد و متابولیسم",
  "گوارش و کبد",
  "ریه و آسم",
  "روماتولوژی",
];

const PROVINCES_AND_CITIES: Record<string, string[]> = {
  "سیستان و بلوچستان": ["زاهدان", "چابهار", "ایرانشهر", "زابل", "سراوان", "خاش"],
  "تهران": ["تهران", "شهریار", "اسلامشهر", "ری", "قدس", "ملارد"],
  "خراسان رضوی": ["مشهد", "نیشابور", "سبزوار", "تربت حیدریه", "قوچان"],
  "اصفهان": ["اصفهان", "کاشان", "خمینی‌شهر", "نجف‌آباد", "شاهین‌شهر"],
  "فارس": ["شیراز", "مرودشت", "جهرم", "فسا", "کازرون"],
  "آذربایجان شرقی": ["تبریز", "مراغه", "مرند", "میانه", "اهر"],
  "خوزستان": ["اهواز", "دزفول", "آبادان", "خرمشهر", "ماهشهر"],
  "مازندران": ["ساری", "بابل", "آمل", "قائم‌شهر", "بهشهر"],
};

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    email: "",
    specialty: "",
    nationalId: "", // فیلد کد ملی در استیت عمومی
    province: "",
    city: "",
    visitFee: "",
    workDays: [] as string[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "phone" || name === "visitFee" || name === "nationalId") {
      const cleanVal = value.replace(/[^\d۰-۹]/g, "");
      setFormData(prev => ({ ...prev, [name]: cleanVal }));
    } else if (name === "province") {
      setFormData(prev => ({ ...prev, province: value, city: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDayToggle = (dayId: string) => {
    setFormData(prev => {
      const isSelected = prev.workDays.includes(dayId);
      const updatedDays = isSelected
        ? prev.workDays.filter(d => d !== dayId)
        : [...prev.workDays, dayId];
      return { ...prev, workDays: updatedDays };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = toEnglishDigits(formData.phone);
    if (!/^09\d{9}$/.test(cleanPhone)) {
      setError("شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد.");
      return;
    }

    const cleanNationalId = toEnglishDigits(formData.nationalId);
    if (cleanNationalId.length !== 10) {
      setError("کد ملی باید دقیقاً ۱۰ رقم باشد.");
      return;
    }

    if (formData.password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد.");
      return;
    }

    if (role === "doctor") {
      if (!formData.specialty) return setError("لطفا تخصص خود را انتخاب کنید.");
      if (!formData.province) return setError("لطفا استان محل فعالیت را انتخاب کنید.");
      if (!formData.city) return setError("لطفا شهر محل فعالیت را انتخاب کنید.");
      if (!formData.visitFee.trim()) return setError("لطفا هزینه ویزیت را مشخص کنید.");
      if (formData.workDays.length === 0) return setError("لطفا حداقل یک روز کاری را انتخاب کنید.");
    }

    setLoading(true);

    try {
      await requestOtp(cleanPhone);

      // اضافه شدن فیلد national_id به صورت مستقیم به بدنه اصلی درخواست برای هر دو گروه پزشک و بیمار
      const basePayload = {
        name: formData.name,
        phone: cleanPhone,
        national_id: cleanNationalId,
        password: formData.password,
        role: role,
        email: formData.email.trim() ? formData.email : null,
      };

      if (role === "doctor") {
        const extraDoctorData = {
          specialty: formData.specialty,
          national_id: cleanNationalId,
          province: formData.province,
          city: formData.city,
          visit_fee: Number(toEnglishDigits(formData.visitFee)),
          work_days: formData.workDays,
        };
        sessionStorage.setItem("pending_doctor_details", JSON.stringify(extraDoctorData));
      }

      sessionStorage.setItem("pending_register_payload", JSON.stringify(basePayload));
      navigate("/verify-otp", { state: { userData: basePayload } });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "خطا در برقراری ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 p-6 shadow-sm md:p-8">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-slate-800">ایجاد حساب کاربری</h1>
          <p className="text-sm text-slate-500 mt-2">به سامانه نوبت‌دهی آنلاین داک‌تایم خوش آمدید</p>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setRole("patient")}
            className={`py-3 text-center text-sm font-bold rounded-xl transition ${
              role === "patient" ? "bg-white text-sky-500 shadow-sm" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            من بیمار هستم
          </button>
          <button
            type="button"
            onClick={() => setRole("doctor")}
            className={`py-3 text-center text-sm font-bold rounded-xl transition ${
              role === "doctor" ? "bg-white text-sky-500 shadow-sm" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            من پزشک هستم
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">نام و نام خانوادگی</label>
            <div className="relative">
              <User className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="مثال: صادق بلوچ"
                className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-sky-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">شماره موبایل</label>
            <div className="relative">
              <Phone className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="۰۹۱۴۵۴۵۷۹۹۲"
                className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-sky-500 focus:bg-white transition text-left"
                dir="ltr"
              />
            </div>
          </div>

          {/* فیلد کد ملی: برای هر دو نقش پزشک و بیمار اجباری شد تا خطای اعتبارسنجی رخ ندهد */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">کد ملی</label>
            <div className="relative">
              <CreditCard className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                name="nationalId"
                maxLength={10}
                required
                value={formData.nationalId}
                onChange={handleChange}
                placeholder="مثال: ۳۶۱۰۲۳۴۵۶۷"
                className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-sky-500 focus:bg-white transition text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">ایمیل (اختیاری)</label>
            <div className="relative">
              <Mail className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="sadegh@example.com"
                className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-sky-500 focus:bg-white transition text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">رمز عبور</label>
            <div className="relative">
              <Lock className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="حداقل ۶ کاراکتر"
                className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-sky-500 focus:bg-white transition text-left"
                dir="ltr"
              />
            </div>
          </div>

          {role === "doctor" && (
            <div className="border-t border-slate-100 pt-6 mt-6 space-y-4">
              <h3 className="text-base font-extrabold text-slate-800 mb-4">اطلاعات تخصصی پزشک</h3>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">تخصص</label>
                <div className="relative">
                  <Activity className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400 z-10" />
                  <select
                    name="specialty"
                    required
                    value={formData.specialty}
                    onChange={handleChange}
                    className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-sky-500 focus:bg-white transition appearance-none"
                  >
                    <option value="">انتخاب تخصص</option>
                    {DOCTOR_SPECIALTIES.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">استان محل فعالیت</label>
                <div className="relative">
                  <MapPin className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400 z-10" />
                  <select
                    name="province"
                    required
                    value={formData.province}
                    onChange={handleChange}
                    className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-sky-500 focus:bg-white transition appearance-none"
                  >
                    <option value="">انتخاب استان</option>
                    {Object.keys(PROVINCES_AND_CITIES).map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">شهر محل فعالیت</label>
                <div className="relative">
                  <MapPin className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400 z-10" />
                  <select
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    disabled={!formData.province}
                    className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-sky-500 focus:bg-white transition disabled:opacity-50 appearance-none"
                  >
                    <option value="">انتخاب شهر</option>
                    {formData.province &&
                      PROVINCES_AND_CITIES[formData.province].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">هزینه ویزیت (تومان)</label>
                <div className="relative">
                  <DollarSign className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    name="visitFee"
                    required
                    value={formData.visitFee}
                    onChange={handleChange}
                    placeholder="مثال: ۱۲۰۰۰۰"
                    className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-sky-500 focus:bg-white transition text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">روزهای حضور در مطب</label>
                <div className="flex flex-wrap gap-2">
                  {WORK_DAYS.map((day) => {
                    const active = formData.workDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => handleDayToggle(day.id)}
                        className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition border ${
                          active
                            ? "bg-sky-50 border-sky-300 text-sky-600"
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-sky-500 text-white text-base font-extrabold rounded-2xl hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "در حال ارسال..." : "دریافت کد تایید"}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            قبلاً ثبت‌نام کرده‌اید؟{" "}
            <Link to="/login" className="font-bold text-sky-500 hover:text-sky-600 transition">
              ورود به سیستم
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
