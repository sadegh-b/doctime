import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getDoctorById } from "../services/doctors";
import { createAppointment } from "../services/appointments";
import {
  getDoctorAvailability,
  type AvailabilitySlot,
} from "../services/availability";

import ReviewsList from "../components/ReviewsList";
import AddReviewForm from "../components/AddReviewForm";

import doctorPlaceholder from "../assets/images/doctor-placeholder.jpg";

import { MapPin, Info, ChevronLeft } from "lucide-react";

// تبدیل تاریخ میلادی به نمایش فارسی
const getPersianDateParts = (dateStr: string) => {
  try {
    const date = new Date(`${dateStr}T12:00:00`);

    return {
      weekday: new Intl.DateTimeFormat("fa-IR", {
        weekday: "long",
      }).format(date),
      dayMonth: new Intl.DateTimeFormat("fa-IR", {
        day: "numeric",
        month: "long",
      }).format(date),
    };
  } catch {
    return {
      weekday: "",
      dayMonth: dateStr,
    };
  }
};

export default function DoctorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const doctorId = Number(id);
  const isValidDoctorId = Number.isInteger(doctorId) && doctorId > 0;

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  const {
    data: doctor,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: () => getDoctorById(doctorId),
    enabled: isValidDoctorId,
  });

  const {
    data: availabilitySlots = [],
    isLoading: availabilityLoading,
  } = useQuery<AvailabilitySlot[]>({
    queryKey: ["availability", doctorId],
    queryFn: () => getDoctorAvailability(doctorId),
    enabled: isValidDoctorId,
  });

  const groupedByDate = useMemo(() => {
    const groups: Record<string, AvailabilitySlot[]> = {};

    availabilitySlots.forEach((slot) => {
      if (!slot.date) {
        return;
      }

      if (!groups[slot.date]) {
        groups[slot.date] = [];
      }

      groups[slot.date].push(slot);
    });

    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [availabilitySlots]);

  const activeDate = selectedDate || groupedByDate[0]?.[0] || "";

  const visibleSlots = useMemo(() => {
    const current = groupedByDate.find(([date]) => date === activeDate);

    if (!current) {
      return [];
    }

    return [...current[1]]
      .filter((slot) => !slot.is_booked)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [groupedByDate, activeDate]);

  const bookingMutation = useMutation({
    mutationFn: (availability_id: number) =>
      createAppointment({
        availability_id,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["availability", doctorId],
      });

      setSelectedSlotId(null);

      alert("✅ نوبت با موفقیت ثبت شد");
    },

    onError: (error: any) => {
      alert(error?.response?.data?.detail || "خطا در ثبت نوبت");
    },
  });

  const handleBooking = () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("ابتدا وارد حساب شوید");

      const returnTo = encodeURIComponent(location.pathname);
      navigate(`/login?redirect=${returnTo}`);

      return;
    }

    if (!selectedSlotId) {
      alert("یک ساعت انتخاب کنید");
      return;
    }

    bookingMutation.mutate(selectedSlotId);
  };

  if (!isValidDoctorId) {
    return <div className="p-10 text-center">شناسه پزشک معتبر نیست</div>;
  }

  if (isLoading) {
    return (
      <div className="p-10 text-center">در حال دریافت اطلاعات پزشک...</div>
    );
  }

  if (isError || !doctor) {
    return <div className="p-10 text-center">پزشک پیدا نشد</div>;
  }

  return (
    <div className="min-h-screen bg-[#4f86ff] pb-16 font-sans" dir="rtl">
      <div className="py-12 text-center text-white">
        <h1 className="text-4xl font-black">زمان نوبت‌دهی</h1>

        <p className="mt-3 text-lg opacity-90">زمان مناسب خود را انتخاب کنید</p>
      </div>

      <div className="mx-auto max-w-2xl px-4">
        <div className="overflow-hidden rounded-[3rem] bg-white pb-12 shadow-2xl">
          <div className="border-b p-8">
            <div className="mb-8 flex items-center justify-between">
              <ChevronLeft
                className="cursor-pointer text-gray-500"
                onClick={() => navigate(-1)}
              />

              <span className="text-xl font-black text-gray-800">
                انتخاب نوبت مطب
              </span>

              <div className="w-7" />
            </div>

            <div className="flex items-center gap-6">
              <img
                src={doctor.image || doctorPlaceholder}
                className="h-24 w-24 rounded-2xl object-cover"
                alt={doctor.name}
              />

              <div>
                <h2 className="text-3xl font-black text-gray-900">
                  {doctor.name}
                </h2>

                <p className="mt-2 font-bold text-blue-600">
                  {doctor.specialty_name}
                </p>

                <p className="mt-2 flex items-center gap-2 text-gray-500">
                  <MapPin size={18} />
                  {doctor.city || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 px-8">
            <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <Info className="text-blue-500" />

              <p className="leading-8 text-blue-900">
                <b>ملاحظات مطب:</b>
                <br />
                لطفاً قبل از مراجعه زمان رزرو شده را بررسی کنید.
              </p>
            </div>
          </div>

          <div className="mt-8 px-6">
            <div className="flex gap-4 overflow-x-auto">
              {groupedByDate.map(([date, slots]) => {
                const { weekday, dayMonth } = getPersianDateParts(date);
                const active = activeDate === date;
                const freeSlotsCount = slots.filter((slot) => !slot.is_booked).length;

                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedSlotId(null);
                    }}
                    className={`w-32 flex-shrink-0 rounded-2xl border-2 p-4 ${
                      active
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="text-xs text-gray-500">{weekday}</div>

                    <div className="mt-2 font-black">{dayMonth}</div>

                    <div className="mt-2 text-xs text-green-600">
                      {freeSlotsCount} نوبت
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 px-8">
            <h3 className="mb-5 text-lg font-black">
              نوبت‌های {getPersianDateParts(activeDate).dayMonth}
            </h3>

            {availabilityLoading ? (
              <p className="text-center">در حال دریافت زمان‌ها...</p>
            ) : visibleSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {visibleSlots.map((slot) => {
                  const selected = selectedSlotId === slot.id;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        setSelectedSlotId(slot.id);
                      }}
                      className={`rounded-2xl border py-5 font-black ${
                        selected
                          ? "bg-blue-600 text-white"
                          : "bg-white"
                      }`}
                    >
                      {slot.start_time.slice(0, 5)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-xl bg-yellow-50 p-5 text-center">
                نوبتی موجود نیست
              </p>
            )}
          </div>

          <div className="mt-10 px-8">
            <button
              type="button"
              onClick={handleBooking}
              disabled={bookingMutation.isPending || !selectedSlotId}
              className="w-full rounded-full bg-blue-600 py-6 text-xl font-black text-white shadow-xl transition hover:bg-blue-700 disabled:bg-gray-300"
            >
              {bookingMutation.isPending ? "در حال ثبت..." : "تأیید و ثبت نوبت"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-2xl px-4">
        <div className="rounded-[3rem] bg-white p-8">
          <h2 className="mb-6 border-b pb-4 text-2xl font-black">
            نظرات بیماران
          </h2>

          <ReviewsList doctorId={doctorId} />
          <AddReviewForm doctorId={doctorId} />
        </div>
      </div>
    </div>
  );
}
