import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Header from "../components/Header";
import Footer from "../components/Footer";

type SlotMap = Record<string, string[]>;

interface DoctorProfileData {
  id: string | number;
  name: string;
  specialty: string;
  city: string;
  fee: number;
  about: string;
  slots: SlotMap;
}

const mockDoctorData: DoctorProfileData = {
  id: "",
  name: "دکتر علی محمدی",
  specialty: "متخصص قلب و عروق",
  city: "تهران",
  fee: 150000,
  about:
    "دکتر علی محمدی با بیش از ۱۵ سال سابقه در حوزه پیشگیری و درمان بیماری‌های قلبی عروقی، فشار خون و نارسایی‌های قلبی آماده خدمت‌رسانی به شما عزیزان می‌باشند.",
  slots: {
    "شنبه (۷ تیر)": ["۰۹:۰۰", "۱۰:۳۰", "۱۶:۰۰", "۱۷:۳۰"],
    "یکشنبه (۸ تیر)": ["۱۱:۰۰", "۱۲:۳۰", "۱۸:۰۰", "۱۹:۳۰"],
    "دوشنبه (۹ تیر)": ["۰۹:۳۰", "۱۵:۰۰", "۱۶:۳۰"],
  },
};

function normalizeDoctorPayload(
  payload: any,
  fallbackSlots: SlotMap,
  doctorId?: string
): DoctorProfileData {
  const source = payload?.data ?? payload ?? {};

  const name = source.name ?? source.user_name;
  const specialty = source.specialty_name ?? source.specialty;

  if (!name || !specialty) {
    throw new Error("Invalid doctor payload: missing name or specialty");
  }

  return {
    id: source.id ?? doctorId ?? "",
    name,
    specialty,
    city: source.city ?? source.province ?? "تهران",
    fee: Number(source.consultation_fee ?? source.fee ?? source.visit_fee ?? 0) || 0,
    about: source.about ?? source.bio ?? "اطلاعاتی ثبت نشده است.",
    slots:
      source.slots && typeof source.slots === "object"
        ? source.slots
        : fallbackSlots,
  };
}

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<DoctorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDoctorDetail = async () => {
      if (!id) {
        console.error("Doctor id is missing from route params.");
        if (isMounted) {
          setDoctor(mockDoctorData);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setSelectedDay("");
        setSelectedTime("");
        setBookingStatus("");

        const res = await axiosClient.get(`/doctors/${id}`);

        const normalized = normalizeDoctorPayload(
          res.data,
          mockDoctorData.slots,
          id
        );

        if (!isMounted) return;
        setDoctor(normalized);
      } catch (err) {
        console.error("Failed to fetch doctor detail, using mock data.", err);
        if (isMounted) {
          setDoctor(mockDoctorData);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDoctorDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const currentDoctor = doctor ?? mockDoctorData;

  const handleBooking = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate(`/login?redirect=/doctor/${id}`);
      return;
    }

    if (!selectedDay || !selectedTime) {
      alert("لطفاً ابتدا روز و ساعت ویزیت را انتخاب کنید.");
      return;
    }

    if (!doctor) {
      alert("اطلاعات پزشک هنوز آماده نشده است.");
      return;
    }

    setBookingStatus("loading");

    setTimeout(() => {
      const existingAppointments = JSON.parse(
        localStorage.getItem("my_appointments") || "[]"
      );

      const newAppointment = {
        id: Date.now(),
        doctorName: doctor.name,
        specialty: doctor.specialty,
        day: selectedDay,
        time: selectedTime,
        status: "تایید شده",
      };

      localStorage.setItem(
        "my_appointments",
        JSON.stringify([newAppointment, ...existingAppointments])
      );
      setBookingStatus("success");
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-slate-500 font-bold">در حال دریافت اطلاعات پزشک...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      <Header />

      <main className="flex-grow max-w-6xl mx-auto px-4 py-10 w-full">
        {bookingStatus === "success" ? (
          <div className="bg-white p-10 rounded-[2.5rem] border border-emerald-100 shadow-2xl text-center max-w-lg mx-auto my-10 transition-all animate-in fade-in zoom-in duration-300">
            <span className="text-7xl block mb-6">✅</span>
            <h2 className="text-3xl font-black text-slate-800 mb-4">
              نوبت با موفقیت ثبت شد!
            </h2>
            <p className="text-slate-600 text-lg leading-8 mb-8">
              رزرو شما برای{" "}
              <span className="text-emerald-600 font-black">{currentDoctor.name}</span>{" "}
              در تاریخ <span className="font-bold">{selectedDay}</span> ساعت{" "}
              <span className="font-bold">{selectedTime}</span> ثبت گردید.
            </p>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => navigate("/appointments")}
                className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
              >
                مشاهده نوبت‌های من
              </button>
              <button
                onClick={() => {
                  setBookingStatus("");
                  setSelectedDay("");
                  setSelectedTime("");
                }}
                className="w-full bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all"
              >
                بازگشت
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-3xl font-black shadow-xl">
                  {currentDoctor.name.slice(0, 2)}
                </div>
                <div className="text-center md:text-right">
                  <h1 className="text-3xl font-black text-slate-800">
                    {currentDoctor.name}
                  </h1>
                  <p className="text-emerald-600 text-lg font-bold mt-2">
                    {currentDoctor.specialty}
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-slate-400">
                    <span>📍 {currentDoctor.city}</span>
                    <span>⭐ ۴.۹ (امتیاز کاربران)</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="font-black text-xl mb-6 text-slate-800 border-r-4 border-emerald-500 pr-4">
                  انتخاب زمان ویزیت
                </h3>

                <div className="mb-8">
                  <span className="block text-slate-500 font-bold mb-4">
                    ۱. روز مراجعه:
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {Object.keys(currentDoctor.slots).map((day) => (
                      <button
                        key={day}
                        onClick={() => {
                          setSelectedDay(day);
                          setSelectedTime("");
                        }}
                        className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                          selectedDay === day
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105"
                            : "bg-slate-100 text-slate-600 hover:bg-emerald-50"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedDay && currentDoctor.slots[selectedDay] && (
                  <div className="animate-in slide-in-from-right duration-300">
                    <span className="block text-slate-500 font-bold mb-4">
                      ۲. ساعت ملاقات:
                    </span>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {currentDoctor.slots[selectedDay].map((time: string) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-3 rounded-xl font-black transition-all ${
                            selectedTime === time
                              ? "bg-emerald-600 text-white"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl sticky top-24 space-y-6">
                <h3 className="font-black text-xl text-slate-800 border-b pb-4">
                  خلاصه رزرو
                </h3>
                <div className="space-y-4 text-slate-600">
                  <div className="flex justify-between">
                    <span>هزینه ویزیت:</span>
                    <span className="font-black text-slate-800">
                      {currentDoctor.fee.toLocaleString()} تومان
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>نوع نوبت:</span>
                    <span className="font-bold text-emerald-600">حضوری</span>
                  </div>
                </div>

                {selectedDay && selectedTime && (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 text-sm leading-7">
                    📅 نوبت برای <strong className="font-black">{selectedDay}</strong>{" "}
                    ساعت <strong className="font-black">{selectedTime}</strong>{" "}
                    تنظیم خواهد شد.
                  </div>
                )}

                <button
                  onClick={handleBooking}
                  disabled={bookingStatus === "loading"}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
                >
                  {bookingStatus === "loading" ? "در حال ثبت..." : "تایید و پرداخت"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
