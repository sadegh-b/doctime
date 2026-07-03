import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { searchDoctors } from "../services/searchDoctors";
import type { SearchParams } from "../services/searchDoctors";
import DoctorCardSkeleton from "../components/DoctorCardSkeleton";

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();

  const name = searchParams.get("name") ?? "";
  const specialty = searchParams.get("specialty") ?? "";
  const city = searchParams.get("city") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const sort = searchParams.get("sort") ?? "";

  const queryParams: SearchParams = {
    name,
    specialty,
    city,
    _page: page,
    _limit: 6,
  };

  if (sort) {
    queryParams._sort = sort;
    queryParams._order = "desc";
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["searchDoctors", queryParams],
    queryFn: () => searchDoctors(queryParams),
    staleTime: 1000 * 60 * 2,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  const totalPages = data ? Math.ceil(data.totalCount / 6) : 1;

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50" dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
          <p className="text-red-500 font-bold mb-2">خطا در دریافت اطلاعات</p>
          <p className="text-slate-500 text-sm">
            {error instanceof Error ? error.message : "خطایی رخ داد."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          نتایج جستجو
        </h1>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <DoctorCardSkeleton key={i} />
            ))}
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p className="text-slate-500">
              پزشکی با مشخصات جستجو شده یافت نشد.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.data.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white rounded-2xl shadow-sm p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">
                          {doctor.name}
                        </h2>
                        <p className="text-blue-600 text-sm font-semibold">
                          {doctor.specialty}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-slate-600 pt-2 border-t border-slate-100">
                      <p>📍 {doctor.city}</p>
                      <p>⭐ {doctor.rating}</p>
                      <p>⏰ اولین نوبت: {doctor.nextAvailable}</p>
                    </div>
                  </div>

                  <Link
                    to={`/doctor/${doctor.id}`}
                    className="mt-6 block text-center bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition"
                  >
                    دریافت نوبت
                  </Link>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-10 h-10 rounded-xl font-medium transition ${
                        p === page
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-white text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}