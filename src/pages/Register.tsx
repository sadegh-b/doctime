import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getError,
  normalizePhone,
  normalizeText,
  requestRegisterOtp,
  savePendingRegisterPayload,
  type RegisterPayload,
  type UserRole,
} from "../services/auth";

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>("patient");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = (): string | null => {
    const normalizedPhoneValue = normalizePhone(phone);
    const normalizedNationalId = normalizeText(nationalId);

    if (!name.trim()) {
      return "نام و نام خانوادگی الزامی است.";
    }

    if (!/^09\d{9}$/.test(normalizedPhoneValue)) {
      return "شماره موبایل معتبر نیست.";
    }

    if (!/^\d{10}$/.test(normalizedNationalId)) {
      return "کد ملی باید 10 رقمی باشد.";
    }

    if (
      email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return "ایمیل معتبر نیست.";
    }

    if (password.trim().length < 6) {
      return "رمز عبور باید حداقل 6 کاراکتر باشد.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      alert(validationError);
      return;
    }

    const payload: RegisterPayload = {
      role,
      name: name.trim(),
      phone: normalizePhone(phone),
      national_id: normalizeText(nationalId),
      email: email.trim() || undefined,
      password: password.trim(),
    };

    try {
      setLoading(true);

      savePendingRegisterPayload(payload);
      await requestRegisterOtp(payload.phone);

      navigate("/verify-otp", {
        state: {
          userData: payload,
        },
      });
    } catch (error) {
      alert(getError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="bg-slate-50 px-4 py-8 md:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 text-right">
            <h1 className="text-2xl font-extrabold text-slate-800">
              ثبت‌نام
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              برای ادامه اطلاعات خود را وارد کنید.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-3 block text-sm font-bold text-slate-700">
                نوع کاربر
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("patient")}
                  className={`h-12 rounded-2xl border text-sm font-bold transition ${
                    role === "patient"
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  بیمار
                </button>

                <button
                  type="button"
                  onClick={() => setRole("doctor")}
                  className={`h-12 rounded-2xl border text-sm font-bold transition ${
                    role === "doctor"
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  پزشک
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                نام و نام خانوادگی
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="نام و نام خانوادگی"
                autoComplete="name"
                className="h-14 w-full rounded-2xl border border-slate-300 px-4 text-right outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                09123456789
              </label>
              <input
                type="text"
                inputMode="numeric"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
                autoComplete="tel"
                className="h-14 w-full rounded-2xl border border-slate-300 px-4 text-left outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                کد ملی
              </label>
              <input
                type="text"
                inputMode="numeric"
                dir="ltr"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="کد ملی"
                autoComplete="off"
                className="h-14 w-full rounded-2xl border border-slate-300 px-4 text-left outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                example@gmail.com
              </label>
              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                autoComplete="email"
                className="h-14 w-full rounded-2xl border border-slate-300 px-4 text-left outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                رمز عبور
              </label>
              <input
                type="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور"
                autoComplete="new-password"
                className="h-14 w-full rounded-2xl border border-slate-300 px-4 text-left outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-2xl bg-emerald-400 text-base font-extrabold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "در حال ارسال..." : "ارسال کد تایید"}
            </button>

            <div className="text-center text-sm text-slate-500">
              قبلا حساب دارید؟{" "}
              <Link to="/login" className="font-bold text-sky-600">
                ورود
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
