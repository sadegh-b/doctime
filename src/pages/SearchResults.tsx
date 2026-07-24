// Path: frontend/src/pages/SearchResults.tsx

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import DoctorCard, { DoctorCardSkeleton } from "../components/DoctorCard";
import type { Doctor } from "../services/doctors";
import { Search } from "lucide-react";

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";

  // استیت محلی برای نگهداری مقدار ورودی فیلد متنی جستجو
  const [localQuery, setLocalQuery] = useState(query);

  // همگام‌سازی استیت محلی در صورتی که پارامتر URL مستقیماً تغییر کند
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const { data: doctors, isLoading, error, isFetched } = useQuery({
    queryKey: ["search-doctors", query],
    queryFn: async () => {
      // اگر کوئری خالی بود، درخواستی ارسال نکن
      if (!query) return [];
      const response = await axios.get(
        `http://127.0.0.1:8000/api/v1/doctors/search?query=${encodeURIComponent(query)}`
      );
      return response.data as Doctor[];
    },
    // فعال‌سازی کوئری فقط زمانی که مقدار جستجو خالی نباشد
    enabled: query.length > 0,
  });

  // مدیریت ثبت فرم جستجو
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = localQuery.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
    } else {
      setSearchParams({});
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl" dir="rtl">

      {/* بخش باکس جستجوی بزرگ و مدرن در بالای صفحه */}
      <div className="mb-10 max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-black text-slate-900 mb-3">جستجوی پزشک و نوبت‌دهی</h1>
        <p className="text-slate-500 text-sm mb-6">
          نام پزشک، تخصص یا بیماری مورد نظر را وارد کرده و پزشک مناسب خود را پیدا کنید.
        </p>

        <form
          onSubmit={handleSubmit}
          className="relative flex shadow-lg rounded-2xl overflow-hidden border border-slate-200"
        >
          <input
            type="text"
            placeholder="مثال: دکتر احمدی، قلب و عروق، دندان‌پزشکی..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="w-full px-6 py-4 text-slate-800 placeholder-slate-400 bg-white focus:outline-none text-base"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 flex items-center gap-2 font-bold transition-colors shrink-0"
          >
            <Search size={20} />
            <span>جستجو</span>
          </button>
        </form>
      </div>

      {/* وضعیت نمایش پیام شروع یا نتایج جستجو */}
      {query ? (
        <div className="mb-8 border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold text-slate-800">
            نتایج جستجو برای: <span className="text-blue-600">«{query}»</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {isLoading ? "در حال دریافت اطلاعات..." : isFetched ? `${doctors?.length || 0} پزشک پیدا شد.` : ""}
          </p>
        </div>
      ) : (
        <div className="text-center py-16 bg-blue-50/50 rounded-3xl border-2 border-dashed border-blue-100 mb-8">
          <span className="text-4xl mb-4 block">🔍</span>
          <h2 className="text-lg font-bold text-blue-950">منتظر جستجوی شما هستیم</h2>
          <p className="text-blue-600/80 text-sm mt-2">
            عبارت مورد نظر خود را در کادر بالا وارد کرده و دکمه جستجو را بزنید.
          </p>
        </div>
      )}

      {/* نمایش اسکلتون‌ها در زمان بارگذاری */}
      {isLoading && query && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <DoctorCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* مدیریت نمایش خطا */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-center font-bold max-w-xl mx-auto">
          خطایی در برقراری ارتباط با سرور رخ داد. لطفاً اتصال بک‌اند را بررسی کنید.
        </div>
      )}

      {/* نمایش نتایج پزشکان پیدا شده */}
      {isFetched && doctors && doctors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}

      {/* مدیریت وضعیت پیدا نشدن پزشک */}
      {isFetched && query && doctors && doctors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <span className="text-4xl mb-4">🕵️‍♂️</span>
          <h3 className="text-lg font-bold text-slate-700">نتیجه‌ای یافت نشد</h3>
          <p className="text-slate-400 text-sm mt-1">
            متأسفانه پزشکی با عبارت «{query}» پیدا نکردیم. عبارت دیگری را امتحان کنید.
          </p>
        </div>
      )}
    </div>
  );
}
