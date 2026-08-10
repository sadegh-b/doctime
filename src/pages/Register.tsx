import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  CreditCard,
  DollarSign,
  FileText,
  Lock,
  Mail,
  Phone,
  User,
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
  "سیستان و بلوچستان": [
    "زاهدان",
    "چابهار",
    "ایرانشهر",
    "زابل",
    "سراوان",
    "خاش",
  ],
  تهران: ["تهران", "شهریار", "اسلامشهر", "ری", "قدس", "ملارد"],
  "خراسان رضوی": ["مشهد", "نیشابور", "سبزوار", "تربت حیدریه", "قوچان"],
  اصفهان: ["اصفهان", "کاشان", "خمینی‌شهر", "نجف‌آباد", "شاهین‌شهر"],
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
    if (role !== "doctor" || specialties.length > 0) {
      return;
    }

    setSpecialtiesLoading(true);

    getSpecialties()
      .then((data) => {
        setSpecialties(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setError("دریافت فهرست تخصص‌ها از سرور انجام نشد.");
      })
      .finally(() => {
        setSpecialtiesLoading(false);
      });
  }, [role, specialties.length]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
      ...(name === "province" ? { city: "" } : {}),
    }));
  };

  const handleDayToggle = (dayId: string) => {
    setFormData((previousData) => ({
      ...previousData,
      workDays: previousData.workDays.includes(dayId)
        ? previousData.workDays.filter((day) => day !== dayId)
        : [...previousData.workDays, dayId],
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const cleanName = formData.name.trim();
    const cleanPhone = toEnglishDigits(formData.phone).replace(/\s+/g, "");
    const cleanNationalId = toEnglishDigits(formData.nationalId).replace(
      /\s+/g,
      ""
    );
    const cleanMedicalCouncilNumber = toEnglishDigits(
      formData.medicalCouncilNumber
    ).replace(/\s+/g, "");

    if (!cleanName) {
      setError("نام و نام خانوادگی الزامی است.");
      return;
    }

    if (!/^09\d{9}$/.test(cleanPhone)) {
      setError("لطفاً شماره موبایل ۱۱ رقمی معتبر وارد کنید؛ مثال: 09123456789");
      return;
    }

    if (formData.password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر داشته باشد.");
      return;
    }

    if (role === "doctor") {
      if (!/^\d{10}$/.test(cleanNationalId)) {
        setError("کد ملی پزشک باید دقیقاً ۱۰ رقم باشد.");
        return;
      }

      if (!cleanMedicalCouncilNumber) {
        setError("شماره نظام پزشکی الزامی است.");
        return;
      }

      if (!formData.specialtyId) {
        setError("انتخاب تخصص پزشکی الزامی است.");
        return;
      }

      if (!formData.province) {
        setError("انتخاب استان الزامی است.");
        return;
      }

      if (!formData.city) {
        setError("انتخاب شهر الزامی است.");
        return;
      }

      if (!formData.address.trim()) {
        setError("آدرس دقیق مطب الزامی است.");
        return;
      }

      if (!formData.visitFee || Number(formData.visitFee) <= 0) {
        setError("مبلغ ویزیت باید بیشتر از صفر باشد.");
        return;
      }

      if (formData.workDays.length === 0) {
        setError("لطفاً حداقل یک روز کاری را انتخاب کنید.");
        return;
      }
    }

    const formattedPayload = {
      name: cleanName,
      phone: cleanPhone,
      password: formData.password,
      role,
      email: formData.email.trim() || null,
      national_id: cleanNationalId || undefined,

      ...(role === "doctor"
        ? {
            medical_council_number: cleanMedicalCouncilNumber,
            specialty_id: Number(formData.specialtyId),
            province: formData.province,
            city: formData.city,
            address: formData.address.trim(),
            consultation_fee: Number(formData.visitFee),
            work_shift: formData.workShift,
            work_days: formData.workDays,
            morning_start:
              formData.workShift === "morning" ||
              formData.workShift === "both"
                ? formData.morningStart
                : undefined,
            morning_end:
              formData.workShift === "morning" ||
              formData.workShift === "both"
                ? formData.morningEnd
                : undefined,
            afternoon_start:
              formData.workShift === "afternoon" ||
              formData.workShift === "both"
                ? formData.afternoonStart
                : undefined,
            afternoon_end:
              formData.workShift === "afternoon" ||
              formData.workShift === "both"
                ? formData.afternoonEnd
                : undefined,
            schedule_start_date: formData.scheduleStartDate,
          }
        : {}),
    };

    setLoading(true);

    try {
      await requestOtp(cleanPhone);

      /*
        منبع واحد اطلاعات ثبت‌نام تا مرحله تأیید OTP.
        VerifyOtp.tsx نیز همین کلید را می‌خواند.
      */
      sessionStorage.setItem(
        "pending_register_payload",
        JSON.stringify(formattedPayload)
      );

      sessionStorage.removeItem("pending_doctor_details");

      navigate("/verify-otp", {
        state: {
          phone: cleanPhone,
        },
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "خطا در برقراری ارتباط با سرور."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-slate-50 p-4 py-10"
    >
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-8 text-center text-2xl font-extrabold text-slate-800">
          ایجاد حساب داک‌تایم
        </h1>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setRole("patient")}
            className={`rounded-xl py-3 font-bold transition ${
              role === "patient"
                ? "bg-white text-sky-500 shadow-sm"
                : "text-slate-500"
            }`}
          >
            بیمار هستم
          </button>

          <button
            type="button"
            onClick={() => setRole("doctor")}
            className={`rounded-xl py-3 font-bold transition ${
              role === "doctor"
                ? "bg-white text-sky-500 shadow-sm"
                : "text-slate-500"
            }`}
          >
            پزشک هستم
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />

            <input
              name="name"
              required
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="نام و نام خانوادگی"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-11 outline-none focus:border-sky-500"
            />
          </div>

          <div className="relative">
            <Phone className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />

            <input
              name="phone"
              required
              inputMode="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="شماره موبایل؛ مثال: 09123456789"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-11 text-left outline-none focus:border-sky-500"
              dir="ltr"
            />
          </div>

          <div className="relative">
            <Lock className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />

            <input
              type="password"
              name="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="رمز عبور؛ حداقل ۶ کاراکتر"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-11 text-left outline-none focus:border-sky-500"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <FileText className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />

              <input
                name="nationalId"
                required={role === "doctor"}
                inputMode="numeric"
                autoComplete="off"
                value={formData.nationalId}
                onChange={handleChange}
                placeholder={
                  role === "doctor"
                    ? "کد ملی پزشک *"
                    : "کد ملی (اختیاری)"
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-11 text-left outline-none focus:border-sky-500"
                dir="ltr"
              />
            </div>

            <div className="relative">
              <Mail className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />

              <input
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ایمیل (اختیاری)"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-11 text-left outline-none focus:border-sky-500"
                dir="ltr"
              />
            </div>
          </div>

          {role === "doctor" && (
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <p className="text-sm font-bold text-slate-700">
                اطلاعات تخصصی و مطب پزشک
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <CreditCard className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />

                  <input
                    name="medicalCouncilNumber"
                    required
                    inputMode="numeric"
                    autoComplete="off"
                    value={formData.medicalCouncilNumber}
                    onChange={handleChange}
                    placeholder="شماره نظام پزشکی *"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-11 outline-none focus:border-sky-500"
                  />
                </div>

                <div className="relative">
                  <DollarSign className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />

                  <input
                    type="number"
                    name="visitFee"
                    required
                    min="1"
                    inputMode="numeric"
                    value={formData.visitFee}
                    onChange={handleChange}
                    placeholder="مبلغ ویزیت (تومان)"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-11 text-left outline-none focus:border-sky-500"
                    dir="ltr"
                  />
                </div>
              </div>

              <select
                name="specialtyId"
                required
                value={formData.specialtyId}
                onChange={handleChange}
                disabled={specialtiesLoading}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-sky-500 disabled:opacity-60"
              >
                <option value="">
                  {specialtiesLoading
                    ? "در حال دریافت تخصص‌ها..."
                    : "انتخاب تخصص پزشکی"}
                </option>

                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2">
                <select
                  name="province"
                  required
                  value={formData.province}
                  onChange={handleChange}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-sky-500"
                >
                  <option value="">استان</option>

                  {Object.keys(PROVINCES_AND_CITIES).map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>

                <select
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!formData.province}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-sky-500 disabled:opacity-60"
                >
                  <option value="">شهر</option>

                  {formData.province &&
                    PROVINCES_AND_CITIES[formData.province]?.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                </select>
              </div>

              <div className="relative">
                <Building2 className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />

                <input
                  name="address"
                  required
                  autoComplete="street-address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="آدرس دقیق مطب"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-11 outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-500">
                  شیفت کاری
                </label>

                <select
                  name="workShift"
                  value={formData.workShift}
                  onChange={handleChange}
                  className="mb-3 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-sky-500"
                >
                  {WORK_SHIFTS.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-500">
                  روزهای حضور در مطب
                </label>

                <div className="flex flex-wrap gap-2">
                  {WORK_DAYS.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleDayToggle(day.id)}
                      className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                        formData.workDays.includes(day.id)
                          ? "border-sky-300 bg-sky-50 text-sky-600"
                          : "border-slate-200 bg-slate-50 text-slate-500"
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
            className="mt-6 w-full rounded-2xl bg-sky-500 py-4 font-extrabold text-white transition hover:bg-sky-600 disabled:opacity-50"
          >
            {loading ? "در حال ارسال کد..." : "دریافت کد تأیید"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link to="/login" className="font-bold text-sky-500">
            ورود
          </Link>
        </p>
      </div>
    </div>
  );
}
