// Path: frontend/src/components/DoctorCard.tsx

import { Link } from "react-router-dom";
import type { Doctor } from "../services/doctors";

// تعریف یک آواتار پیش‌فرض محلی برای جلوگیری از خطاهای شبکه
const DEFAULT_AVATAR = "/assets/default-doctor.png";

interface DoctorCardProps {
  doctor: Doctor;
}

// متد کمکی برای تبدیل اعداد به فارسی در صورت نیاز
const toPersianDigits = (value: string | number) =>
  String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

export default function DoctorCard({ doctor }: DoctorCardProps) {
  // متد حرفه‌ای برای مدیریت تصویر
  const getImageUrl = (url: string | undefined) => {
    // اگر URL خالی است یا شامل آدرس خارجی مشکوک است، آواتار پیش‌فرض را برگردان
    if (!url || url.includes("unsplash.com")) {
      return DEFAULT_AVATAR;
    }
    return url;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    // اگر باز هم لود نشد، یک آیکون SVG ساده جایگزین کن
    target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cbd5e1"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
  };

  // رفع مشکل عدم نمایش تخصص: تلاش برای خواندن specialty_name در صورت خالی بودن specialty
  const displaySpecialty = doctor.specialty || doctor.specialty_name || "پزشک عمومی";

  return (
    <article
      className="relative rounded-2xl bg-white border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
      dir="rtl"
    >
      {/* نوار رنگی تزیینی در بالای کارت پزشک جهت یکپارچگی با تقویم */}
      <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l from-blue-500 to-sky-400 rounded-t-2xl" />

      <div className="flex items-start gap-4 mt-2">
        <img
          src={getImageUrl(doctor.image)}
          alt={doctor.name}
          onError={handleImageError}
          className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 bg-slate-50"
        />

        <div className="flex-1 min-w-0">
          <h3 className="font-black text-lg text-slate-800 truncate">
            {doctor.name}
          </h3>
          <p className="text-blue-600 text-sm font-bold mt-0.5">
            {displaySpecialty}
          </p>
          <div className="flex items-center gap-1 text-slate-500 text-xs mt-2">
            <span>📍</span>
            <span className="truncate">{doctor.city || "ثبت نشده"}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs text-slate-400">
          {doctor.consultation_fee ? (
            <div>
              <span className="block">ویزیت:</span>
              <span className="font-bold text-slate-700 text-sm">
                {toPersianDigits(doctor.consultation_fee.toLocaleString())} تومان
              </span>
            </div>
          ) : (
            <span className="text-slate-400">بدون ثبت هزینه</span>
          )}
        </div>

        <Link
          to={`/doctors/${doctor.id}`}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition duration-150 shadow-sm"
        >
          دریافت نوبت
        </Link>
      </div>
    </article>
  );
}

export function DoctorCardSkeleton() {
  return (
    <div
      className="relative bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-pulse flex flex-col justify-between h-48"
      dir="rtl"
    >
      <div className="absolute top-0 right-0 left-0 h-1.5 bg-slate-100 rounded-t-2xl" />

      <div className="flex gap-4 mt-2">
        <div className="w-16 h-16 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-slate-200 rounded w-32" />
          <div className="h-4 bg-slate-200 rounded w-24" />
          <div className="h-3 bg-slate-200 rounded w-16" />
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
        <div className="h-4 bg-slate-200 rounded w-20" />
        <div className="h-9 bg-slate-200 rounded-xl w-28" />
      </div>
    </div>
  );
}
