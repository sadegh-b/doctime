// مسیر فایل: src/pages/Register.tsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Phone,
  Lock,
  Mail,
  CreditCard,
  Building2,
  Clock,
  DollarSign,
  FileText,
} from "lucide-react";
import { requestOtp, toEnglishDigits } from "../services/auth";
import { getSpecialties } from "../services/api";

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
  "تهران": ["تهران", "شهریار", "اسلامشهر", "ری", "قدس", "ملارد"],
  "خراسان رضوی": ["مشهد", "نیشابور", "سبزوار", "تربت حیدریه", "قوچان"],
  "اصفهان": ["اصفهان", "کاشان", "خمینی‌شهر", "نجف‌آباد", "شاهین‌شهر"],
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

  useEffect(() => {
    if (role === "doctor" && specialties.length === 0) {
      setSpecialtiesLoading(true);
      getSpecialties()
        .then((data) => {
          setSpecialties(Array.isArray(data) ? data : []);
          setSpecialtiesLoading(false);
        })
        .catch(() => setSpecialtiesLoading(false));
    }
  }, [role, specialties.length]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (dayId: string) => {
    setFormData((prev) => ({
      ...prev,
      workDays: prev.workDays.includes(dayId)
        ? prev.workDays.filter((d) => d !== dayId)
        : [...prev.workDays, dayId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = toEnglishDigits(formData.phone).trim();
    if (cleanPhone.length !== 11 || !cleanPhone.startsWith("09")) {
      setError("لطفاً شماره موبایل ۱۱ رقمی معتبر وارد کنید (مثال: 09123456789).");
      return;
    }

    if (role === "doctor") {
      if (!formData.specialtyId) {
        setError("انتخاب تخصص پزشکی الزامی است.");
        return;
      }
      if (formData.workDays.length === 0) {
        setError("لطفاً حداقل یک روز کاری را انتخاب کنید.");
        return;
      }
    }

    setLoading(true);

    try {
      await requestOtp(cleanPhone);

      // نگاشت داده‌های فرانت به ساختار مورد انتظار بک‌اند (snake_case)
      const formattedPayload = {
        name: formData.name.trim(),
        phone: cleanPhone,
        password: formData.password,
        role,
        email: formData.email.trim() || null,
        national_id: formData.nationalId.trim() || undefined,
        ...(role === "doctor" && {
          medical_council_number: formData.medicalCouncilNumber.trim(),
          specialty_id: formData.specialtyId ? Number(formData.specialtyId) : undefined,
          province: formData.province,
          city: formData.city,
          address: formData.address.trim(),
          consultation_fee: formData.visitFee ? Number(formData.visitFee) : 0,
          work_shift: formData.workShift,
          work_days: formData.workDays,
          morning_start: formData.workShift === "morning" || formData.workShift === "both" ? formData.morningStart : undefined,
          morning_end: formData.workShift === "morning" || formData.workShift === "both" ? formData.morningEnd : undefined,
          afternoon_start: formData.workShift === "afternoon" || formData.workShift === "both" ? formData.afternoonStart : undefined,
          afternoon_end: formData.workShift === "afternoon" || formData.workShift === "both" ? formData.afternoonEnd : undefined,
          schedule_start_date: formData.scheduleStartDate,
        }),
      };

      sessionStorage.setItem("pending_register_payload", JSON.stringify(formattedPayload));
      navigate("/verify-otp", { state: { phone: cleanPhone } });
    } catch (err: any) {
      setError(err.message || "خطا در برقراری ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-800 text-center mb-8">ایجاد حساب داک‌تایم</h1>

        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setRole("patient")}
            className={`py-3 rounded-xl font-bold transition ${
              role === "patient" ? "bg-white text-sky-500 shadow-sm" : "text-slate-500"
            }`}
          >
            بیمار هستم
          </button>
          <button
            type="button"
            onClick={() => setRole("doctor")}
            className={`py-3 rounded-xl font-bold transition ${
              role === "doctor" ? "bg-white text-sky-500 shadow-sm" : "text-slate-500"
            }`}
          >
            پزشک هستم
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />
            <input
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="نام و نام خانوادگی"
              className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-sky-500"
            />
          </div>

          <div className="relative">
            <Phone className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />
            <input
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="شماره موبایل (مثال: 09123456789)"
              className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-left"
              dir="ltr"
            />
          </div>

          <div className="relative">
            <Lock className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="رمز عبور (حداقل ۶ کاراکتر)"
              className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-left"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <FileText className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                name="nationalId"
                value={formData.nationalId}
                onChange={handleChange}
                placeholder="کد ملی (اختیاری)"
                className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-left"
                dir="ltr"
              />
            </div>
            <div className="relative">
              <Mail className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ایمیل (اختیاری)"
                className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-left"
                dir="ltr"
              />
            </div>
          </div>

          {role === "doctor" && (
            <div className="pt-4 space-y-4 border-t border-slate-100">
              <p className="font-bold text-slate-700 text-sm">اطلاعات تخصصی و مطب پزشک</p>

              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <CreditCard className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    name="medicalCouncilNumber"
                    required
                    value={formData.medicalCouncilNumber}
                    onChange={handleChange}
                    placeholder="شماره نظام پزشکی"
                    className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                  />
                </div>

                <div className="relative">
                  <DollarSign className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="number"
                    name="visitFee"
                    required
                    value={formData.visitFee}
                    onChange={handleChange}
                    placeholder="مبلغ ویزیت (تومان)"
                    className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <select
                name="specialtyId"
                required
                value={formData.specialtyId}
                onChange={handleChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
              >
                <option value="">{specialtiesLoading ? "در حال دریافت تخصص‌ها..." : "انتخاب تخصص پزشکی"}</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2">
                <select
                  name="province"
                  required
                  value={formData.province}
                  onChange={handleChange}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                >
                  <option value="">استان</option>
                  {Object.keys(PROVINCES_AND_CITIES).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <select
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                >
                  <option value="">شهر</option>
                  {formData.province &&
                    PROVINCES_AND_CITIES[formData.province]?.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>

              <div className="relative">
                <Building2 className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="آدرس دقیق مطب"
                  className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block">شیفت کاری</label>
                <select
                  name="workShift"
                  value={formData.workShift}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none mb-3"
                >
                  {WORK_SHIFTS.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block">روزهای حضور در مطب</label>
                <div className="flex flex-wrap gap-2">
                  {WORK_DAYS.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleDayToggle(day.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                        formData.workDays.includes(day.id)
                          ? "bg-sky-50 border-sky-300 text-sky-600"
                          : "bg-slate-50 border-slate-200 text-slate-500"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-sky-500 text-white font-extrabold rounded-2xl hover:bg-sky-600 transition disabled:opacity-50 mt-6"
          >
            {loading ? "در حال ارسال کد..." : "دریافت کد تایید"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link to="/login" className="font-bold text-sky-500">
            ورود
          </Link>
        </p>
      </div>
    </div>
  );
}
