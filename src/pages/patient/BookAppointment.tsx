import { useState } from "react";
import { AxiosError } from "axios";
import { CalendarDays, Loader2 } from "lucide-react";
import {
  createAppointment,
  type CreateAppointmentPayload,
} from "../../services/appointments";

interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;

    if (data?.detail) {
      return data.detail;
    }

    if (data?.message) {
      return data.message;
    }

    if (error.code === "ECONNABORTED") {
      return "سرور خیلی دیر پاسخ داد. دوباره تلاش کن.";
    }

    return error.message || "خطا در ارتباط با سرور";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "خطای ناشناخته رخ داده است.";
}

export default function BookAppointment() {
  const [availabilityId, setAvailabilityId] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setMessage("");
    setErrorMessage("");

    const normalizedAvailabilityId = Number(availabilityId);

    if (!normalizedAvailabilityId || normalizedAvailabilityId <= 0) {
      setErrorMessage("شناسه سانس معتبر نیست.");
      return;
    }

    const payload: CreateAppointmentPayload = {
      availability_id: normalizedAvailabilityId,
      notes: notes.trim() || undefined,
    };

    try {
      setLoading(true);

      const response = await createAppointment(payload);

      setMessage(
        response.message ||
          `نوبت با موفقیت ثبت شد. کد نوبت: ${response.appointment_id}`
      );

      setAvailabilityId("");
      setNotes("");
    } catch (error) {
      const apiMessage = getErrorMessage(error);

      if (apiMessage.includes("موجودی کیف پول") || apiMessage.includes("کافی نیست")) {
        setErrorMessage("موجودی کیف پول شما کافی نیست.");
      } else {
        setErrorMessage(apiMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-5">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <CalendarDays className="text-cyan-600" size={28} />
            <h1 className="text-2xl font-black text-slate-900">
              رزرو نوبت پزشک
            </h1>
          </div>

          <p className="mt-4 text-slate-600">
            برای تست سریع، شناسه سانس را وارد کن و نوبت را ثبت کن.
          </p>

          <div className="mt-6 grid gap-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                شناسه سانس
              </label>
              <input
                type="number"
                min="1"
                value={availabilityId}
                onChange={(event) => setAvailabilityId(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500"
                placeholder="مثلاً 15"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                توضیحات
              </label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="min-h-[120px] w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500"
                placeholder="مثلاً بیمار دارای سابقه..."
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "در حال ثبت نوبت..." : "ثبت نوبت"}
            </button>
          </div>

          {message && (
            <div className="mt-5 rounded-2xl bg-green-50 p-4 font-bold text-green-700">
              {message}
            </div>
          )}

          {errorMessage && (
            <div className="mt-5 rounded-2xl bg-red-50 p-4 font-bold text-red-700">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
