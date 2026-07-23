// Path: src/components/Login.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, getError, type LoginPayload } from "../services/auth";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const normalizeDigits = (value: string): string => {
    const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

    return value
      .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
      .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const normalizedPhone = normalizeDigits(phone).replace(/\s+/g, "").trim();

    if (!normalizedPhone) {
      setError("وارد کردن شماره موبایل الزامی است.");
      return;
    }

    if (!/^09\d{9}$/.test(normalizedPhone)) {
      setError("شماره موبایل نامعتبر است. فرمت صحیح: 09123456789");
      return;
    }

    if (!password) {
      setError("وارد کردن رمز عبور الزامی است.");
      return;
    }

    setLoading(true);

    try {
      const payload: LoginPayload = {
        phone: normalizedPhone,
        password,
      };

      await login(payload);
      await refreshUser();

      navigate("/");
    } catch (err: unknown) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          ورود به سیستم
        </h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
          <div>
            <label
              htmlFor="login-phone"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              شماره موبایل
            </label>
            <input
              id="login-phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500 disabled:bg-gray-100"
              placeholder="09123456789"
              dir="ltr"
              inputMode="numeric"
              maxLength={11}
              autoComplete="tel"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              رمز عبور
            </label>
            <div className="relative">
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 pl-12 pr-4 py-3 text-left outline-none focus:border-blue-500 disabled:bg-gray-100"
                dir="ltr"
                autoComplete="current-password"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-blue-600 focus:outline-none"
              >
                {showPassword ? "پنهان" : "نمایش"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>
      </div>
    </div>
  );
}
