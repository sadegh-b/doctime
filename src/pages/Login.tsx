import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin, getError, type LoginPayload } from "../services/auth";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login: setAuthSession } = useAuth();

  const submittingRef = useRef<boolean>(false);

  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
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

    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setError("");

    const normalizedPhone = normalizeDigits(phone).replace(/\s+/g, "").trim();

    if (!normalizedPhone) {
      setError("وارد کردن شماره موبایل الزامی است.");
      submittingRef.current = false;
      return;
    }

    if (!/^09\d{9}$/.test(normalizedPhone)) {
      setError("شماره موبایل نامعتبر است. فرمت صحیح: 09123456789");
      submittingRef.current = false;
      return;
    }

    if (!password) {
      setError("وارد کردن رمز عبور الزامی است.");
      submittingRef.current = false;
      return;
    }

    setLoading(true);

    try {
      const payload: LoginPayload = {
        phone: normalizedPhone,
        password,
      };

      const authData = await apiLogin(payload);

      // پاسخ بک‌اند ممکن است توکن را داخل "token" برگرداند یا مستقیم در ریشه پاسخ
      const accessToken =
        authData.token?.access_token ??
        authData.access_token ??
        "";

      if (!accessToken) {
        console.warn("Login: access_token در پاسخ سرور یافت نشد.", authData);
      }

      setAuthSession(authData.user, accessToken);

      navigate("/", { replace: true });
    } catch (err: unknown) {
      setError(getError(err));
    } finally {
      setLoading(false);
      submittingRef.current = false;
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-blue-600 focus:outline-none"
              >
                {showPassword ? "پنهان" : "نمایش"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>
      </div>
    </div>
  );
}
