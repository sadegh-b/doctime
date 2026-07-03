// مسیر: src/pages/DoctorProfilePage.tsx

import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getDoctorById,
  createAppointment,
} from "../services/doctors";

import ReviewsList from "../components/ReviewsList";
import AddReviewForm from "../components/AddReviewForm";

import api from "../services/api";

interface AvailabilitySlot {
  id: number;
  doctor_id?: number;
  start_time?: string;
  end_time?: string;
  is_booked?: boolean;
}

export default function DoctorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const doctorId = Number(id);

  const queryClient = useQueryClient();

  /* -----------------------------
     فرم رزرو
  ------------------------------*/

  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [patientName, setPatientName] = useState("");

  /* -----------------------------
     دریافت اطلاعات پزشک
  ------------------------------*/

  const {
    data: doctor,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: () => getDoctorById(doctorId),
    enabled: !Number.isNaN(doctorId),
  });

  /* -----------------------------
     دریافت availability
  ------------------------------*/

  const {
    data: availabilitySlots = [],
    isLoading: availabilityLoading,
  } = useQuery<AvailabilitySlot[]>({
    queryKey: ["availability", doctorId],
    queryFn: async () => {
      const response = await api.get(`/availability?doctor_id=${doctorId}`);
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data.items ?? [];
    },
    enabled: !Number.isNaN(doctorId),
  });

  /* -----------------------------
     رزرو نوبت
  ------------------------------*/

  const bookingMutation = useMutation({
    mutationFn: (params: { availability_id: number; patient_name: string }) =>
      createAppointment(params),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["availability", doctorId],
      });
      setSelectedSlotId(null);
      setPatientName("");
      alert("✅ نوبت شما با موفقیت ثبت شد.");
    },

    onError: (err: any) => {
      console.error("BOOKING ERROR =>", err);
      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "خطای نامشخص";
      alert(`❌ خطا در ثبت نوبت: ${backendMessage}`);
    },
  });

  /* -----------------------------
     ثبت فرم رزرو
  ------------------------------*/

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("برای رزرو نوبت ابتدا باید وارد حساب کاربری شوید.");
      navigate("/login");
      return;
    }

    if (!patientName.trim()) {
      alert("لطفاً نام بیمار را وارد کنید.");
      return;
    }

    if (!selectedSlotId) {
      alert("لطفاً یک زمان انتخاب کنید.");
      return;
    }

    bookingMutation.mutate({
      availability_id: selectedSlotId,
      patient_name: patientName.trim(),
    });
  };

  /* -----------------------------
     Loading
  ------------------------------*/

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (isError || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p>
          {error instanceof Error ? error.message : "پزشک پیدا نشد"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm p-8 space-y-8">
        {/* اطلاعات پزشک */}
        <div className="flex gap-6 items-center border-b pb-6">
          <img
            src={
              doctor.image ||
              "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150"
            }
            alt={doctor.name}
            className="w-28 h-28 rounded-xl object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold">{doctor.name}</h1>
            <p className="text-blue-600">{doctor.specialty}</p>
            <p className="text-sm text-gray-500">📍 {doctor.city}</p>
          </div>
        </div>

        {/* رزرو نوبت */}
        <div className="bg-slate-50 p-6 rounded-2xl">
          <h2 className="text-lg font-bold mb-4">رزرو نوبت آنلاین</h2>

          <form onSubmit={handleBookingSubmit} className="space-y-6">
            {/* نام بیمار */}
            <input
              type="text"
              placeholder="نام بیمار"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            />

            {/* لیست نوبت‌ها */}
            {availabilityLoading ? (
              <p>در حال دریافت نوبت‌ها...</p>
            ) : availabilitySlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {availabilitySlots.map((slot) => {
                  const start = slot.start_time?.slice(0, 5);
                  const end = slot.end_time?.slice(0, 5);
                  return (
                    <button
                      type="button"
                      key={slot.id}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`border py-3 rounded-xl text-sm ${
                        selectedSlotId === slot.id
                          ? "bg-blue-600 text-white"
                          : "bg-white"
                      }`}
                    >
                      {start} - {end}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-amber-600 text-sm">نوبت آزادی وجود ندارد</p>
            )}

            {/* دکمه ثبت */}
            <button
              type="submit"
              disabled={bookingMutation.isPending}
              className="w-full bg-blue-600 text-white py-3 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {bookingMutation.isPending ? "در حال ثبت..." : "تأیید و ثبت نوبت"}
            </button>
          </form>
        </div>

        {/* نظرات */}
        <div>
          <h2 className="text-xl font-bold mb-4">نظرات بیماران</h2>
          <ReviewsList doctorId={doctorId} />
          <AddReviewForm doctorId={doctorId} />
        </div>
      </div>
    </div>
  );
}
