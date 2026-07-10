import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, saveRole } from "../services/auth";
import { getMyProfile } from "../services/profile";

export default function DoctorLogin() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const normalizedPhone = phone.trim();
    const normalizedPassword = password.trim();

    if (!normalizedPhone || !normalizedPassword) {
      setError("شماره موبایل و رمز عبور را وارد کنید");
      return;
    }

    try {
      setLoading(true);

      await login(normalizedPhone, normalizedPassword);

      const profile = await getMyProfile();

      if (profile.role !== "doctor") {
        setError("این حساب پزشک نیست. از صفحه ورود بیمار استفاده کنید.");
        return;
      }

      saveRole("doctor");
      window.dispatchEvent(new Event("auth-change"));

      navigate("/doctor-dashboard");
    } catch (err) {
      console.error("DOCTOR LOGIN ERROR:", err);
      setError("ورود پزشک ناموفق بود. اطلاعات را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="min-h-[72vh] flex items-center justify-center px-4 py-10"
    >
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="order-2 p-6 sm:p-8 lg:order-1 lg:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-8 text-center lg:text-right">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-600 via-sky-600 to-indigo-700 text-white shadow-[0_14px_34px_rgba(6,182,212,0.28)] lg:mx-0">
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
                    d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 22c0-3.314 3.582-6 8-6s8 2.686 8 6"
                  />
                </svg>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                ورود پزشک
              </h1>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                برای مدیریت نوبت‌ها، برنامه کاری و پنل مطب وارد حساب پزشک شوید.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="doctor-phone"
                  className="mb-2 block text-sm font-black text-slate-700"
                >
                  شماره موبایل پزشک
                </label>
                <input
                  id="doctor-phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="09123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label
                  htmlFor="doctor-password"
                  className="mb-2 block text-sm font-black text-slate-700"
                >
                  رمز عبور
                </label>
                <input
                  id="doctor-password"
                  type="password"
                  placeholder="رمز عبور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-700 px-5 py-3.5 text-sm font-black text-white shadow-[0_18px_36px_rgba(8,145,178,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(8,145,178,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "در حال ورود..." : "ورود به پنل پزشک"}
              </button>
            </form>

            <div className="mt-6 space-y-3 text-center lg:text-right">
              <div className="text-sm text-slate-500">
                اگر بیمار هستید، از اینجا وارد شوید:{" "}
                <Link
                  to="/login"
                  className="font-black text-emerald-700 hover:text-emerald-800"
                >
                  ورود بیمار
                </Link>
              </div>

              <div className="text-sm text-slate-500">
                هنوز حساب ندارید؟{" "}
                <Link
                  to="/register"
                  className="font-black text-cyan-700 hover:text-cyan-800"
                >
                  ثبت‌نام
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-6 text-white sm:p-8 lg:order-2 lg:p-10">
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black text-cyan-100 backdrop-blur">
                Doctor Panel
              </div>

              <h2 className="mt-6 text-3xl font-black leading-tight sm:text-4xl">
                پنل پزشک برای
                <br />
                مدیریت نوبت‌ها و برنامه کاری
              </h2>

              <p className="mt-5 max-w-md text-sm leading-8 text-slate-300">
                نوبت‌های رزرو شده، برنامه حضور، مدیریت زمان‌های خالی و کنترل
                وضعیت مراجعه‌کنندگان را از یک داشبورد متمرکز انجام بده.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="text-2xl font-black">Dashboard</div>
                <div className="mt-2 text-xs text-slate-300">
                  مشاهده خلاصه وضعیت مطب
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="text-2xl font-black">Schedule</div>
                <div className="mt-2 text-xs text-slate-300">
                  مدیریت برنامه و ساعت حضور
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="text-2xl font-black">Visits</div>
                <div className="mt-2 text-xs text-slate-300">
                  مدیریت نوبت‌ها و مراجعه‌کنندگان
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}