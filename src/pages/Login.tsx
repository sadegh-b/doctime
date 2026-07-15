import { useState } from "react";
import { AxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";

import { login } from "../services/auth";
import { getMyProfile } from "../services/profile";

type ValidationDetailItem = {
  msg?: string;
};

type ErrorResponseData = {
  detail?: string | ValidationDetailItem[];
  message?: string;
};

export default function Login() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function getLoginErrorMessage(err: AxiosError<ErrorResponseData>): string {
    const status = err.response?.status;
    const data = err.response?.data;

    if (!err.response) {
      return "ارتباط با سرور برقرار نشد. اینترنت و وضعیت سرور را بررسی کنید.";
    }

    if (status === 401) {
      return "شماره موبایل / نام کاربری یا رمز عبور اشتباه است.";
    }

    if (status === 422) {
      if (Array.isArray(data?.detail) && data.detail.length > 0) {
        const firstError = data.detail[0];
        if (firstError && typeof firstError.msg === "string") {
          return firstError.msg;
        }
      }

      return "اطلاعات واردشده صحیح نیست.";
    }

    if (status === 403) {
      return "شما دسترسی لازم برای ورود به این بخش را ندارید.";
    }

    if (status && status >= 500) {
      return "سرور در حال حاضر پاسخ‌گو نیست. لطفاً کمی بعد دوباره تلاش کنید.";
    }

    if (typeof data?.detail === "string" && data.detail.trim()) {
      return data.detail;
    }

    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }

    return "ورود ناموفق بود. لطفاً دوباره تلاش کنید.";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const normalizedIdentifier = identifier.trim();
    const normalizedPassword = pass.trim();

    if (!normalizedIdentifier) {
      setError("شماره موبایل یا نام کاربری را وارد کنید.");
      return;
    }

    if (!normalizedPassword) {
      setError("رمز عبور را وارد کنید.");
      return;
    }

    try {
      setLoading(true);

      await login({
        identifier: normalizedIdentifier,
        password: normalizedPassword,
      });

      const profile = await getMyProfile();
      localStorage.setItem("role", profile.role);

      const dashboardRoutes: Record<string, string> = {
        patient: "/patient-dashboard",
        doctor: "/doctor-dashboard",
        admin: "/admin-dashboard",
      };

      const dashboardPath = dashboardRoutes[profile.role];

      if (!dashboardPath) {
        throw new Error(`برای نقش ${profile.role} مسیر داشبورد تعریف نشده است.`);
      }

      window.dispatchEvent(new Event("auth-change"));
      navigate(dashboardPath, { replace: true });
    } catch (err: unknown) {
      console.error("LOGIN ERROR:", err);

      if (err instanceof AxiosError) {
        setError(getLoginErrorMessage(err as AxiosError<ErrorResponseData>));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("خطای غیرمنتظره‌ای رخ داد. لطفاً دوباره تلاش کنید.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-slate-100 px-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-800">ورود به حساب کاربری</h1>
          <p className="mt-2 text-sm text-slate-500">
            برای ادامه وارد حساب خود شوید
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="identifier"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              شماره موبایل / نام کاربری
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
              placeholder="مثلاً 09123456789"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              رمز عبور
            </label>
            <input
              id="password"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
              placeholder="رمز عبور خود را وارد کنید"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          حساب کاربری ندارید؟{" "}
          <Link to="/register" className="font-medium text-blue-600 hover:underline">
            ثبت نام
          </Link>
        </div>
      </div>
    </div>
  );
}
