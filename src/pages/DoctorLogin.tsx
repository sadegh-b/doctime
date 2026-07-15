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

export default function DoctorLogin() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function getLoginErrorMessage(err: AxiosError<ErrorResponseData>): string {
    const status = err.response?.status;
    const data = err.response?.data;

    if (!err.response) {
      return "ارتباط با سرور برقرار نشد. از روشن بودن بک‌اند مطمئن شوید.";
    }

    if (status === 401) {
      return "شماره موبایل یا رمز عبور اشتباه است.";
    }

    if (status === 422) {
      if (Array.isArray(data?.detail) && data.detail.length > 0) {
        const firstError = data.detail[0];
        if (firstError?.msg) {
          return firstError.msg;
        }
      }
      return "اطلاعات واردشده صحیح نیست.";
    }

    if (status === 403) {
      return "اجازه ورود به این بخش را ندارید.";
    }

    if (status && status >= 500) {
      return "خطای سرور رخ داده است. لطفاً کمی بعد دوباره تلاش کنید.";
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

    const normalizedPhone = phone.trim();
    const normalizedPassword = pass.trim();

    if (!normalizedPhone) {
      setError("شماره موبایل را وارد کنید.");
      return;
    }

    if (!normalizedPassword) {
      setError("رمز عبور را وارد کنید.");
      return;
    }

    try {
      setLoading(true);

      await login({
        phone: normalizedPhone,
        password: normalizedPassword,
      });

      const profile = await getMyProfile();

      if (profile.role !== "doctor") {
        setError("این حساب کاربری پزشک نیست.");
        return;
      }

      localStorage.setItem("role", profile.role);
      window.dispatchEvent(new Event("auth-change"));
      navigate("/doctor-dashboard", { replace: true });
    } catch (err: unknown) {
      console.error("DOCTOR LOGIN ERROR:", err);

      if (err instanceof AxiosError) {
        setError(getLoginErrorMessage(err as AxiosError<ErrorResponseData>));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("خطای غیرمنتظره‌ای رخ داد.");
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
          <h1 className="text-2xl font-bold text-slate-800">ورود پزشکان</h1>
          <p className="mt-2 text-sm text-slate-500">
            برای ورود به پنل پزشک، اطلاعات خود را وارد کنید
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="phone"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              شماره موبایل
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
            {loading ? "در حال ورود..." : "ورود پزشک"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          حساب پزشک ندارید؟{" "}
          <Link
            to="/doctor-register"
            className="font-medium text-blue-600 hover:underline"
          >
            ثبت نام پزشک
          </Link>
        </div>
      </div>
    </div>
  );
}
