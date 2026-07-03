import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getDoctors } from "../services/doctors";

export default function Doctors() {
  // استفاده از React Query برای مدیریت درخواست و کش به صورت خودکار
  const { data: doctors = [], isLoading, isError, error } = useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
    staleTime: 1000 * 60 * 5, // داده‌ها تا ۵ دقیقه تازه (fresh) در نظر گرفته می‌شوند
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg text-slate-600">در حال دریافت پزشکان...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm max-w-md">
          <p className="text-red-500 font-bold mb-4">خطا در برقراری ارتباط!</p>
          <p className="text-slate-500 text-sm mb-6">
            {error instanceof Error ? error.message : "مشکلی در دریافت اطلاعات پزشکان به وجود آمد."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition text-sm"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            نوبت‌دهی بهترین پزشکان ایران
          </h1>
          <p className="text-slate-500">
            پزشک مورد نظر خود را انتخاب و آنلاین نوبت رزرو کنید
          </p>
        </div>

        {doctors.length === 0 ? (
          <div className="text-center text-slate-500 py-10">
            پزشکی یافت نشد.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-20 h-20 rounded-full object-cover border border-slate-100"
                    />
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">
                        {doctor.name}
                      </h2>
                      <p className="text-blue-600 text-sm font-semibold mt-1">
                        {doctor.specialty}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{doctor.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>⭐</span>
                      <span className="font-semibold">{doctor.rating}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>⏰</span>
                      <span>اولین نوبت: {doctor.nextAvailable}</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/doctor/${doctor.id}`}
                  className="mt-6 block text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition"
                >
                  دریافت نوبت
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
