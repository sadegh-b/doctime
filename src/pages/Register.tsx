// مسیر فایل: src/pages/Register.tsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Phone,
  Lock,
  Mail,
  Activity,
  Calendar,
  MapPin,
  DollarSign,
  CreditCard,
  Building2,
  Clock,
} from "lucide-react";
import { requestOtp, toEnglishDigits } from "../services/auth";
import { getSpecialties } from "../services/api";

// روزهای هفته دقیقاً با نام فارسی، همانطور که بک‌اند انتظار دارد
const WORK_DAYS = [
  { id: "شنبه", label: "شنبه" },
  { id: "یکشنبه", label: "یکشنبه" },
  { id: "دوشنبه", label: "دوشنبه" },
  { id: "سه شنبه", label: "سه شنبه" },
  { id: "چهارشنبه", label: "چهارشنبه" },
  { id: "پنج شنبه", label: "پنج شنبه" },
  { id: "جمعه", label: "جمعه" },
];

const WORK_SHIFTS = [
  { id: "morning", label: "صبح" },
  { id: "afternoon", label: "عصر" },
  { id: "both", label: "صبح و عصر" },
];

const PROVINCES_AND_CITIES: Record<string, string[]> = {
  "سیستان و بلوچستان": ["زاهدان", "چابهار", "ایرانشهر", "زابل", "سراوان", "خاش"],
  تهران: ["تهران", "شهریار", "اسلامشهر", "ری", "قدس", "ملارد"],
  "خراسان رضوی": ["مشهد", "نیشابور", "سبزوار", "تربت حیدریه", "قوچان"],
  اصفهان: ["اصفهان", "کاشان", "خمینی‌شهر", "نجف‌آباد", "شاهین‌شهر"],
  فارس: ["شیراز", "مرودشت", "جهرم", "فسا", "کازرون"],
  "آذربایجان شرقی": ["تبریز", "مراغه", "مرند", "میانه", "اهر"],
  خوزستان: ["اهواز", "دزفول", "آبادان", "خرمشهر", "ماهشهر"],
  مازندران: ["ساری", "بابل", "آمل", "قائم‌شهر", "بهشهر"],
};

interface Specialty {
  id: number;
  name: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [specialtiesLoading, setSpecialtiesLoading] = useState(false);
  const [specialtiesError, setSpecialtiesError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    email: "",

    nationalId: "",

    medicalCouncilNumber: "",

    specialtyId: "",

    province: "",
    city: "",
    address: "",

    visitFee: "",

    workShift: "morning",

    workDays: [] as string[],

    morningStart: "08:00",
    morningEnd: "12:00",

    afternoonStart: "14:00",
    afternoonEnd: "18:00",

    scheduleStartDate: new Date().toISOString().slice(0, 10),
  });

  // دریافت لیست تخصص‌ها از بک‌اند وقتی کاربر نقش پزشک را انتخاب می‌کند
  useEffect(() => {
    if (role !== "doctor" || specialties.length > 0) return;

    const fetchSpecialties = async () => {
      setSpecialtiesLoading(true);
      setSpecialtiesError(null);
      try {
        const data = await getSpecialties();

        // پشتیبانی از چند شکل احتمالی پاسخ سرور
        const list: Specialty[] = Array.isArray(data)
          ? data
          : data.items || data.specialties || [];

        setSpecialties(list);
      } catch (err) {
        console.error("خطا در دریافت تخصص‌ها:", err);
        setSpecialtiesError("دریافت لیست تخصص‌ها ناموفق بود.");
      } finally {
        setSpecialtiesLoading(false);
      }
    };

    fetchSpecialties();
  }, [role, specialties.length]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone" || name === "visitFee" || name === "nationalId") {
      const cleanVal = value.replace(/[^\d۰-۹]/g, "");
      setFormData((prev) => ({ ...prev, [name]: cleanVal }));
    } else if (name === "province") {
      setFormData((prev) => ({ ...prev, province: value, city: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDayToggle = (dayId: string) => {
    setFormData((prev) => {
      const isSelected = prev.workDays.includes(dayId);
      const updatedDays = isSelected
        ? prev.workDays.filter((d) => d !== dayId)
        : [...prev.workDays, dayId];
      return { ...prev, workDays: updatedDays };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = toEnglishDigits(formData.phone);

    if (!/^09\d{9}$/.test(cleanPhone)) {
      setError("شماره موبایل باید ۱۱ رقم باشد.");
      return;
    }

    const cleanNationalId = toEnglishDigits(formData.nationalId);

    // کد ملی فقط برای پزشک الزامی است؛ بک‌اند برای بیمار آن را Optional می‌پذیرد
    if (role === "doctor") {
      if (cleanNationalId.length !== 10) {
        setError("کد ملی پزشک الزامی است و باید ۱۰ رقم باشد.");
        return;
      }
    } else if (cleanNationalId && cleanNationalId.length !== 10) {
      // اگر بیمار کد ملی وارد کرده، حداقل باید فرمتش درست باشد
      setError("کد ملی وارد شده معتبر نیست.");
      return;
    }

    if (!formData.name.trim()) {
      setError("نام الزامی است.");
      return;
    }

    if (formData.password.length < 6) {
      setError("رمز عبور حداقل ۶ کاراکتر باشد.");
      return;
    }

    if (role === "doctor") {
      if (!formData.medicalCouncilNumber.trim())
        return setError("شماره نظام پزشکی الزامی است.");
      if (!formData.specialtyId) return setError("انتخاب تخصص الزامی است.");
      if (!formData.province) return setError("انتخاب استان الزامی است.");
      if (!formData.city) return setError("انتخاب شهر الزامی است.");
      if (!formData.address.trim()) return setError("آدرس مطب الزامی است.");
      if (!formData.visitFee) return setError("هزینه ویزیت را وارد کنید.");
      if (formData.workDays.length === 0)
        return setError("حداقل یک روز کاری انتخاب کنید.");
      if (!formData.scheduleStartDate)
        return setError("تاریخ شروع برنامه را انتخاب کنید.");
    }

    setLoading(true);

    try {
      // ارسال OTP
      await requestOtp(cleanPhone);

      const registerPayload = {
        name: formData.name.trim(),
        phone: cleanPhone,
        password: formData.password,
        national_id: cleanNationalId,
        email: formData.email.trim() || null,
        role,
      };

      // اطلاعات اصلی کاربر
      sessionStorage.setItem(
        "pending_register_payload",
        JSON.stringify(registerPayload)
      );

      // اطلاعات تکمیلی پزشک - مطابق ساختار مورد انتظار بک‌اند
      if (role === "doctor") {
        const doctorPayload = {
          medical_council_number: formData.medicalCouncilNumber.trim(),

          specialty_id: Number(formData.specialtyId),

          province: formData.province,

          city: formData.city,

          address: formData.address.trim(),

          consultation_fee: Number(toEnglishDigits(formData.visitFee)),

          work_shift: formData.workShift,

          work_days: formData.workDays,

          morning_start: formData.morningStart,

          morning_end: formData.morningEnd,

          afternoon_start: formData.afternoonStart,

          afternoon_end: formData.afternoonEnd,

          schedule_start_date: formData.scheduleStartDate,
        };

        sessionStorage.setItem(
          "pending_doctor_details",
          JSON.stringify(doctorPayload)
        );
      }

      navigate("/verify-otp", {
        state: {
          userData: registerPayload,
        },
      });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "خطا در ارسال کد تایید");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 p-6 shadow-sm md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-slate-800">
            ایجاد حساب کاربری
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            به سامانه نوبت‌دهی آنلاین داک‌تایم خوش آمدید
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setRole("patient")}
            className={`py-3 text-center text-sm font-bold rounded-xl transition ${
              role === "patient"
                ? "bg-white text-sky-500 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            من بیمار هستم
          </button>
          <button
            type="button"
            onClick={() => setRole("doctor")}
            className={`py-3 text-center text-sm font-bold rounded-xl transition ${
              role === "doctor"
                ? "bg-white text-sky-500 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
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
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              نام و نام خانوادگی
            </label>
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
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              شماره موبایل
            </label>
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

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              کد ملی {role === "patient" && "(اختیاری)"}
            </label>
            <div className="relative">
              <CreditCard className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                name="nationalId"
                maxLength={10}
                required={role === "doctor"}
                value={formData.nationalId}
                onChange={handleChange}
                placeholder="مثال: ۳۶۱۰۲۳۴۵۶۷"
                className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-sky-500 focus:bg-white transition text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              ایمیل (اختیاری)
            </label>
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
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              رمز عبور
            </label>
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
              <h3 className="text-base font-extrabold text-slate-800 mb-4">
                اطلاعات تخصصی پزشک
              </h3>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  شماره نظام پزشکی
                </label>
                <div className="relative">
                  <CreditCard className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    name="medicalCouncilNumber"
                    required
                    value={formData.medicalCouncilNumber}
                    onChange={handleChange}
                    placeholder="مثال: ۱۲۳۴۵۶"
                    className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-sky-500 focus:bg-white transition text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  تخصص
                </label>
                <div className="relative">
                  <Activity className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400 z-10" />
                  <select
                    name="specialtyId"
                    required
                    value={formData.specialtyId}
                    onChange={handleChange}
                    disabled={specialtiesLoading}
                    className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-sky-500 focus:bg-white transition appearance-none disabled:opacity-50"
                  >
                    <option value="">
                      {specialtiesLoading ? "در حال بارگذاری..." : "انتخاب تخصص"}
                    </option>
                    {specialties.map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                </div>
                {specialtiesError && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-500">
                    {specialtiesError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  استان محل فعالیت
                </label>
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
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  شهر محل فعالیت
                </label>
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
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  آدرس مطب
                </label>
                <div className="relative">
                  <Building2 className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="مثال: خیابان ولیعصر، پلاک ۱۲"
                    className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-sky-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  هزینه ویزیت (تومان)
                </label>
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
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  شیفت کاری
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {WORK_SHIFTS.map((shift) => {
                    const active = formData.workShift === shift.id;
                    return (
                      <button
                        key={shift.id}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, workShift: shift.id }))
                        }
                        className={`py-2.5 rounded-xl text-xs font-bold transition border ${
                          active
                            ? "bg-sky-50 border-sky-300 text-sky-600"
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {shift.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {(formData.workShift === "morning" ||
                formData.workShift === "both") && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    ساعات کاری صبح
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Clock className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="time"
                        name="morningStart"
                        value={formData.morningStart}
                        onChange={handleChange}
                        className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-sky-500 focus:bg-white transition"
                        dir="ltr"
                      />
                    </div>
                    <div className="relative">
                      <Clock className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="time"
                        name="morningEnd"
                        value={formData.morningEnd}
                        onChange={handleChange}
                        className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-sky-500 focus:bg-white transition"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(formData.workShift === "afternoon" ||
                formData.workShift === "both") && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    ساعات کاری عصر
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Clock className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="time"
                        name="afternoonStart"
                        value={formData.afternoonStart}
                        onChange={handleChange}
                        className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-sky-500 focus:bg-white transition"
                        dir="ltr"
                      />
                    </div>
                    <div className="relative">
                      <Clock className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="time"
                        name="afternoonEnd"
                        value={formData.afternoonEnd}
                        onChange={handleChange}
                        className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-sky-500 focus:bg-white transition"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  روزهای حضور در مطب
                </label>
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

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  تاریخ شروع برنامه
                </label>
                <div className="relative">
                  <Calendar className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="date"
                    name="scheduleStartDate"
                    required
                    value={formData.scheduleStartDate}
                    onChange={handleChange}
                    className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-sky-500 focus:bg-white transition"
                    dir="ltr"
                  />
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
            <Link
              to="/login"
              className="font-bold text-sky-500 hover:text-sky-600 transition"
            >
              ورود به سیستم
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
