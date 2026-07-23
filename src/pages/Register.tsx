// Path: doctime-frontend/src/pages/Register.tsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/auth";
import type { RegisterPayload, WorkShift } from "../services/auth";
import api from "../services/api";
import { specialties } from "../data/specialties";

interface DynamicSpecialty {
  id: number;
  name: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [backendSpecialties, setBackendSpecialties] = useState<DynamicSpecialty[]>([]);

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [email, setEmail] = useState("");

  // Doctor Fields
  const [medicalCouncilNumber, setMedicalCouncilNumber] = useState("");
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>("");
  const [subSpecialty, setSubSpecialty] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [consultationFee, setConsultationFee] = useState("");

  // Doctor Scheduling
  const [workShift, setWorkShift] = useState<WorkShift>("morning");

  // سخت‌گیری: تضمین می‌کنیم که استیت کاملاً خالی شروع شود تا روزهای انگلیسیِ پیش‌فرض وارد آن نشوند
  const [workDays, setWorkDays] = useState<string[]>([]);

  const [morningStart, setMorningStart] = useState("08:00");
  const [morningEnd, setMorningEnd] = useState("12:00");
  const [afternoonStart, setAfternoonStart] = useState("16:00");
  const [afternoonEnd, setAfternoonEnd] = useState("20:00");

  // لیست روزهای مجاز فارسی
  const availableDays = [
    { value: "شنبه", label: "شنبه" },
    { value: "یکشنبه", label: "یکشنبه" },
    { value: "دوشنبه", label: "دوشنبه" },
    { value: "سه‌شنبه", label: "سه‌شنبه" },
    { value: "چهارشنبه", label: "چهارشنبه" },
    { value: "پنج‌شنبه", label: "پنج‌شنبه" },
    { value: "جمعه", label: "جمعه" },
  ];

  const toEnglishDigits = (str: string): string => {
    return str.replace(/[٠-٩]/g, (d) => (d.charCodeAt(0) - 1632).toString())
              .replace(/[۰-۹]/g, (d) => (d.charCodeAt(0) - 1776).toString());
  };

  useEffect(() => {
    async function loadSpecialties() {
      try {
        // تلاش برای دریافت تخصص‌ها از بک‌اند
        const response = await api.get<DynamicSpecialty[]>("/specialties");
        if (Array.isArray(response.data)) {
          setBackendSpecialties(response.data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.warn("Could not fetch specialties dynamically, using fallback data.", err);
        const fallbackMapped: DynamicSpecialty[] = specialties.map((item, index) => ({
          id: index + 1,
          name: item.label
        }));
        setBackendSpecialties(fallbackMapped);
      }
    }
    loadSpecialties();
  }, []);

  const handleDayCheckboxChange = (dayValue: string) => {
    if (workDays.includes(dayValue)) {
      setWorkDays(workDays.filter((d) => d !== dayValue));
    } else {
      setWorkDays([...workDays, dayValue]);
    }
  };

  const validateDoctorFields = (): string | null => {
    if (!medicalCouncilNumber.trim()) return "کد نظام پزشکی الزامی است.";
    if (!selectedSpecialtyId) return "انتخاب تخصص الزامی است.";

    const parsedSpecialtyId = Number(toEnglishDigits(selectedSpecialtyId));
    if (isNaN(parsedSpecialtyId) || parsedSpecialtyId <= 0) {
      return "شناسه تخصص انتخاب‌شده نامعتبر است.";
    }

    if (!province.trim()) return "استان الزامی است.";
    if (!city.trim()) return "شهر الزامی است.";
    if (!address.trim()) return "آدرس مطب الزامی است.";

    if (experienceYears.trim()) {
      const exp = Number(toEnglishDigits(experienceYears));
      if (isNaN(exp) || exp < 0) return "سابقه کار باید عدد معتبر باشد.";
    }

    if (consultationFee.trim()) {
      const fee = Number(toEnglishDigits(consultationFee));
      if (isNaN(fee) || fee < 0) return "هزینه ویزیت باید عدد معتبر باشد.";
    }

    if (workDays.length === 0) {
      return "حداقل انتخاب یک روز کاری برای پزشک الزامی است.";
    }

    if (workShift === "morning" || workShift === "both") {
      if (!morningStart || !morningEnd) return "تعیین زمان شروع و پایان شیفت صبح الزامی است.";
    }
    if (workShift === "afternoon" || workShift === "both") {
      if (!afternoonStart || !afternoonEnd) return "تعیین زمان شروع و پایان شیفت عصر الزامی است.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("نام و نام خانوادگی الزامی است.");
    if (!phone.trim()) return setError("شماره موبایل الزامی است.");
    if (password.length < 6) return setError("رمز عبور باید حداقل ۶ کاراکتر باشد.");

    const cleanPhone = toEnglishDigits(phone.trim());
    if (!/^09\d{9}$/.test(cleanPhone)) {
      return setError("فرمت شماره موبایل نامعتبر است (باید با ۰۹ شروع شده و ۱۱ رقم باشد).");
    }

    const cleanNationalId = nationalId.trim() ? toEnglishDigits(nationalId.trim()) : "";
    if (cleanNationalId && !/^\d{10}$/.test(cleanNationalId)) {
      return setError("کد ملی باید دقیقا ۱۰ رقم باشد.");
    }

    let payload: RegisterPayload = {
      name: name.trim(),
      phone: cleanPhone,
      password: password,
      role: role,
      national_id: cleanNationalId || null, // اصلاح: اگر خالی بود null بفرست یا اگر بک‌اند سخت‌گیر است همان cleanNationalId را بفرست.
      email: email.trim() || null,
    };

    if (role === "doctor") {
      const doctorValidationError = validateDoctorFields();
      if (doctorValidationError) {
        setError(doctorValidationError);
        return;
      }

      const activeSpecialty = backendSpecialties.find(
        (s) => s.id === Number(toEnglishDigits(selectedSpecialtyId))
      );

      // فیلتر نهایی سخت‌گیرانه: حذف هر نوع نام روز انگلیسی احتمالی که به استیت نفوذ کرده است
      const persianOnlyWorkDays = workDays.filter(day =>
        availableDays.map(d => d.value).includes(day)
      );

      payload = {
        ...payload,
        medical_council_number: toEnglishDigits(medicalCouncilNumber.trim()),
        specialty_id: Number(toEnglishDigits(selectedSpecialtyId)),
        specialty: activeSpecialty ? activeSpecialty.name : "Internal Medicine",
        sub_specialty: subSpecialty.trim() || null,
        province: province.trim(),
        city: city.trim(),
        address: address.trim(),
        bio: bio.trim() || null,
        experience_years: experienceYears.trim() ? Number(toEnglishDigits(experienceYears)) : null,
        consultation_fee: consultationFee.trim() ? Number(toEnglishDigits(consultationFee)) : null,
        work_shift: workShift,
        work_days: persianOnlyWorkDays, // تضمین ۱۰۰٪ برای ارسال فقط روزهای فارسی
        morning_start: (workShift === "morning" || workShift === "both") ? morningStart : null,
        morning_end: (workShift === "morning" || workShift === "both") ? morningEnd : null,
        afternoon_start: (workShift === "afternoon" || workShift === "both") ? afternoonStart : null,
        afternoon_end: (workShift === "afternoon" || workShift === "both") ? afternoonEnd : null,
      };
    }

    setLoading(true);
    console.log("Register payload:", JSON.stringify(payload, null, 2));

    try {
      await register(payload);
      setSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "ثبت‌نام با خطا مواجه شد.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8" dir="rtl">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          ایجاد حساب کاربری در داک‌تایم
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

          <div className="flex border-b border-gray-200 mb-6">
            <button
              type="button"
              className={`w-1/2 pb-3 font-semibold text-center ${
                role === "patient" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
              }`}
              onClick={() => { setRole("patient"); setError(null); }}
            >
              من بیمار هستم
            </button>
            <button
              type="button"
              className={`w-1/2 pb-3 font-semibold text-center ${
                role === "doctor" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
              }`}
              onClick={() => { setRole("doctor"); setError(null); }}
            >
              من پزشک هستم
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-r-4 border-red-500 p-4 mb-4 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-r-4 border-green-500 p-4 mb-4 text-green-700 text-sm rounded">
              ثبت‌نام با موفقیت انجام شد. در حال انتقال به صفحه اصلی...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">نام و نام خانوادگی *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">شماره موبایل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 09123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">کد ملی (اختیاری)</label>
                <input
                  type="text"
                  maxLength={10}
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ایمیل (اختیاری)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">رمز عبور *</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-left"
                dir="ltr"
              />
            </div>

            {role === "doctor" && (
              <div className="border-t border-gray-200 pt-6 space-y-6">
                <h3 className="text-lg font-medium text-gray-900">اطلاعات تخصصی پزشک</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">شماره نظام پزشکی *</label>
                    <input
                      type="text"
                      required
                      value={medicalCouncilNumber}
                      onChange={(e) => setMedicalCouncilNumber(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-left"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">تخصص اصلی *</label>
                    <select
                      required
                      value={selectedSpecialtyId}
                      onChange={(e) => setSelectedSpecialtyId(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">انتخاب تخصص...</option>
                      {backendSpecialties.map((spec) => (
                        <option key={spec.id} value={spec.id}>
                          {spec.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">فوق تخصص / فلوشیپ (اختیاری)</label>
                  <input
                    type="text"
                    value={subSpecialty}
                    onChange={(e) => setSubSpecialty(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">استان *</label>
                    <input
                      type="text"
                      required
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">شهر *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">آدرس دقیق مطب *</label>
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">سابقه کار (سال)</label>
                    <input
                      type="text"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-left"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">هزینه ویزیت (تومان)</label>
                    <input
                      type="text"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">بیوگرافی / معرفی کوتاه</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">روزها و شیفت‌های کاری</h4>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">روزهای کاری پزشک *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableDays.map((day) => (
                        <label key={day.value} className="inline-flex items-center space-x-2 space-x-reverse text-sm">
                          <input
                            type="checkbox"
                            checked={workDays.includes(day.value)}
                            onChange={() => handleDayCheckboxChange(day.value)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="mr-2">{day.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">نوع شیفت کاری *</label>
                    <select
                      value={workShift}
                      onChange={(e) => setWorkShift(e.target.value as WorkShift)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="morning">شیفت صبح</option>
                      <option value="afternoon">شیفت عصر</option>
                      <option value="both">هر دو شیفت</option>
                    </select>
                  </div>

                  {(workShift === "morning" || workShift === "both") && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">شروع شیفت صبح *</label>
                        <input
                          type="time"
                          value={morningStart}
                          onChange={(e) => setMorningStart(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">پایان شیفت صبح *</label>
                        <input
                          type="time"
                          value={morningEnd}
                          onChange={(e) => setMorningEnd(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {(workShift === "afternoon" || workShift === "both") && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">شروع شیفت عصر *</label>
                        <input
                          type="time"
                          value={afternoonStart}
                          onChange={(e) => setAfternoonStart(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">پایان شیفت عصر *</label>
                        <input
                          type="time"
                          value={afternoonEnd}
                          onChange={(e) => setAfternoonEnd(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? "در حال ارسال..." : "ثبت‌نام"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            قبلاً ثبت‌نام کرده‌اید؟{" "}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              وارد شوید
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
