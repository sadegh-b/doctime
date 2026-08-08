// مسیر فایل: src/pages/SearchResults.tsx

import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DoctorCard from "../components/DoctorCard";
import {
  fetchDoctors,
  type Doctor,
  type DoctorsResponse,
} from "../services/doctors";
import { Loader2, SearchX } from "lucide-react";

type DoctorsQueryResult = Doctor[] | DoctorsResponse;

export default function SearchResults() {
  const [searchParams] = useSearchParams();

  const query = searchParams.get("query") || "";
  const specialty = searchParams.get("specialty") || "";
  const city = searchParams.get("city") || "";

  const {
    data,
    isLoading,
    error,
  } = useQuery<DoctorsQueryResult, Error>({
    queryKey: ["search-doctors", query, specialty, city],
    queryFn: () =>
      fetchDoctors({
        search: query,
        specialty_slug: specialty,
        city,
      }),
  });

  const doctors: Doctor[] = Array.isArray(data)
    ? data
    : data && typeof data === "object" && "results" in data && Array.isArray(data.results)
      ? data.results
      : [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600 font-bold">در حال جستجوی بهترین پزشکان...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 bg-red-50 rounded-3xl border border-red-100 m-4">
        <p className="text-red-600 font-bold mb-3">
          خطا در بارگذاری لیست پزشکان
        </p>

        <pre className="text-xs text-red-700 bg-white border border-red-200 rounded-xl p-4 overflow-auto whitespace-pre-wrap text-right">
          {error.message}
        </pre>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">نتایج جستجو</h1>
        <p className="text-slate-500 mt-2">
          {doctors.length} مورد برای "{query || specialty || city}" پیدا شد.
        </p>
      </div>

      {doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
          <SearchX className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700">نتیجه‌ای یافت نشد!</h3>
          <p className="text-slate-500 mt-2">
            پزشکی با این مشخصات در سیستم ثبت نشده است.
          </p>
        </div>
      )}
    </div>
  );
}
