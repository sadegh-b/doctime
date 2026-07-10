import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, saveRole } from "../services/auth";
import { getMyProfile } from "../services/profile";

export default function Login() {
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

      const role =
        profile.role === "doctor"
          ? "doctor"
          : profile.role === "admin"
          ? "admin"
          : "patient";

      saveRole(role);
      window.dispatchEvent(new Event("auth-change"));

      if (role === "doctor") {
        navigate("/doctor-dashboard");
        return;
      }

      navigate("/patient-dashboard");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("ورود ناموفق بود. شماره موبایل یا رمز عبور اشتباه است.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="min-h-[72vh] flex items-center justify-center px-4 py-10"
    >
      <div
        className="
          w-full
          max-w-md
          rounded-[32px]
          border
          border-slate-200
          bg-white
          p-8
          shadow-xl
        "
      >
        <div className="mb-8 text-center">
          <div
            className="
              mx-auto
              mb-5
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-3xl
              bg-gradient-to-br
              from-emerald-500
              to-cyan-600
              text-3xl
              font-black
              text-white
            "
          >
            +
          </div>

          <h1 className="text-3xl font-black text-slate-900">
            ورود به DocTime
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            ورود بیمار یا پزشک به سامانه نوبت‌دهی
          </p>
        </div>

        {error && (
          <div
            className="
              mb-5
              rounded-2xl
              border
              border-red-200
              bg-red-50
              p-3
              text-sm
              font-bold
              text-red-600
            "
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-black text-slate-700">
              شماره موبایل
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09123456789"
              className="
                w-full
                rounded-2xl
                border
                border-slate-200
                px-4
                py-3
                outline-none
                focus:border-emerald-500
              "
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-slate-700">
              رمز عبور
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور"
              className="
                w-full
                rounded-2xl
                border
                border-slate-200
                px-4
                py-3
                outline-none
                focus:border-emerald-500
              "
            />
          </div>

          <button
            disabled={loading}
            className="
              w-full
              rounded-2xl
              bg-gradient-to-r
              from-emerald-600
              to-cyan-600
              py-3.5
              font-black
              text-white
              disabled:opacity-50
            "
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          حساب ندارید؟
          <Link
            to="/register"
            className="mr-2 font-black text-emerald-700"
          >
            ثبت‌نام
          </Link>
        </div>
      </div>
    </div>
  );
}