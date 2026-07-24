// Path: frontend/src/pages/Doctors.tsx

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  SlidersHorizontal,
  RotateCcw,
  Search,
  ChevronDown
} from "lucide-react";
import DoctorCard, { DoctorCardSkeleton } from "../components/DoctorCard";
import type { Doctor } from "../services/doctors";

// ایمپورت کردن دیتای استان‌ها و شهرهای ایران
import { PROVINCES_CITIES } from "../data/provinces";

// ایمپورت کردن لیست ۵۰ تخصص و تابع کمکی ترجمه از آدرس جدید
import { specialties, specialtyValueToLabel } from "../data/specialties";

interface DoctorApiResponse {
  success: boolean;
  count: number;
  items: Doctor[];
}

export default function Doctors() {
  // ۱. حالت‌های مربوط به فیلترها (Filter States)
  const [inPerson, setInPerson] = useState(false);
  const [online, setOnline] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState(""); // مقدار انگلیسی تخصص را نگه می‌دارد
  const [gender, setGender] = useState<"all" | "male" | "female">("all");
  const [sortBy, setSortBy] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");

  // ۲. دریافت لیست پزشکان از بک‌اند با react-query
  const { data: doctorsData, isLoading, error } = useQuery({
    queryKey: ["doctors-list"],
    queryFn: async () => {
      const response = await axios.get("http://127.0.0.1:8000/api/v1/doctors");
      return response.data as DoctorApiResponse;
    },
  });

  // استخراج امن آرایه پزشکان از پاسخ سرور
  const doctorsList: Doctor[] = Array.isArray(doctorsData)
    ? doctorsData
    : Array.isArray(doctorsData?.items)
    ? doctorsData.items
    : [];

  // ۳. پیدا کردن شهرهای مربوط به استان انتخاب شده
  const availableCities = useMemo(() => {
    if (!selectedProvince) return [];
    const provinceObj = PROVINCES_CITIES.find((p) => p.name === selectedProvince);
    return provinceObj ? provinceObj.cities : [];
  }, [selectedProvince]);

  // ۴. ریست کردن تمام فیلترها به حالت پیش‌فرض
  function handleResetFilters() {
    setInPerson(false);
    setOnline(false);
    setSelectedProvince("");
    setSelectedCity("");
    setSelectedSpecialty("");
    setGender("all");
    setSearchTerm("");
    setSortBy("default");
  }

  // ۵. تغییر استان (باید شهر قبلی را ریست کند تا تداخل ایجاد نشود)
  function handleProvinceChange(provinceName: string) {
    setSelectedProvince(provinceName);
    setSelectedCity("");
  }

  // ۶. اعمال فیلترها در سمت کلاینت (Client-side Filtering)
  const filteredDoctors = doctorsList.filter((doc) => {
    // فیلتر متنی (نام پزشک، تخصص یا بیوگرافی)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const nameMatch = doc.name?.toLowerCase().includes(term);
      const bioMatch = doc.bio?.toLowerCase().includes(term);

      // برای سرچ تخصص، هم معادل انگلیسی پزشک و هم ترجمه فارسی آن را چک می‌کنیم
      const specialtyFa = specialtyValueToLabel(doc.specialty || "").toLowerCase();
      const specialtyEn = (doc.specialty || "").toLowerCase();
      const specialtyMatch = specialtyFa.includes(term) || specialtyEn.includes(term);

      if (!nameMatch && !specialtyMatch && !bioMatch) return false;
    }

    // فیلتر حضوری / مشاوره آنلاین
    if (inPerson && !doc.in_person_visit) return false;
    if (online && !doc.online_visit) return false;

    // فیلتر جنسیت
    if (gender !== "all") {
      if (doc.gender && doc.gender !== gender) return false;
    }

    // فیلتر استان: اگر استانی انتخاب شده باشد، باید شهر پزشک در لیست شهرهای آن استان باشد
    if (selectedProvince) {
      const provinceObj = PROVINCES_CITIES.find((p) => p.name === selectedProvince);
      if (provinceObj) {
        const isCityInProvince = provinceObj.cities.includes(doc.city || "");
        if (!isCityInProvince) return false;
      }
    }

    // فیلتر شهر
    if (selectedCity && doc.city !== selectedCity) return false;

    // فیلتر تخصص (تطابق بر اساس فیلد انگلیسی ذخیره شده در بک‌اند)
    if (selectedSpecialty && doc.specialty !== selectedSpecialty) return false;

    return true;
  });

  // ۷. مرتب‌سازی نتایج (Sorting)
  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if (sortBy === "rating") {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sortBy === "alphabet") {
      return (a.name || "").localeCompare(b.name || "fa");
    }
    return 0;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl" dir="rtl">

      {/* هدر صفحه */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">نوبت‌دهی پزشکان</h1>
        <p className="text-slate-500 text-sm mt-1">
          پزشک مورد نظر خود را انتخاب و به‌صورت آنلاین نوبت رزرو کنید.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* ==================== ستون فیلترها (سمت راست) ==================== */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm sticky top-28">

            {/* سربرگ بخش فیلترها */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <SlidersHorizontal size={18} className="text-blue-600" />
                <span>فیلترها</span>
              </div>
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
              >
                <RotateCcw size={14} />
                <span>حذف فیلترها</span>
              </button>
            </div>

            {/* نوع نوبت‌دهی */}
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={inPerson}
                  onChange={(e) => setInPerson(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500/20"
                />
                <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">نوبت‌دهی مطب</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={online}
                  onChange={(e) => setOnline(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500/20"
                />
                <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">مشاوره آنلاین</span>
              </label>
            </div>

            {/* فیلتر استان */}
            <div className="mb-5">
              <label className="block text-xs font-black text-slate-500 mb-2">استان</label>
              <div className="relative">
                <select
                  value={selectedProvince}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
                >
                  <option value="">همه استان‌ها</option>
                  {PROVINCES_CITIES.map((province) => (
                    <option key={province.name} value={province.name}>
                      {province.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* فیلتر شهر (وابسته به استان انتخاب شده) */}
            <div className="mb-5">
              <label className="block text-xs font-black text-slate-500 mb-2">شهر</label>
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedProvince}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm font-bold appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                    selectedProvince
                      ? "bg-slate-50 border-slate-200 text-slate-700"
                      : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <option value="">همه شهرهای استان</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* فیلتر تخصص (با استفاده از لیست جامع ۵۰ تخصص) */}
            <div className="mb-5">
              <label className="block text-xs font-black text-slate-500 mb-2">تخصص‌ها</label>
              <div className="relative">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
                >
                  <option value="">همه تخصص‌ها</option>
                  {specialties.map((spec) => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* سرچ داخلی فیلترها */}
            <div className="mb-5">
              <label className="block text-xs font-black text-slate-500 mb-2">علائم، بیماری‌ها و خدمات</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="جستجوی علائم یا خدمت..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
              </div>
            </div>

            {/* جنسیت پزشک */}
            <div className="mb-5">
              <label className="block text-xs font-black text-slate-500 mb-2">جنسیت پزشک</label>
              <div className="grid grid-cols-3 gap-2">
                {(["all", "male", "female"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      gender === g
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    {g === "all" ? "همه" : g === "male" ? "مرد" : "زن"}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ==================== ستون نتایج و پزشکان (سمت چپ) ==================== */}
        <div className="lg:col-span-3 space-y-6">

          {/* بخش بالای نتایج */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <span className="text-sm font-bold text-slate-600">
              نمایش <span className="text-blue-600">{sortedDoctors.length}</span> پزشک فعال
            </span>

            {/* بخش مرتب‌سازی */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-black text-slate-400 shrink-0">مرتب‌سازی:</span>
              <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => setSortBy("default")}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                    sortBy === "default" ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  پیش‌فرض
                </button>
                <button
                  onClick={() => setSortBy("rating")}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                    sortBy === "rating" ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  بیشترین امتیاز
                </button>
                <button
                  onClick={() => setSortBy("alphabet")}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                    sortBy === "alphabet" ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  حروف الفبا
                </button>
              </div>
            </div>
          </div>

          {/* بارگذاری پزشکان (Skeleton loading) */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <DoctorCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* نمایش خطا */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-3xl text-center font-bold">
              متأسفانه خطایی در بارگذاری لیست پزشکان رخ داده است. لطفاً اتصال سرور را بررسی کنید.
            </div>
          )}

          {/* لیست نهایی پزشکان */}
          {!isLoading && !error && sortedDoctors.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedDoctors.map((doc) => (
                <DoctorCard key={doc.id} doctor={doc} />
              ))}
            </div>
          )}

          {/* عدم وجود نتیجه مناسب */}
          {!isLoading && !error && sortedDoctors.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-200">
              <span className="text-4xl mb-3 block">🔍</span>
              <h3 className="text-lg font-bold text-slate-700">پزشکی با فیلترهای انتخابی یافت نشد</h3>
              <p className="text-slate-400 text-sm mt-1">
                لطفاً فیلترهای اعمال شده را تغییر دهید یا دکمه حذف فیلترها را بزنید.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
