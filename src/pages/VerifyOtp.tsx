import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  clearPendingRegisterPayload,
  getError,
  getPendingRegisterPayload,
  normalizeText,
  registerUser,
  type RegisterPayload,
} from "../services/auth";

type RegisterLocationState = {
  userData?: RegisterPayload;
};

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const routeState = location.state as RegisterLocationState | null;

  const userData = useMemo(() => {
    const fromState = routeState?.userData ?? null;
    const fromStorage = getPendingRegisterPayload();
    return fromState || fromStorage;
  }, [routeState]);

  useEffect(() => {
    if (!userData) {
      alert("اطلاعات ثبت نام پیدا نشد. دوباره تلاش کنید.");
      navigate("/register", { replace: true });
    }
  }, [navigate, userData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userData) {
      alert("اطلاعات ثبت نام موجود نیست.");
      navigate("/register", { replace: true });
      return;
    }

    const normalizedOtp = normalizeText(otp).replace(/\D/g, "");

    if (!/^\d{6}$/.test(normalizedOtp)) {
      alert("کد تایید باید 6 رقمی باشد.");
      return;
    }

    try {
      setLoading(true);

      const result = await registerUser(userData, normalizedOtp);
      clearPendingRegisterPayload();

      alert(result.message || "ثبت نام با موفقیت انجام شد.");

      if (result.user?.role === "doctor") {
        navigate("/doctor/dashboard", { replace: true });
      } else {
        navigate("/patient-dashboard", { replace: true });
      }
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
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-extrabold text-slate-800">
              تایید کد
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              کد ارسال شده به شماره{" "}
              <span className="font-bold text-slate-700">
                {userData?.phone || "-"}
              </span>{" "}
              را وارد کنید.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                کد تایید
              </label>
              <input
                type="text"
                inputMode="numeric"
                dir="ltr"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                placeholder="123456"
                autoComplete="one-time-code"
                className="h-14 w-full rounded-2xl border border-slate-300 px-4 text-center text-xl tracking-[0.3em] outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !userData}
              className="h-14 w-full rounded-2xl bg-emerald-400 text-base font-extrabold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "در حال بررسی..." : "تایید و تکمیل ثبت نام"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
