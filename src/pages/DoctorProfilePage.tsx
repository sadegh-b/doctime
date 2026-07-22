// مسیر فایل: src/pages/DoctorProfilePage.tsx

import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDoctorById, createAppointment } from "../services/doctors";
import ReviewsList from "../components/ReviewsList";
import AddReviewForm from "../components/AddReviewForm";
import api from "../services/api";
import doctorPlaceholder from "../assets/images/doctor-placeholder.jpg";
import { MapPin, Info, ChevronLeft } from "lucide-react";

interface AvailabilitySlot {
  id: number;
  doctor_id?: number;
  date: string;
  start_time: string;
  end_time: string;
  is_booked?: boolean;
}

// اصلاح تابع کمکی مبدل تاریخ میلادی به جلالی با تنظیم ساعت روی ظهر برای جلوگیری از باگ Timezone Offset
const getPersianDateParts = (dateStr: string) => {
  if (!dateStr) return { weekday: "", dayMonth: "" };
  try {
    // اتصال ساعت ۱۲ ظهر به انتهای رشته تاریخ برای جلوگیری از خطای عقب/جلو رفتن روز در سیستم‌های مختلف
    const date = new Date(`${dateStr}T12:00:00`);
    const weekday = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(date);
    const dayMonth = new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long' }).format(date);
    return { weekday, dayMonth };
  } catch (e) {
    return { weekday: "نامشخص", dayMonth: dateStr };
  }
};

export default function DoctorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const doctorId = Number(id);
  const queryClient = useQueryClient();

  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentUserProfile, setCurrentUserProfile] = useState<{ name?: string } | null>(null);

  // بررسی وضعیت لاگین و دریافت اطلاعات پروفایل کاربر برای ارسال نام او به صورت خودکار
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          // دریافت اطلاعات کاربری که لاگین کرده است
          const response = await api.get("/users/me");
          setCurrentUserProfile(response.data);
        } catch (error) {
          console.error("خطا در دریافت اطلاعات کاربری:", error);
        }
      }
    };
    fetchUserProfile();
  }, []);

  const { data: doctor, isLoading, isError } = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: () => getDoctorById(doctorId),
    enabled: !Number.isNaN(doctorId),
  });

  const { data: availabilitySlots = [], isLoading: availabilityLoading } = useQuery<AvailabilitySlot[]>({
    queryKey: ["availability", doctorId],
    queryFn: async () => {
      const response = await api.get(`/availability?doctor_id=${doctorId}`);
      return Array.isArray(response.data) ? response.data : response.data.items ?? [];
    },
    enabled: !Number.isNaN(doctorId),
  });

  // گروه‌بندی اسلات‌ها بر اساس تاریخ
  const groupedByDate = useMemo(() => {
    const groups: Record<string, AvailabilitySlot[]> = {};
    availabilitySlots.forEach(slot => {
      if (!slot.date) return;
      if (!groups[slot.date]) groups[slot.date] = [];
      groups[slot.date].push(slot);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [availabilitySlots]);

  const activeDate = selectedDate || (groupedByDate[0] ? groupedByDate[0][0] : "");

  const visibleSlots = useMemo(() => {
    const group = groupedByDate.find(([dateStr]) => dateStr === activeDate);
    if (!group) return [];
    return group[1].sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [groupedByDate, activeDate]);

  const bookingMutation = useMutation({
    mutationFn: (params: { availability_id: number; patient_name: string }) => createAppointment(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability", doctorId] });
      setSelectedSlotId(null);
      alert("✅ نوبت شما با موفقیت ثبت شد.");
    },
    onError: (err: any) => {
      alert(`❌ خطا: ${err?.response?.data?.detail || "مشکلی پیش آمد"}`);
    }
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("لطفا ابتدا وارد حساب کاربری خود شوید.");
      navigate("/login");
      return;
    }
    if (!selectedSlotId) {
      alert("لطفاً یک ساعت جهت رزرو انتخاب کنید.");
      return;
    }

    // ارسال نام کاربر لاگین شده به صورت خودکار یا ارسال یک نام پیش‌فرض در صورت عدم دریافت
    const patientName = currentUserProfile?.name || "بیمار ثبت‌شده";

    bookingMutation.mutate({
      availability_id: selectedSlotId,
      patient_name: patientName
    });
  };

  if (isLoading) return <div className="p-10 text-center text-white text-lg">در حال بارگذاری اطلاعات پزشک...</div>;
  if (isError || !doctor) return <div className="p-10 text-center text-white text-lg">پزشک مورد نظر یافت نشد.</div>;

  return (
    <div className="min-h-screen bg-[#4f86ff] pb-16 font-sans" dir="rtl">
      {/* هدر صفحه */}
      <div className="text-center text-white py-12">
        <h1 className="text-4xl font-black">زمان نوبت‌دهی</h1>
        <p className="mt-3 text-lg opacity-90">زمان نوبت مد نظر خود را انتخاب کنید</p>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* بدنه اصلی کارت نوبت‌دهی */}
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden pb-12">

          {/* اطلاعات پزشک */}
          <div className="p-8 border-b border-gray-100">
             <div className="flex items-center justify-between mb-8">
                <ChevronLeft className="text-gray-500 cursor-pointer w-7 h-7" onClick={() => navigate(-1)} />
                <span className="font-extrabold text-gray-800 text-xl">انتخاب نوبت مطب</span>
                <div className="w-7"></div>
             </div>

             <div className="flex gap-6 items-center">
                <img
                  src={doctor?.image || doctorPlaceholder}
                  className="w-24 h-24 rounded-2xl object-cover border border-gray-100 shadow-sm"
                  alt={doctor?.name}
                />
                <div>
                  <h2 className="font-black text-3xl text-gray-900">{doctor?.name}</h2>
                  <p className="text-blue-600 text-lg font-bold mt-1.5">{doctor?.specialty}</p>
                  <p className="text-gray-500 text-base mt-2 flex items-center gap-1.5">
                    <MapPin size={18} className="text-gray-400" /> {doctor?.city}
                  </p>
                </div>
             </div>
          </div>

          {/* ملاحظات مطب */}
          <div className="px-8 mt-6">
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex gap-4">
              <Info className="text-blue-500 shrink-0 mt-0.5" size={24} />
              <p className="text-base text-blue-900 leading-8">
                <span className="font-black">ملاحظات مطب:</span> بیماران محترم توجه فرمایید: معاینات معمولی مانند سوزش چشم، خارش و جسم خارجی پذیرفته می‌شود.
              </p>
            </div>
          </div>

          {/* اسلایدر تاریخ‌ها */}
          <div className="mt-8 px-6">
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3">
              {groupedByDate.map(([dateStr, slots]) => {
                const { weekday, dayMonth } = getPersianDateParts(dateStr);
                const isActive = activeDate === dateStr;
                const availableCount = slots.filter(s => !s.is_booked).length;

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => { setSelectedDate(dateStr); setSelectedSlotId(null); }}
                    className={`flex-shrink-0 w-32 p-4 rounded-2xl border-2 transition-all duration-200 text-center ${
                      isActive
                        ? "border-blue-500 bg-blue-50/50 shadow-sm scale-95"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="text-xs text-gray-400 font-bold">{weekday}</div>
                    <div className="text-base font-black text-gray-900 my-1">{dayMonth}</div>
                    <div className="text-xs text-green-600 font-black">
                       {availableCount} نوبت
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* گرید ساعت‌ها */}
          <div className="px-8 mt-8">
            <h3 className="text-right text-gray-900 font-black text-lg mb-6 flex items-center gap-2">
              <span className="w-2.5 h-6 bg-blue-500 rounded-full"></span>
              نوبت‌های {getPersianDateParts(activeDate).weekday} {getPersianDateParts(activeDate).dayMonth}
            </h3>

            {availabilityLoading ? (
              <p className="text-center text-lg text-gray-400 py-6">در حال دریافت ساعت‌ها...</p>
            ) : visibleSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {visibleSlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  const timeStr = slot.start_time.slice(0, 5);
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={slot.is_booked}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`py-5 px-4 rounded-2xl border text-base font-black transition-all text-center ${
                        slot.is_booked
                          ? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed"
                          : isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-md scale-95"
                            : "bg-white text-gray-800 border-gray-200 hover:border-blue-400"
                      }`}
                    >
                      {timeStr}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-base text-amber-600 bg-amber-50 rounded-xl py-5">
                در این تاریخ هیچ نوبت فعالی پیدا نشد.
              </p>
            )}
          </div>

          {/* بخش دکمه نهایی - فیلد نام بیمار کاملاً حذف شد */}
          <div className="px-8 mt-10">
            <form onSubmit={handleBookingSubmit}>
              <button
                type="submit"
                disabled={bookingMutation.isPending || !selectedSlotId}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-full font-black text-xl shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:bg-gray-200 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {bookingMutation.isPending ? "در حال ثبت اطلاعات..." : "تأیید و ثبت نوبت"}
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* بخش نظرات بیماران */}
      <div className="max-w-2xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-[3rem] p-8 shadow-sm">
           <h2 className="text-2xl font-black text-gray-900 mb-6 border-b pb-4">نظرات بیماران</h2>
           <ReviewsList doctorId={doctorId} />
           <AddReviewForm doctorId={doctorId} />
        </div>
      </div>
    </div>
  );
}
