// src/pages/Register.tsx

import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  register,
  type RegisterPayload,
  type UserRole,
} from "../services/auth";
import { useAuth } from "../context/AuthContext";

/**
 * تبدیل اعداد فارسی و عربی به اعداد انگلیسی انگلیسی
 */
function normalizeDigits(value: string): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

  return value
    .replace(/[۰-۹]/g, (digit) =>
      String(persianDigits.indexOf(digit)),
    )
    .replace(/[٠-٩]/g, (digit) =>
      String(arabicDigits.indexOf(digit)),
    );
}

/**
 * استخراج پیام‌های خطای سرور
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const errorRecord = error as {
      response?: {
        data?: {
          detail?: unknown;
          message?: unknown;
        };
      };
    };

    const detail = errorRecord.response?.data?.detail;
    const message = errorRecord.response?.data?.message;

    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }

    if (typeof message === "string" && message.trim()) {
      return message;
    }

    if (Array.isArray(detail)) {
      const validationMessages = detail
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          if (
            typeof item === "object" &&
            item !== null &&
            "msg" in item &&
            typeof item.msg === "string"
          ) {
            return item.msg;
          }

          return "";
        })
        .filter(Boolean);

      if (validationMessages.length > 0) {
        return validationMessages.join("، ");
      }
    }
  }

  return "ثبت‌نام ناموفق بود. لطفاً دوباره تلاش کنید.";
}

export default function Register() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  // فیلدهای عمومی بیمار و پزشک
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("patient");

  // فیلدهای اختصاصی پزشک
  const [medicalCouncilNumber, setMedicalCouncilNumber] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [workShift, setWorkShift] = useState<"morning" | "afternoon" | "both">("morning");

  // روزهای کاری به صورت آرایه
  const [workDays, setWorkDays] = useState<string[]>([]);

  // ساعت‌های شیفت کاری
  const [morningStart, setMorningStart] = useState("09:00");
  const [morningEnd, setMorningEnd] = useState("13:00");
  const [afternoonStart, setAfternoonStart] = useState("16:00");
  const [afternoonEnd, setAfternoonEnd] = useState("20:00");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const weekdays = [
    "شنبه",
    "یکشنبه",
    "دوشنبه",
    "سه شنبه",
    "چهارشنبه",
    "پنج شنبه",
    "جمعه",
  ];

  const handleDayCheckboxChange = (day: string) => {
    if (workDays.includes(day)) {
      setWorkDays(workDays.filter((d) => d !== day));
    } else {
      setWorkDays([...workDays, day]);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;
    setError("");

    const normalizedName = name.trim();
    const normalizedPhone = normalizeDigits(phone).replace(/\s+/g, "").trim();
    const normalizedNationalId = normalizeDigits(nationalId).replace(/\s+/g, "").trim();

    try {
      // اعتبارسنجی‌های کلاینت
      if (normalizedName.length < 2) {
        throw new Error("نام و نام خانوادگی باید حداقل ۲ نویسه داشته باشد.");
      }
      if (!/^09\d{9}$/.test(normalizedPhone)) {
        throw new Error("شماره موبایل باید ۱۱ رقم و با 09 شروع شود.");
      }
      if (!/^\d{10}$/.test(normalizedNationalId)) {
        throw new Error("کد ملی باید دقیقاً ۱۰ رقم باشد.");
      }
      if (password.length < 6) {
        throw new Error("رمز عبور باید حداقل ۶ نویسه داشته باشد.");
      }
      if (password !== confirmPassword) {
        throw new Error("رمز عبور و تکرار آن یکسان نیستند.");
      }

      const payload: RegisterPayload = {
        name: normalizedName,
        phone: normalizedPhone,
        national_id: normalizedNationalId,
        password,
        role,
      };

      if (email.trim()) {
        payload.email = email.trim();
      }

      if (role === "doctor") {
        const normalizedMcn = normalizeDigits(medicalCouncilNumber).trim();
        if (!normalizedMcn) {
          throw new Error("وارد کردن کد نظام پزشکی الزامی است.");
        }
        if (!specialty.trim()) {
          throw new Error("وارد کردن تخصص الزامی است.");
        }
        if (!province.trim()) {
          throw new Error("وارد کردن استان الزامی است.");
        }
        if (!city.trim()) {
          throw new Error("وارد کردن شهر الزامی است.");
        }
        if (!address.trim()) {
          throw new Error("وارد کردن آدرس مطب الزامی است.");
        }
        if (workDays.length === 0) {
          throw new Error("حداقل یک روز کاری باید انتخاب شود.");
        }

        const expInt = experienceYears.trim() ? parseInt(normalizeDigits(experienceYears), 10) : 0;
        const feeInt = consultationFee.trim() ? parseInt(normalizeDigits(consultationFee).replace(/,/g, ""), 10) : 0;

        if (isNaN(expInt) || expInt < 0 || expInt > 80) {
          throw new Error("سال‌های تجربه باید عددی بین ۰ تا ۸۰ باشد.");
        }
        if (isNaN(feeInt) || feeInt < 0) {
          throw new Error("هزینه مشاوره معتبر نیست.");
        }

        payload.medical_council_number = normalizedMcn;
        payload.specialty = specialty.trim();
        payload.province = province.trim();
        payload.city = city.trim();
        payload.address = address.trim();
        payload.bio = bio.trim() || null;
        payload.experience_years = expInt;
        payload.consultation_fee = feeInt;
        payload.work_shift = workShift;
        payload.work_days = workDays;
        payload.schedule_start_date = new Date().toISOString().split("T")[0]; // فرمت YYYY-MM-DD

        if (workShift === "morning" || workShift === "both") {
          payload.morning_start = morningStart;
          payload.morning_end = morningEnd;
        }
        if (workShift === "afternoon" || workShift === "both") {
          payload.afternoon_start = afternoonStart;
          payload.afternoon_end = afternoonEnd;
        }
      }

      setLoading(true);
      await register(payload);
      await refreshUser();
      navigate("/", { replace: true });
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">ثبت‌نام در سیستم نوبت‌دهی</h1>

        {error && (
          <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2" noValidate>
          <div className="md:col-span-2">
            <label htmlFor="register-name" className="mb-2 block text-sm font-medium text-gray-700">
              نام و نام خانوادگی
            </label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
              required
            />
          </div>

          <div>
            <label htmlFor="register-phone" className="mb-2 block text-sm font-medium text-gray-700">
              شماره موبایل
            </label>
            <input
              id="register-phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={11}
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500 disabled:bg-gray-100"
              placeholder="09123456789"
              dir="ltr"
              required
            />
          </div>

          <div>
            <label htmlFor="register-national-id" className="mb-2 block text-sm font-medium text-gray-700">
              کد ملی
            </label>
            <input
              id="register-national-id"
              type="text"
              inputMode="numeric"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              maxLength={10}
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500 disabled:bg-gray-100"
              placeholder="۱۰ رقم"
              dir="ltr"
              required
            />
          </div>

          <div>
            <label htmlFor="register-password" className="mb-2 block text-sm font-medium text-gray-700">
              رمز عبور
            </label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500 disabled:bg-gray-100"
              dir="ltr"
              required
            />
          </div>

          <div>
            <label htmlFor="register-confirm-password" className="mb-2 block text-sm font-medium text-gray-700">
              تکرار رمز عبور
            </label>
            <input
              id="register-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500 disabled:bg-gray-100"
              dir="ltr"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="register-email" className="mb-2 block text-sm font-medium text-gray-700">
              ایمیل (اختیاری)
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500 disabled:bg-gray-100"
              placeholder="example@email.com"
              dir="ltr"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="register-role" className="mb-2 block text-sm font-medium text-gray-700">
              نقش کاربر
            </label>
            <select
              id="register-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="patient">بیمار</option>
              <option value="doctor">پزشک</option>
            </select>
          </div>

          {role === "doctor" && (
            <div className="md:col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2 border-t pt-4 mt-2">
              <h3 className="md:col-span-2 text-lg font-bold text-gray-800">اطلاعات مطب و برنامه‌کاری پزشک</h3>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">کد نظام پزشکی</label>
                <input
                  type="text"
                  value={medicalCouncilNumber}
                  onChange={(e) => setMedicalCouncilNumber(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">تخصص</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">استان</label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">شهر</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">آدرس دقیق مطب</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">معرفی کوتاه / بیوگرافی</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={loading}
                  className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">سال‌های تجربه</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500"
                  placeholder="0"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">هزینه ویزیت (ریال)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500"
                  placeholder="0"
                  dir="ltr"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">شیفت کاری</label>
                <select
                  value={workShift}
                  onChange={(e) => setWorkShift(e.target.value as "morning" | "afternoon" | "both")}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="morning">شیفت صبح</option>
                  <option value="afternoon">شیفت عصر</option>
                  <option value="both">هر دو شیفت</option>
                </select>
              </div>

              {/* فیلد انتخاب روزهای کاری */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">روزهای کاری پزشک</label>
                <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  {weekdays.map((day) => (
                    <label key={day} className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                      <input
                        type="checkbox"
                        checked={workDays.includes(day)}
                        onChange={() => handleDayCheckboxChange(day)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-800">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* تنظیم زمان‌های شیفت‌ها */}
              {(workShift === "morning" || workShift === "both") && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">شروع شیفت صبح</label>
                    <input
                      type="time"
                      value={morningStart}
                      onChange={(e) => setMorningStart(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">پایان شیفت صبح</label>
                    <input
                      type="time"
                      value={morningEnd}
                      onChange={(e) => setMorningEnd(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              {(workShift === "afternoon" || workShift === "both") && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">شروع شیفت عصر</label>
                    <input
                      type="time"
                      value={afternoonStart}
                      onChange={(e) => setAfternoonStart(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">پایان شیفت عصر</label>
                    <input
                      type="time"
                      value={afternoonEnd}
                      onChange={(e) => setAfternoonEnd(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
