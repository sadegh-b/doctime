import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  register,
  requestOtp,
  toEnglishDigits,
} from "../services/auth";
import type { RegisterPayload } from "../services/auth";

type StoredRegisterPayload = RegisterPayload & {
  nationalId?: string;
  medicalCouncilNumber?: string;
};

function readSessionJson<T>(key: string): T | null {
  const rawValue = sessionStorage.getItem(key);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    sessionStorage.removeItem(key);
    return null;
  }
}

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [timer, setTimer] = useState(120);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /*
    Register.tsx در نسخه فعلی کل اطلاعات، شامل جزئیات پزشک،
    را در pending_register_payload ذخیره می‌کند.
  */
  const storedPayload = readSessionJson<StoredRegisterPayload>(
    "pending_register_payload"
  );

  /*
    این fallback فقط برای سازگاری با نسخه‌های قبلی پروژه است.
    در Register.tsx فعلی، pending_doctor_details ساخته نمی‌شود.
  */
  const storedDoctorDetails = readSessionJson<Partial<RegisterPayload>>(
    "pending_doctor_details"
  );

  const userData: StoredRegisterPayload | null =
    storedPayload ??
    (location.state?.userData as StoredRegisterPayload | undefined) ??
    null;

  useEffect(() => {
    if (!userData) {
      setError("اطلاعات ثبت‌نام یافت نشد. لطفاً دوباره فرم را تکمیل کنید.");
    }
  }, [userData]);

  useEffect(() => {
    if (timer <= 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setTimer((previousTimer) => previousTimer - 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (index: number, value: string) => {
    const normalizedValue = toEnglishDigits(value);
    const cleanValue = normalizedValue.replace(/[^\d]/g, "");

    if (!cleanValue) {
      const nextOtp = [...otp];
      nextOtp[index] = "";
      setOtp(nextOtp);
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = cleanValue.slice(-1);
    setOtp(nextOtp);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key !== "Backspace") {
      return;
    }

    if (!otp[index] && index > 0) {
      const nextOtp = [...otp];
      nextOtp[index - 1] = "";
      setOtp(nextOtp);
      inputRefs.current[index - 1]?.focus();
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = "";
    setOtp(nextOtp);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pastedData = toEnglishDigits(event.clipboardData.getData("text"))
      .replace(/[^\d]/g, "")
      .slice(0, 6);

    if (!pastedData) {
      return;
    }

    const nextOtp = Array(6).fill("");

    pastedData.split("").forEach((digit, index) => {
      nextOtp[index] = digit;
    });

    setOtp(nextOtp);

    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleResendOtp = async () => {
    if (!userData?.phone) {
      setError("شماره موبایل برای ارسال مجدد کد در دسترس نیست.");
      return;
    }

    try {
      setError(null);
      await requestOtp(userData.phone);
      setTimer(120);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "ارسال مجدد کد انجام نشد."
      );
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError(null);
    setValidationErrors([]);

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("کد تأیید باید دقیقاً ۶ رقم باشد.");
      return;
    }

    if (!userData) {
      setError("اطلاعات ثبت‌نام پیدا نشد. لطفاً دوباره ثبت‌نام کنید.");
      return;
    }

    /*
      اولویت داده‌ها:
      1) pending_register_payload: منبع اصلی در Register.tsx فعلی
      2) pending_doctor_details: فقط fallback برای نسخه‌های قدیمی
      3) camelCase: فقط برای سازگاری با داده‌های قدیمی sessionStorage
    */
    const nationalId = (
      userData.national_id ??
      userData.nationalId ??
      ""
    ).trim();

    const medicalCouncilNumber = (
      userData.medical_council_number ??
      userData.medicalCouncilNumber ??
      storedDoctorDetails?.medical_council_number ??
      ""
    ).trim();

    const cleanPayload: RegisterPayload = {
      name: (userData.name ?? "").trim(),
      phone: userData.phone,
      password: userData.password,
      role: userData.role,
      email: userData.email?.trim() || null,
      national_id: nationalId || undefined,

      ...(userData.role === "doctor"
        ? {
            medical_council_number: medicalCouncilNumber || undefined,
            specialty_id:
              userData.specialty_id ??
              storedDoctorDetails?.specialty_id,
            province:
              userData.province ??
              storedDoctorDetails?.province,
            city: userData.city ?? storedDoctorDetails?.city,
            address: userData.address ?? storedDoctorDetails?.address,
            consultation_fee:
              userData.consultation_fee ??
              storedDoctorDetails?.consultation_fee ??
              0,
            work_shift:
              userData.work_shift ??
              storedDoctorDetails?.work_shift,
            work_days:
              userData.work_days ??
              storedDoctorDetails?.work_days ??
              [],
            morning_start:
              userData.morning_start ??
              storedDoctorDetails?.morning_start,
            morning_end:
              userData.morning_end ??
              storedDoctorDetails?.morning_end,
            afternoon_start:
              userData.afternoon_start ??
              storedDoctorDetails?.afternoon_start,
            afternoon_end:
              userData.afternoon_end ??
              storedDoctorDetails?.afternoon_end,
            schedule_start_date:
              userData.schedule_start_date ??
              storedDoctorDetails?.schedule_start_date,
          }
        : {}),
    };

    /*
      اعتبارسنجی کلاینت:
      نباید اجازه دهیم درخواست ناقص به FastAPI برسد و 422 تولید کند.
    */
    if (!cleanPayload.name) {
      setError("نام و نام خانوادگی الزامی است.");
      return;
    }

    if (!cleanPayload.phone) {
      setError("شماره موبایل یافت نشد.");
      return;
    }

    if (!cleanPayload.password) {
      setError("رمز عبور یافت نشد. لطفاً ثبت‌نام را از ابتدا انجام دهید.");
      return;
    }

    if (cleanPayload.role === "doctor") {
      if (!cleanPayload.national_id) {
        setError("کد ملی برای ثبت‌نام پزشک الزامی است.");
        return;
      }

      if (!cleanPayload.medical_council_number) {
        setError("شماره نظام پزشکی برای ثبت‌نام پزشک الزامی است.");
        return;
      }

      if (!cleanPayload.specialty_id) {
        setError("تخصص پزشک در اطلاعات ثبت‌نام یافت نشد.");
        return;
      }
    }

    /*
      لاگ موقت برای تست:
      پس از موفقیت نهایی ثبت‌نام، می‌توانی این console.log را حذف کنی.
    */
    console.log("FINAL REGISTER PAYLOAD:", cleanPayload);

    setLoading(true);

    try {
      await register(cleanPayload, otpCode);

      sessionStorage.removeItem("pending_register_payload");
      sessionStorage.removeItem("pending_doctor_details");

      navigate(
        cleanPayload.role === "doctor"
          ? "/doctor/dashboard"
          : "/patient/dashboard",
        { replace: true }
      );
    } catch (err: any) {
      console.error("REGISTER ERROR:", err);

      /*
        auth.ts خطای Axios را به Error معمولی تبدیل می‌کند.
        بنابراین err.message منبع اصلی پیام خطاست.
      */
      const detail = err?.response?.data?.detail;

      if (Array.isArray(detail)) {
        setValidationErrors(detail);
        setError(detail[0]?.msg || "اطلاعات ارسالی نامعتبر است.");
      } else {
        setError(err?.message || "خطا در تکمیل ثبت‌نام.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
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
            className="flex items-center gap-1 text-xs font-bold text-slate-400 transition hover:text-slate-600"
          >
            ← بازگشت به ثبت‌نام
          </button>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-xl font-extrabold text-slate-800">
            تأیید شماره موبایل
          </h1>

          <p className="mt-2 text-xs text-slate-500">
            کد ۶ رقمی ارسال‌شده به شماره{" "}
            <span className="font-bold text-slate-700">
              {userData?.phone}
            </span>{" "}
            را وارد کنید.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 p-4 text-xs font-semibold text-rose-600">
            {error}
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="mb-4 rounded-xl bg-rose-50 p-4 text-xs text-rose-600">
            <p className="mb-1 font-bold">جزئیات خطای اعتبارسنجی سرور:</p>

            <pre
              className="max-h-40 overflow-auto rounded-lg bg-rose-100 p-2 text-left text-[10px]"
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
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(event) => handleOtpChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={index === 0 ? handlePaste : undefined}
                aria-label={`رقم ${index + 1} کد تأیید`}
                className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 text-center text-lg font-bold outline-none transition focus:border-sky-500 focus:bg-white"
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>زمان باقی‌مانده: {formatTime(timer)}</span>

            <button
              type="button"
              disabled={timer > 0}
              onClick={handleResendOtp}
              className="font-bold text-sky-500 transition hover:text-sky-600 disabled:text-slate-400"
            >
              ارسال مجدد کد
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !userData}
            className="w-full rounded-2xl bg-sky-500 py-3.5 text-sm font-extrabold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "در حال تأیید..." : "تأیید و تکمیل ثبت‌نام"}
          </button>
        </form>
      </div>
    </div>
  );
}
