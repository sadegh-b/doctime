// Path: src/components/DoctorCard.tsx

import { Link } from "react-router-dom";
import type { Doctor } from "../services/doctors";

// تعریف یک آواتار پیش‌فرض محلی برای جلوگیری از خطاهای شبکه
const DEFAULT_AVATAR = "/assets/default-doctor.png";

interface DoctorCardProps {
  doctor: Doctor;
}

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

  return (
    <article className="rounded-2xl bg-white border p-6 shadow-sm hover:shadow-lg transition">
      <div className="flex items-center gap-4">
        <img
          src={getImageUrl(doctor.image)}
          alt={doctor.name}
          onError={handleImageError}
          className="w-16 h-16 rounded-full object-cover border border-gray-100 bg-gray-50"
        />

        <div>
          <h3 className="font-bold text-lg text-gray-800">
            {doctor.name}
          </h3>
          <p className="text-blue-600 text-sm">
            {doctor.specialty}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            📍 {doctor.city}
          </p>
        </div>
      </div>
      {/* ... ادامه کد */}
      <Link
        to={`/doctors/${doctor.id}`}
        className="mt-5 block text-center bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
      >
        مشاهده پروفایل
      </Link>
    </article>
  );
}
