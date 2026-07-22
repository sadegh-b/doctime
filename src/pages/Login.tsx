import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, type LoginPayload } from "../services/auth";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
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
    setLoading(true);

    try {
      const normalizedPhone = normalizeDigits(phone).trim();

      const payload: LoginPayload = {
        phone: normalizedPhone,
        password,
      };

      await login(payload);
      await refreshUser();

      navigate("/");
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "ورود ناموفق بود.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          ورود
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
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500"
              placeholder="09123456789"
              dir="ltr"
              inputMode="numeric"
              autoComplete="tel"
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

            <input
              id="login-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left outline-none focus:border-blue-500"
              dir="ltr"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>
      </div>
    </div>
  );
}
