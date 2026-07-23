// frontend/src/pages/Patient/DoctorSlots.tsx

import { useEffect, useState } from "react";
import { getAvailableSlots } from "../../services/availability";
import { bookAppointment } from "../../services/appointment";

// تعریف اینترفیس دقیق برای تایپ اسلات‌ها
export interface Slot {
  id: number;
  slot_date: string;
  slot_start_time: string;
  slot_end_time: string;
  is_booked?: boolean;
}

interface DoctorSlotsProps {
  doctorId: number;
}

export default function DoctorSlots({ doctorId }: DoctorSlotsProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // ذخیره آیدی اسلاتی که در حال رزرو شدن است برای نمایش لودینگ روی همان دکمه
  const [bookingSlotId, setBookingSlotId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await getAvailableSlots(doctorId);
      // هندل کردن احتمال ارسال مقدار خالی یا نامعتبر از بک‌اند
      setSlots(res?.items || []);
    } catch (err) {
      console.error("Error fetching slots:", err);
      setErrorMsg("خطا در دریافت لیست نوبت‌های پزشک. لطفاً صفحه را مجدداً بارگذاری کنید.");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (slotId: number) => {
    // جلوگیری از ارسال چندباره درخواست
    if (bookingSlotId !== null) return;

    try {
      setBookingSlotId(slotId);
      await bookAppointment(slotId);
      alert("نوبت با موفقیت رزرو شد!");
      // بارگذاری مجدد اسلات‌ها برای همگام‌سازی دیتابیس
      await fetchSlots();
    } catch (err) {
      console.error("Booking error:", err);
      alert("خطا در فرآیند رزرو نوبت. ممکن است این نوبت قبلاً رزرو شده باشد.");
    } finally {
      setBookingSlotId(null);
    }
  };

  useEffect(() => {
    if (doctorId) {
      fetchSlots();
    }
  }, [doctorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <span className="mr-3 text-slate-600 text-sm">در حال بارگذاری نوبت‌ها...</span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm my-4">
        {errorMsg}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 max-w-2xl mx-auto dir-rtl">
      <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-3">
        نوبت‌های در دسترس پزشک
      </h2>

      {slots.length === 0 ? (
        <p className="text-slate-500 text-center py-8">هیچ نوبت خالی برای این پزشک یافت نشد.</p>
      ) : (
        <div className="space-y-4">
          {slots.map((slot: Slot) => {
            const isThisSlotBooking = bookingSlotId === slot.id;

            return (
              <div
                key={slot.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-slate-200 rounded-lg hover:border-emerald-300 transition-colors"
              >
                <div className="space-y-2 mb-3 sm:mb-0">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="font-bold text-slate-800">تاریخ:</span>
                    <span>{slot.slot_date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="font-bold text-slate-800">زمان:</span>
                    <span className="dir-ltr text-left">
                      {slot.slot_start_time} - {slot.slot_end_time}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleBook(slot.id)}
                  disabled={bookingSlotId !== null}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-medium text-sm rounded-lg shadow-sm transition-colors duration-200 flex items-center justify-center min-w-[120px]"
                >
                  {isThisSlotBooking ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "رزرو نوبت"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
