import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// جداسازی توابع اجرایی (مقادیر ران‌تایم)
import { registerUser, requestOtp, saveAuthData } from "../services/auth";

// جداسازی تایپ‌ها (فقط برای زمان کامپایل)
import type { RegisterPayload, AuthUser } from "../services/auth";

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [timer, setTimer] = useState(120);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const rawUserData = location.state?.userData;
  const storedPayload = sessionStorage.getItem("pending_register_payload");

  const userData: RegisterPayload | null =
    rawUserData || (storedPayload ? JSON.parse(storedPayload) : null);

  useEffect(() => {
    if (!userData) {
      setError("اطلاعات ثبت نام یافت نشد. لطفا دوباره تلاش کنید.");
    }
  }, [userData]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/[^\d]/g, "");
    if (!cleanVal) return;

    const newOtp = [...otp];
    newOtp[index] = cleanVal.substring(cleanVal.length - 1);
    setOtp(newOtp);

    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/[^\d]/g, "")
      .substring(0, 6);
    if (pastedData.length === 6) {
      setOtp(pastedData.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (!userData) return;

    try {
      await requestOtp(userData.phone);
      setTimer(120);
      setError(null);
    } catch {
      setError("ارسال مجدد کد انجام نشد.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors([]);

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("کد تایید باید ۶ رقمی باشد.");
      return;
    }

    if (!userData) {
      setError("اطلاعات ثبت نام پیدا نشد.");
      return;
    }

    // اطلاعات تخصصی پزشک (در صورت وجود) را از حافظه موقت می‌خوانیم
    // و مستقیماً داخل همان درخواست ثبت‌نام قرار می‌دهیم
    const storedDoctorDetails = sessionStorage.getItem(
      "pending_doctor_details"
    );

    const doctorDetails = storedDoctorDetails
      ? JSON.parse(storedDoctorDetails)
      : {};

    const cleanPayload: RegisterPayload = {
      name: userData.name.trim(),

      phone: userData.phone,

      password: userData.password,

      national_id: userData.national_id,

      email: userData.email || null,

      role: userData.role,

      ...(userData.role === "doctor" ? doctorDetails : {}),
    };

    setLoading(true);

    try {
      console.log("REGISTER USER:", cleanPayload);

      // یک درخواست واحد: ساخت کاربر + تکمیل پروفایل پزشک (در صورت نیاز) + دریافت توکن
      const registerRes = await registerUser(cleanPayload, otpCode);

      console.log("REGISTER SUCCESS:", registerRes);

      const receivedToken =
        registerRes.token?.access_token ?? registerRes.access_token;

      if (receivedToken) {
        const loggedInUser: AuthUser = registerRes.user || {
          name: cleanPayload.name,
          phone: cleanPayload.phone,
          role: cleanPayload.role,
          email: cleanPayload.email,
        };

        // saveAuthData خودش هر دو شکل پاسخ (flat یا nested) را تشخیص می‌دهد
        saveAuthData({ ...registerRes, user: loggedInUser });

        // اطلاع‌رسانی به کل برنامه برای به‌روزرسانی وضعیت ورود
        window.dispatchEvent(new Event("auth-change"));
      } else {
        console.warn("REGISTER: توکنی در پاسخ سرور یافت نشد.", registerRes);
      }

      // پاکسازی حافظه موقت پس از موفقیت کامل
      sessionStorage.removeItem("pending_register_payload");
      sessionStorage.removeItem("pending_doctor_details");

      // هدایت به پنل مربوطه
      navigate(
        cleanPayload.role === "doctor"
          ? "/doctor/dashboard"
          : "/patient/dashboard"
      );
    } catch (err: any) {
      console.error("REGISTER ERROR:", err);

      const detail = err?.response?.data?.detail;

      if (Array.isArray(detail)) {
        // خطاهای ساختاریافته Pydantic از سمت FastAPI
        setValidationErrors(detail);
      } else if (detail) {
        // خطاهای متنی معمولی از سمت بک‌انده
        setError(detail);
      } else {
        // خطاهای غیرمنتظره یا قطع شبکه
        setError(err.message || "خطا در تکمیل ثبت نام");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10"
    >
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 shadow-sm md:p-8">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition flex items-center gap-1"
          >
            ← بازگشت به ثبت‌نام
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-xl font-extrabold text-slate-800">
            تایید شماره موبایل
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            کد ۶ رقمی ارسال شده به شماره{" "}
            <span className="font-bold text-slate-700">{userData?.phone}</span>{" "}
            را وارد کنید.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 p-4 text-xs font-semibold text-rose-600">
            {error}
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="mb-4 rounded-xl bg-rose-50 p-4 text-xs text-rose-600">
            <p className="font-bold mb-1">
              خطای اعتبارسنجی فیلدها در سرور (422)
            </p>
            <pre
              className="text-[10px] overflow-auto max-h-40 p-2 bg-rose-100 rounded-lg text-left"
              dir="ltr"
            >
              {JSON.stringify(validationErrors, null, 2)}
            </pre>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2" dir="ltr">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-12 text-center text-lg font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 focus:bg-white outline-none transition"
              />
            ))}
          </div>

          <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>زمان باقی‌مانده: {formatTime(timer)}</span>
            <button
              type="button"
              disabled={timer > 0}
              onClick={handleResendOtp}
              className="text-sky-500 hover:text-sky-600 disabled:text-slate-400 disabled:no-underline font-bold transition"
            >
              ارسال مجدد کد
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !userData}
            className="w-full py-3.5 bg-sky-500 text-white text-sm font-extrabold rounded-2xl hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "در حال تایید..." : "تایید و تکمیل ثبت‌نام"}
          </button>
        </form>
      </div>
    </div>
  );
}
