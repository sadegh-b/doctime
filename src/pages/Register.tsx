import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  register,
  type RegisterPayload,
  type WorkShift,
} from "../services/auth";
import { isTimeoutError, wakeApi } from "../services/api";

type Role = "patient" | "doctor";

const WEEK_DAYS = [
  { id: "شنبه", label: "شنبه" },
  { id: "یک‌شنبه", label: "یک‌شنبه" },
  { id: "دوشنبه", label: "دوشنبه" },
  { id: "سه‌شنبه", label: "سه‌شنبه" },
  { id: "چهارشنبه", label: "چهارشنبه" },
  { id: "پنج‌شنبه", label: "پنج‌شنبه" },
  { id: "جمعه", label: "جمعه" },
];

const TIME_OPTIONS = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const isDoctorRoute = location.pathname === "/doctor-register";
  const [role, setRole] = useState<Role>(isDoctorRoute ? "doctor" : "patient");

  useEffect(() => {
    setRole(isDoctorRoute ? "doctor" : "patient");
  }, [isDoctorRoute]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [specialty, setSpecialty] = useState("");
  const [city, setCity] = useState("");
  const [workShift, setWorkShift] = useState<WorkShift>("morning");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [scheduleStartDate, setScheduleStartDate] = useState("");
  const [morningStart, setMorningStart] = useState("08:00");
  const [morningEnd, setMorningEnd] = useState("12:00");
  const [afternoonStart, setAfternoonStart] = useState("16:00");
  const [afternoonEnd, setAfternoonEnd] = useState("20:00");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isDoctor = role === "doctor";

  const toggleDay = (dayId: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  function isValidIranMobile(value: string): boolean {
    return /^09\d{9}$/.test(value);
  }

  function isValidPersianDate(value: string): boolean {
    return /^\d{4}\/\d{2}\/\d{2}$/.test(value);
  }

  function isValidTimeRange(start: string, end: string): boolean {
    return start < end;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const normalizedName = name.trim();
    const normalizedPhone = phone.trim();
    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();
    const normalizedSpecialty = specialty.trim();
    const normalizedCity = city.trim();
    const normalizedScheduleStartDate = scheduleStartDate.trim();

    if (!normalizedName || !normalizedPhone || !normalizedPassword) {
      setError("نام، شماره موبایل و رمز عبور الزامی است.");
      return;
    }

    if (!isValidIranMobile(normalizedPhone)) {
      setError("شماره موبایل نامعتبر است. باید با 09 شروع شود و 11 رقم باشد.");
      return;
    }

    if (normalizedPassword.length < 6) {
      setError("رمز عبور باید حداقل 6 کاراکتر باشد.");
      return;
    }

    if (isDoctor) {
      if (!normalizedSpecialty) {
        setError("وارد کردن تخصص برای پزشکان الزامی است.");
        return;
      }

      if (!normalizedCity) {
        setError("وارد کردن شهر برای پزشکان الزامی است.");
        return;
      }

      if (selectedDays.length === 0) {
        setError("لطفاً حداقل یک روز کاری را انتخاب کنید.");
        return;
      }

      if (!normalizedScheduleStartDate) {
        setError("تاریخ شروع برنامه کاری پزشک الزامی است.");
        return;
      }

      if (!isValidPersianDate(normalizedScheduleStartDate)) {
        setError("فرمت تاریخ باید به صورت 1405/04/24 باشد.");
        return;
      }

      if (
        (workShift === "morning" || workShift === "both") &&
        !isValidTimeRange(morningStart, morningEnd)
      ) {
        setError("ساعت شروع شیفت صبح باید از ساعت پایان کمتر باشد.");
        return;
      }

      if (
        (workShift === "afternoon" || workShift === "both") &&
        !isValidTimeRange(afternoonStart, afternoonEnd)
      ) {
        setError("ساعت شروع شیفت عصر باید از ساعت پایان کمتر باشد.");
        return;
      }
    }

    try {
      setLoading(true);

      const payload: RegisterPayload = {
        name: normalizedName,
        phone: normalizedPhone,
        password: normalizedPassword,
        email: normalizedEmail || undefined,
        role,
        specialty: isDoctor ? normalizedSpecialty : undefined,
        city: isDoctor ? normalizedCity : undefined,
        work_shift: isDoctor ? workShift : undefined,
        work_days: isDoctor ? selectedDays : undefined,
        schedule_start_date: isDoctor ? normalizedScheduleStartDate : undefined,
        morning_start:
          isDoctor && (workShift === "morning" || workShift === "both")
            ? morningStart
            : undefined,
        morning_end:
          isDoctor && (workShift === "morning" || workShift === "both")
            ? morningEnd
            : undefined,
        afternoon_start:
          isDoctor && (workShift === "afternoon" || workShift === "both")
            ? afternoonStart
            : undefined,
        afternoon_end:
          isDoctor && (workShift === "afternoon" || workShift === "both")
            ? afternoonEnd
            : undefined,
      };

      await wakeApi();

      let lastError: unknown;

      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          await register(payload);

          setSuccess("ثبت‌نام با موفقیت انجام شد. در حال انتقال به صفحه ورود...");

          setTimeout(() => {
            if (role === "doctor") {
              navigate("/doctor-login");
            } else {
              navigate("/login");
            }
          }, 1500);

          return;
        } catch (err) {
          lastError = err;

          if (attempt === 0 && isTimeoutError(err)) {
            await sleep(4000);
            await wakeApi();
            continue;
          }

          throw err;
        }
      }

      throw lastError;
    } catch (err) {
      if (isTimeoutError(err)) {
        setError(
          "سرور در حال آماده‌سازی بود و به‌موقع پاسخ نداد. لطفاً چند ثانیه دیگر دوباره تلاش کنید."
        );
      } else if (err instanceof Error) {
        setError(err.message || "ثبت‌نام انجام نشد.");
      } else {
        setError("ثبت‌نام انجام نشد. ارتباط با سرور برقرار نشد.");
      }
    } finally {
      setLoading(false);
    }
  }

  const timeSelectClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500";

  return (
    <div
      dir="rtl"
      className="flex min-h-[72vh] items-center justify-center px-4 py-10"
    >
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="order-2 p-6 sm:p-8 lg:order-1 lg:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-8 text-center lg:text-right">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                ثبت‌نام در DocTime
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                حساب کاربری جدید بسازید.
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 rounded-3xl bg-slate-100 p-2">
              <button
                type="button"
                onClick={() => {
                  setRole("patient");
                  navigate("/register");
                }}
                className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                  role === "patient"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                ثبت‌نام بیمار
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole("doctor");
                  navigate("/doctor-register");
                }}
                className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                  role === "doctor"
                    ? "bg-white text-cyan-700 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                ثبت‌نام پزشک
              </button>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold leading-6 text-emerald-700">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="نام کامل"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full rounded-2xl border bg-white px-4 py-3.5 outline-none transition ${
                    isDoctor
                      ? "focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      : "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  }`}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  شماره موبایل
                </label>
                <input
                  type="tel"
                  autoComplete="tel"
                  placeholder="09123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full rounded-2xl border bg-white px-4 py-3.5 outline-none transition ${
                    isDoctor
                      ? "focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      : "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  }`}
                />
              </div>

              {isDoctor && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-black text-cyan-700">
                      تخصص پزشک
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: متخصص قلب و عروق"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full rounded-2xl border border-cyan-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-black text-cyan-700">
                      شهر
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: تهران"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-2xl border border-cyan-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-black text-cyan-700">
                      روزهای کاری هفته
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {WEEK_DAYS.map((day) => (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => toggleDay(day.id)}
                          className={`rounded-xl border py-2 text-xs font-bold transition ${
                            selectedDays.includes(day.id)
                              ? "border-cyan-500 bg-cyan-500 text-white"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-black text-cyan-700">
                      تاریخ شروع برنامه کاری
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 1405/04/24"
                      value={scheduleStartDate}
                      onChange={(e) => setScheduleStartDate(e.target.value)}
                      className="w-full rounded-2xl border border-cyan-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      این تاریخ فقط برای شروع برنامه کاری است.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-black text-cyan-700">
                      شیفت کاری
                    </label>
                    <select
                      value={workShift}
                      onChange={(e) => setWorkShift(e.target.value as WorkShift)}
                      className="w-full rounded-2xl border border-cyan-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                    >
                      <option value="morning">صبح</option>
                      <option value="afternoon">عصر</option>
                      <option value="both">صبح و عصر</option>
                    </select>
                  </div>

                  {(workShift === "morning" || workShift === "both") && (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                      <div className="mb-3 text-xs font-bold text-slate-500">
                        ساعت کار شیفت صبح
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1 block text-xs text-slate-600">
                            شروع
                          </label>
                          <select
                            value={morningStart}
                            onChange={(e) => setMorningStart(e.target.value)}
                            className={timeSelectClass}
                          >
                            {TIME_OPTIONS.map((time) => (
                              <option key={`morning-start-${time}`} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-xs text-slate-600">
                            پایان
                          </label>
                          <select
                            value={morningEnd}
                            onChange={(e) => setMorningEnd(e.target.value)}
                            className={timeSelectClass}
                          >
                            {TIME_OPTIONS.map((time) => (
                              <option key={`morning-end-${time}`} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {(workShift === "afternoon" || workShift === "both") && (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                      <div className="mb-3 text-xs font-bold text-slate-500">
                        ساعت کار شیفت عصر
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1 block text-xs text-slate-600">
                            شروع
                          </label>
                          <select
                            value={afternoonStart}
                            onChange={(e) => setAfternoonStart(e.target.value)}
                            className={timeSelectClass}
                          >
                            {TIME_OPTIONS.map((time) => (
                              <option key={`afternoon-start-${time}`} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-xs text-slate-600">
                            پایان
                          </label>
                          <select
                            value={afternoonEnd}
                            onChange={(e) => setAfternoonEnd(e.target.value)}
                            className={timeSelectClass}
                          >
                            {TIME_OPTIONS.map((time) => (
                              <option key={`afternoon-end-${time}`} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  ایمیل <span className="text-slate-400">(اختیاری)</span>
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-2xl border bg-white px-4 py-3.5 outline-none transition ${
                    isDoctor
                      ? "focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      : "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  }`}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  رمز عبور
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="رمز عبور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-2xl border bg-white px-4 py-3.5 outline-none transition ${
                    isDoctor
                      ? "focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      : "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-2xl px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 ${
                  isDoctor
                    ? "bg-gradient-to-r from-cyan-600 to-sky-700"
                    : "bg-gradient-to-r from-emerald-600 to-cyan-600"
                }`}
              >
                {loading
                  ? "در حال ثبت‌نام..."
                  : isDoctor
                    ? "ثبت‌نام پزشک"
                    : "ثبت‌نام بیمار"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500 lg:text-right">
              قبلاً حساب ساخته‌اید؟{" "}
              <Link
                to={isDoctor ? "/doctor-login" : "/login"}
                className={`font-black ${
                  isDoctor ? "text-cyan-700" : "text-emerald-700"
                }`}
              >
                ورود
              </Link>
            </div>
          </div>
        </div>

        <div className="order-1 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-8 text-white lg:order-2 lg:p-10">
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="mb-6 inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/90">
                DocTime
              </div>
              <h2 className="text-3xl font-black leading-tight">
                نوبت‌دهی آنلاین، ساده و سریع
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
                پزشکان و بیماران می‌توانند در یک سیستم یکپارچه ثبت‌نام کنند و
                فرایند رزرو نوبت را بدون دردسر انجام دهند.
              </p>
            </div>

            <div className="mt-10 grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-bold text-white/80">ویژگی‌ها</p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-white/70">
                  <li>• ثبت‌نام بیمار و پزشک</li>
                  <li>• انتخاب روزهای حضور در مطب</li>
                  <li>• تعریف تاریخ شروع برنامه کاری</li>
                  <li>• تعیین ساعت کاری به صورت 24 ساعتی</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
