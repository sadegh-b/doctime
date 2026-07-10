import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { register } from "../services/auth";

type Role = "patient" | "doctor";

type RegisterErrorResponse = {
  detail?: string | { msg?: string }[] | Record<string, unknown>;
  message?: string;
};

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>("patient");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const normalizedName = name.trim();
    const normalizedPhone = phone.trim();
    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();

    if (!normalizedName || !normalizedPhone || !normalizedPassword) {
      setError("نام، شماره موبایل و رمز عبور الزامی است");
      return;
    }

    if (normalizedPassword.length < 4) {
      setError("رمز عبور خیلی کوتاه است");
      return;
    }

    try {
      setLoading(true);

      await register({
        name: normalizedName,
        phone: normalizedPhone,
        password: normalizedPassword,
        email: normalizedEmail || undefined,
        role,
      });

      setSuccess("ثبت‌نام با موفقیت انجام شد");

      setTimeout(() => {
        navigate("/login");
      }, 700);
    } catch (err) {
      if (err instanceof AxiosError) {
        const data = err.response?.data as RegisterErrorResponse | undefined;

        if (typeof data?.detail === "string" && data.detail.trim()) {
          setError(data.detail);
        } else if (Array.isArray(data?.detail) && data.detail.length > 0) {
          const firstMessage = data.detail[0]?.msg;
          setError(firstMessage || "ثبت‌نام انجام نشد. اطلاعات را بررسی کنید.");
        } else if (typeof data?.message === "string" && data.message.trim()) {
          setError(data.message);
        } else {
          setError("ثبت‌نام انجام نشد. اطلاعات را بررسی کنید.");
        }
      } else {
        setError("ثبت‌نام انجام نشد. اطلاعات را بررسی کنید.");
      }
    } finally {
      setLoading(false);
    }
  }

  const isDoctor = role === "doctor";

  return (
    <div
      dir="rtl"
      className="min-h-[72vh] flex items-center justify-center px-4 py-10"
    >
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="order-2 p-6 sm:p-8 lg:order-1 lg:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-8 text-center lg:text-right">
              <div
                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl text-white shadow-[0_14px_34px_rgba(16,185,129,0.28)] lg:mx-0 ${
                  isDoctor
                    ? "bg-gradient-to-br from-cyan-600 via-sky-600 to-indigo-700"
                    : "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600"
                }`}
              >
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v14M5 12h14"
                  />
                </svg>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                ثبت‌نام در DocTime
              </h1>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                حساب کاربری جدید بسازید و دسترسی خود را به سامانه فعال کنید.
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 rounded-3xl bg-slate-100 p-2">
              <button
                type="button"
                onClick={() => setRole("patient")}
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
                onClick={() => setRole("doctor")}
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
              <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="register-name"
                  className="mb-2 block text-sm font-black text-slate-700"
                >
                  نام و نام خانوادگی
                </label>
                <input
                  id="register-name"
                  type="text"
                  placeholder="نام کامل"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-slate-900 outline-none transition ${
                    isDoctor
                      ? "border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                      : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="register-phone"
                  className="mb-2 block text-sm font-black text-slate-700"
                >
                  شماره موبایل
                </label>
                <input
                  id="register-phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="09123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-slate-900 outline-none transition ${
                    isDoctor
                      ? "border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                      : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="register-email"
                  className="mb-2 block text-sm font-black text-slate-700"
                >
                  ایمیل <span className="text-slate-400">(اختیاری)</span>
                </label>
                <input
                  id="register-email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-slate-900 outline-none transition ${
                    isDoctor
                      ? "border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                      : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="register-password"
                  className="mb-2 block text-sm font-black text-slate-700"
                >
                  رمز عبور
                </label>
                <input
                  id="register-password"
                  type="password"
                  placeholder="رمز عبور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-slate-900 outline-none transition ${
                    isDoctor
                      ? "border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                      : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-2xl px-5 py-3.5 text-sm font-black text-white shadow-[0_18px_36px_rgba(16,185,129,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isDoctor
                    ? "bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-700 shadow-[0_18px_36px_rgba(8,145,178,0.24)] hover:shadow-[0_22px_42px_rgba(8,145,178,0.28)]"
                    : "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:shadow-[0_22px_42px_rgba(16,185,129,0.28)]"
                }`}
              >
                {loading
                  ? "در حال ثبت‌نام..."
                  : isDoctor
                  ? "ثبت‌نام پزشک"
                  : "ثبت‌نام بیمار"}
              </button>
            </form>

            <div className="mt-6 space-y-3 text-center lg:text-right">
              <div className="text-sm text-slate-500">
                قبلاً حساب ساخته‌اید؟{" "}
                <Link
                  to="/login"
                  className={`font-black ${
                    isDoctor
                      ? "text-cyan-700 hover:text-cyan-800"
                      : "text-emerald-700 hover:text-emerald-800"
                  }`}
                >
                  ورود
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`order-1 p-6 text-white sm:p-8 lg:order-2 lg:p-10 ${
            isDoctor
              ? "bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900"
              : "bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950"
          }`}
        >
          <div className="flex h-full flex-col justify-between">
            <div>
              <div
                className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black backdrop-blur ${
                  isDoctor ? "text-cyan-100" : "text-emerald-100"
                }`}
              >
                {isDoctor ? "Doctor Registration" : "Patient Registration"}
              </div>

              <h2 className="mt-6 text-3xl font-black leading-tight sm:text-4xl">
                {isDoctor ? (
                  <>
                    حساب پزشک بساز
                    <br />
                    و پنل حرفه‌ای خودت را فعال کن
                  </>
                ) : (
                  <>
                    ثبت‌نام کن
                    <br />
                    و نوبت‌گیری را شروع کن
                  </>
                )}
              </h2>

              <p className="mt-5 max-w-md text-sm leading-8 text-slate-300">
                {isDoctor
                  ? "پس از ثبت‌نام می‌توانید وارد پنل پزشک شوید و برنامه کاری، نوبت‌ها و زمان‌های آزاد خود را مدیریت کنید."
                  : "پس از ثبت‌نام می‌توانید پزشک جستجو کنید، زمان خالی ببینید و نوبت خود را آنلاین ثبت و پیگیری کنید."}
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="text-xl font-black">
                  {isDoctor ? "Profile" : "Doctors"}
                </div>
                <div className="mt-2 text-xs text-slate-300">
                  {isDoctor
                    ? "ساخت حساب و شروع فعالیت"
                    : "جستجوی پزشک مناسب"}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="text-xl font-black">
                  {isDoctor ? "Schedule" : "Booking"}
                </div>
                <div className="mt-2 text-xs text-slate-300">
                  {isDoctor
                    ? "تنظیم برنامه و ساعت حضور"
                    : "رزرو سریع و آنلاین"}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="text-xl font-black">
                  {isDoctor ? "Visits" : "Follow-up"}
                </div>
                <div className="mt-2 text-xs text-slate-300">
                  {isDoctor
                    ? "مدیریت نوبت‌های بیماران"
                    : "پیگیری نوبت‌ها از پنل"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}