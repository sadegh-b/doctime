import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { searchDoctors } from "../services/searchDoctors";
import type { SearchParams } from "../services/searchDoctors";
import DoctorCardSkeleton from "../components/DoctorCardSkeleton";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300";

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
      <div
        className="min-h-screen flex items-center justify-center bg-slate-50"
        dir="rtl"
      >
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="mb-2 font-bold text-red-500">خطا در دریافت اطلاعات</p>
          <p className="text-sm text-slate-500">
            {error instanceof Error ? error.message : "خطایی رخ داد."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12" dir="rtl">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-6 text-2xl font-bold text-slate-800">نتایج جستجو</h1>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <DoctorCardSkeleton key={i} />
            ))}
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
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
                  className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm"
                >
                  <div>
                    <div className="mb-4 flex items-center gap-4">
                      <img
                        src={doctor.image || FALLBACK_IMAGE}
                        alt={doctor.name}
                        className="h-16 w-16 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">
                          {doctor.name}
                        </h2>
                        <p className="text-sm font-semibold text-blue-600">
                          {doctor.specialty}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-slate-100 pt-2 text-sm text-slate-600">
                      <p>📍 {doctor.city || "—"}</p>
                      <p>⭐ {doctor.rating ?? 0}</p>
                      <p>⏰ اولین نوبت: {doctor.nextAvailable || "ثبت نشده"}</p>
                    </div>
                  </div>

                  <Link
                    to={`/doctor/${doctor.id}`}
                    className="mt-6 block rounded-xl bg-blue-600 py-2.5 text-center text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    دریافت نوبت
                  </Link>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`h-10 w-10 rounded-xl font-medium transition ${
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