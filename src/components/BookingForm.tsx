import React, { useState } from "react";
import { createAppointment } from "../services/appointments";
import { AxiosError } from "axios";

interface TimeSlot {
  id: number;
  time: string;
}

type Props = {
  doctorId: number;
  doctorName?: string;
  availableSlots: TimeSlot[];
};

interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

export default function BookingForm({
  doctorId,
  doctorName = "پزشک",
  availableSlots
}: Props) {
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasAvailableSlots = availableSlots.length > 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!hasAvailableSlots) {
      setErrorMessage("در حال حاضر زمان خالی برای رزرو وجود ندارد.");
      return;
    }

    if (selectedSlotId === null) {
      setErrorMessage("لطفاً یک زمان برای نوبت خود انتخاب کنید.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      // ارسال مستقیم اطلاعات بر اساس قرارداد API بک‌اند
      await createAppointment({
        doctor_id: doctorId,
        availability_id: selectedSlotId,
        notes: notes.trim() || undefined
      });

      setSuccess(true);
    } catch (error: unknown) {
      console.error("Booking Error:", error);
      let serverMessage = "متأسفانه خطایی در ثبت نوبت رخ داد.";

      if (error instanceof AxiosError) {
        const data = error.response?.data as ApiErrorResponse;
        serverMessage =
          data?.detail ||
          data?.message ||
          error.message ||
          serverMessage;
      }

      setErrorMessage(serverMessage);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="p-6 bg-green-50 rounded-xl text-green-800 border border-green-200 shadow-sm animate-in fade-in duration-500">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">✅</span>
          <h3 className="font-bold">ثبت موفقیت‌آمیز</h3>
        </div>
        <p className="text-sm">
          نوبت شما برای <strong>{doctorName}</strong> با موفقیت در سیستم رزرو شد.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setSelectedSlotId(null);
            setNotes("");
          }}
          className="mt-4 text-xs text-green-700 underline hover:text-green-900"
        >
          ثبت نوبت جدید
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-md space-y-5 border border-slate-100 transition-all"
    >
      <div className="border-b pb-3">
        <h3 className="text-lg font-bold text-slate-800">
          رزرو نوبت: {doctorName}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          لطفاً جزئیات و زمان نوبت خود را مشخص کنید.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 font-medium flex gap-2 items-center">
          <span>⚠️</span>
          {errorMessage}
        </div>
      )}

      {!hasAvailableSlots && (
        <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200">
          متأسفانه در حال حاضر نوبت خالی یافت نشد.
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold mb-2 text-slate-700">
          علت مراجعه (اختیاری)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
          placeholder="مثلاً: چکاپ سالیانه یا علائم بیماری..."
          rows={3}
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 text-slate-700">
          انتخاب زمان نوبت
        </label>
        <select
          value={selectedSlotId || ""}
          onChange={(e) => setSelectedSlotId(Number(e.target.value))}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
          disabled={loading || !hasAvailableSlots}
        >
          <option value="">-- یک زمان را انتخاب کنید --</option>
          {availableSlots.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {slot.time}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading || !hasAvailableSlots || !selectedSlotId}
        className={`w-full py-3 rounded-lg text-white font-bold transition-all shadow-lg shadow-cyan-100 ${
          loading || !hasAvailableSlots || !selectedSlotId
            ? "bg-slate-300 cursor-not-allowed"
            : "bg-cyan-600 hover:bg-cyan-700 active:scale-[0.98]"
        }`}
      >
        {loading ? "در حال پردازش..." : "تأیید و ثبت نوبت"}
      </button>
    </form>
  );
}
