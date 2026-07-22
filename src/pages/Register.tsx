import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAccessToken,
  register,
  type RegisterPayload,
  type UserRole,
} from "../services/auth";
import { useAuth } from "../context/AuthContext";

function normalizeDigits(value: string): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

  return value
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)));
}

function getErrorMessage(error: unknown): string {
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

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "ثبت‌نام ناموفق بود. لطفاً دوباره تلاش کنید.";
}

export default function Register() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("patient");

  const [medicalCouncilNumber, setMedicalCouncilNumber] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [workShift, setWorkShift] = useState<"morning" | "afternoon" | "both">(
    "morning",
  );

  const [workDays, setWorkDays] = useState<string[]>([]);
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
    setWorkDays((prevDays) =>
      prevDays.includes(day)
        ? prevDays.filter((item) => item !== day)
        : [...prevDays, day],
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;

    setError("");

    const normalizedName = name.trim();
    const normalizedPhone = normalizeDigits(phone).replace(/\s+/g, "").trim();
    const normalizedNationalId = normalizeDigits(nationalId)
      .replace(/\s+/g, "")
      .trim();

    try {
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
        const normalizedMcn = normalizeDigits(medicalCouncilNumber)
          .replace(/\s+/g, "")
          .trim();

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

        const expInt = experienceYears.trim()
          ? parseInt(normalizeDigits(experienceYears).replace(/\s+/g, ""), 10)
          : 0;

        const feeInt = consultationFee.trim()
          ? parseInt(
              normalizeDigits(consultationFee)
                .replace(/[,\s]/g, "")
                .trim(),
              10,
            )
          : 0;

        if (Number.isNaN(expInt) || expInt < 0 || expInt > 80) {
          throw new Error("سال‌های تجربه باید عددی بین ۰ تا ۸۰ باشد.");
        }

        if (Number.isNaN(feeInt) || feeInt < 0) {
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
        payload.schedule_start_date = new Date().toISOString().split("T")[0];

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

      if (getAccessToken()) {
        await refreshUser();

        navigate(
          role === "doctor" ? "/doctor-dashboard" : "/patient-profile",
          { replace: true },
        );
      } else {
        navigate(role === "doctor" ? "/doctor-login" : "/login", {
          replace: true,
          state: {
            message: "ثبت‌نام با موفقیت انجام شد. اکنون وارد حساب خود شوید.",
          },
        });
      }
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          ثبت‌نام در سیستم نوبت‌دهی
        </h1>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          noValidate={false}
        >
          <div className="md:col-span-2">
            <label
              htmlFor="register-name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              نام و نام خانوادگی
            </label>
            <input
              id="register-name"
              type="text"
              name="username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label
              htmlFor="register-phone"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              شماره موبایل
            </label>
            <input
              id="register-phone"
              type="tel"
              name="phone"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={11}
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500 disabled:bg-gray-100"
              placeholder="09123456789"
              dir="ltr"
              autoComplete="tel"
              required
            />
          </div>

          <div>
            <label
              htmlFor="register-national-id"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              کد ملی
            </label>
            <input
              id="register-national-id"
              type="text"
              name="national_id"
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
            <label
              htmlFor="register-password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              رمز عبور
            </label>
            <input
              id="register-password"
              type="password"
              name="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500 disabled:bg-gray-100"
              dir="ltr"
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label
              htmlFor="register-confirm-password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              تکرار رمز عبور
            </label>
            <input
              id="register-confirm-password"
              type="password"
              name="confirm-new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500 disabled:bg-gray-100"
              dir="ltr"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="register-email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              ایمیل (اختیاری)
            </label>
            <input
              id="register-email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500 disabled:bg-gray-100"
              placeholder="example@email.com"
              dir="ltr"
              autoComplete="email"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="register-role"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
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
            <div className="mt-2 grid grid-cols-1 gap-4 border-t pt-4 md:col-span-2 md:grid-cols-2">
              <h3 className="text-lg font-bold text-gray-800 md:col-span-2">
                اطلاعات مطب و برنامه کاری پزشک
              </h3>

              <div>
                <label
                  htmlFor="doctor-mcn"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  کد نظام پزشکی
                </label>
                <input
                  id="doctor-mcn"
                  type="text"
                  value={medicalCouncilNumber}
                  onChange={(e) => setMedicalCouncilNumber(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="doctor-specialty"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  تخصص
                </label>
                <input
                  id="doctor-specialty"
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="doctor-province"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  استان
                </label>
                <input
                  id="doctor-province"
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="doctor-city"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  شهر
                </label>
                <input
                  id="doctor-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="doctor-address"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  آدرس دقیق مطب
                </label>
                <input
                  id="doctor-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="doctor-bio"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  معرفی کوتاه / بیوگرافی
                </label>
                <textarea
                  id="doctor-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={loading}
                  className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
                  rows={3}
                />
              </div>

              <div>
                <label
                  htmlFor="doctor-experience"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  سال‌های تجربه
                </label>
                <input
                  id="doctor-experience"
                  type="text"
                  inputMode="numeric"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="0"
                  dir="ltr"
                />
              </div>

              <div>
                <label
                  htmlFor="doctor-fee"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  هزینه ویزیت (ریال)
                </label>
                <input
                  id="doctor-fee"
                  type="text"
                  inputMode="numeric"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="0"
                  dir="ltr"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="doctor-work-shift"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  شیفت کاری
                </label>
                <select
                  id="doctor-work-shift"
                  value={workShift}
                  onChange={(e) =>
                    setWorkShift(
                      e.target.value as "morning" | "afternoon" | "both",
                    )
                  }
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="morning">شیفت صبح</option>
                  <option value="afternoon">شیفت عصر</option>
                  <option value="both">هر دو شیفت</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  روزهای کاری پزشک
                </span>
                <div className="grid grid-cols-3 gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  {weekdays.map((day, idx) => (
                    <label
                      key={day}
                      htmlFor={`day-checkbox-${idx}`}
                      className="flex cursor-pointer items-center space-x-2 space-x-reverse"
                    >
                      <input
                        id={`day-checkbox-${idx}`}
                        type="checkbox"
                        checked={workDays.includes(day)}
                        onChange={() => handleDayCheckboxChange(day)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-800">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              {(workShift === "morning" || workShift === "both") && (
                <>
                  <div>
                    <label
                      htmlFor="doctor-morning-start"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      شروع شیفت صبح
                    </label>
                    <input
                      id="doctor-morning-start"
                      type="time"
                      value={morningStart}
                      onChange={(e) => setMorningStart(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="doctor-morning-end"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      پایان شیفت صبح
                    </label>
                    <input
                      id="doctor-morning-end"
                      type="time"
                      value={morningEnd}
                      onChange={(e) => setMorningEnd(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </>
              )}

              {(workShift === "afternoon" || workShift === "both") && (
                <>
                  <div>
                    <label
                      htmlFor="doctor-afternoon-start"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      شروع شیفت عصر
                    </label>
                    <input
                      id="doctor-afternoon-start"
                      type="time"
                      value={afternoonStart}
                      onChange={(e) => setAfternoonStart(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="doctor-afternoon-end"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      پایان شیفت عصر
                    </label>
                    <input
                      id="doctor-afternoon-end"
                      type="time"
                      value={afternoonEnd}
                      onChange={(e) => setAfternoonEnd(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <div className="mt-4 md:col-span-2">
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
