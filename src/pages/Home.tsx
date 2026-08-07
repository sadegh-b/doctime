// Path: C:\PythonProject\PythonProject\doctime-frontend\src\pages\Home.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PROVINCES_CITIES } from "../data/provinces";
import { specialties } from "../data/specialties";
import { ARTICLES } from "../data/mockData";
import { getDoctors, type Doctor } from "../services/doctors";
import BookingCalendar from "../components/BookingCalendar";
import SafeImage from "../components/common/SafeImage";

const HOME_SERVICES = [
  {
    id: 1,
    title: "نوبت پزشکان",
    desc: "رزرو نوبت حضوری پزشکان متخصص، عمومی و فوق تخصص",
    icon: "🩺",
    href: "/doctors",
  },
  {
    id: 2,
    title: "کلینیک",
    desc: "مشاهده کلینیک‌ها، خدمات درمانی و رزرو نوبت",
    icon: "🏥",
    href: "/clinics",
  },
  {
    id: 3,
    title: "آزمایشگاه",
    desc: "جستجوی آزمایشگاه‌ها و دریافت نوبت خدمات آزمایش",
    icon: "🧪",
    href: "/labs",
  },
  {
    id: 4,
    title: "بیمارستان",
    desc: "یافتن بیمارستان‌ها، مراکز تخصصی و خدمات بستری",
    icon: "🏨",
    href: "/hospitals",
  },
  {
    id: 5,
    title: "پزشکان آنلاین",
    desc: "مشاوره پزشکی آنلاین، متنی، صوتی یا تصویری",
    icon: "💻",
    href: "/online-doctors",
  },
  {
    id: 6,
    title: "پزشکان خیریه",
    desc: "پزشکان خیریه با امکان ویزیت حضوری یا آنلاین",
    icon: "🤝",
    href: "/charity-doctors",
  },
];

const WHY_DOCTIME_ITEMS = [
  {
    id: 1,
    icon: "⚡",
    title: "نوبت‌گیری سریع",
    desc: "در چند ثانیه پزشک، کلینیک یا مرکز درمانی موردنظر خود را پیدا کنید.",
  },
  {
    id: 2,
    icon: "🩺",
    title: "پزشکان معتبر",
    desc: "پروفایل پزشکان با تخصص، امتیاز و زمان حضور نمایش داده می‌شود.",
  },
  {
    id: 3,
    icon: "📅",
    title: "رزرو ۲۴ ساعته",
    desc: "بدون تماس تلفنی، در هر ساعت نوبت خود را ثبت کنید.",
  },
  {
    id: 4,
    icon: "💻",
    title: "حضوری و آنلاین",
    desc: "امکان رزرو ویزیت حضوری، تصویری، صوتی یا متنی.",
  },
];

export default function Home() {
  const navigate = useNavigate();

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSpecialtyOpen, setIsSpecialtyOpen] = useState(false);

  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);

  const locationRef = useRef<HTMLDivElement>(null);
  const specialtyRef = useRef<HTMLDivElement>(null);

  // ۱. واکشی اطلاعات واقعی از API
  const { data: doctorsList = [], isLoading, error } = useQuery<Doctor[]>({
    queryKey: ["featured-doctors"],
    queryFn: getDoctors,
  });

  // استخراج ۴ پزشک برتر دارای بیشترین امتیاز
  const topDoctors = useMemo(() => {
    return [...doctorsList]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4);
  }, [doctorsList]);

  // اختصاص اولین پزشک برتر به عنوان انتخاب پیش‌فرض در لود اولیه
  useEffect(() => {
    if (topDoctors.length > 0 && selectedDoctorId === null) {
      setSelectedDoctorId(topDoctors[0].id);
    }
  }, [topDoctors, selectedDoctorId]);

  const availableCities = useMemo(() => {
    if (!selectedProvince) return [];
    const province = PROVINCES_CITIES.find((item) => item.name === selectedProvince);
    return province?.cities ?? [];
  }, [selectedProvince]);

  const selectedDoctor = useMemo(
    () => topDoctors.find((doc) => doc.id === selectedDoctorId) ?? null,
    [selectedDoctorId, topDoctors]
  );

  const activeFilters = useMemo(() => {
    const items: { key: string; label: string; onRemove: () => void }[] = [];

    if (selectedProvince) {
      items.push({
        key: "province",
        label: `استان: ${selectedProvince}`,
        onRemove: () => {
          setSelectedProvince(null);
          setSelectedCity(null);
        },
      });
    }

    if (selectedCity) {
      items.push({
        key: "city",
        label: `شهر: ${selectedCity}`,
        onRemove: () => setSelectedCity(null),
      });
    }

    if (selectedSpecialty) {
      const specialtyLabel =
        specialties.find((item) => item.value === selectedSpecialty)?.label ??
        selectedSpecialty;

      items.push({
        key: "specialty",
        label: `تخصص: ${specialtyLabel}`,
        onRemove: () => setSelectedSpecialty(null),
      });
    }

    if (searchQuery.trim()) {
      items.push({
        key: "query",
        label: `جستجو: ${searchQuery.trim()}`,
        onRemove: () => setSearchQuery(""),
      });
    }

    return items;
  }, [selectedProvince, selectedCity, selectedSpecialty, searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setIsLocationOpen(false);
      }

      if (
        specialtyRef.current &&
        !specialtyRef.current.contains(event.target as Node)
      ) {
        setIsSpecialtyOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResetFilters = () => {
    setSelectedProvince(null);
    setSelectedCity(null);
    setSelectedSpecialty(null);
    setSearchQuery("");
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (selectedProvince) params.set("province", selectedProvince);
    if (selectedCity) params.set("city", selectedCity);
    if (selectedSpecialty) params.set("specialty", selectedSpecialty);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero: تغییر به گرادینت ملایم پسته‌ای-نعنایی و سبز پزشکی */}
      <section className="border-b border-teal-100 bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center md:py-20">
          <h1 className="text-2xl font-black text-white md:text-4xl leading-tight">
            رزرو آنلاین نوبت پزشک، کلینیک، آزمایشگاه و بیمارستان
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm font-medium text-teal-50 md:text-base opacity-95">
            نوبت خود را در کمتر از یک دقیقه، بدون تماس تلفنی رزرو کنید.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/search"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-bold text-teal-700 shadow-sm transition-all hover:bg-teal-50 hover:scale-[1.02]"
            >
              شروع جستجو
            </Link>
            <Link
              to="/doctors"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-teal-300 bg-white/10 px-8 text-sm font-bold text-white backdrop-blur-xs transition-all hover:bg-white/20"
            >
              مشاهده پزشکان
            </Link>
          </div>
        </div>
      </section>

      {/* Search card: بهبود افکت سایه‌ها برای عمق‌بخشی به کامپوننت */}
      <section className="mx-auto -mt-8 max-w-4xl px-4">
        <form
          onSubmit={handleSearchSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_35px_rgba(13,148,136,0.08)] md:p-6"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {/* Location */}
            <div ref={locationRef} className="relative">
              <button
                type="button"
                aria-expanded={isLocationOpen}
                onClick={() => {
                  setIsLocationOpen((prev) => !prev);
                  setIsSpecialtyOpen(false);
                }}
                className="flex h-16 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-right transition hover:border-teal-300"
              >
                <div className="text-right">
                  <p className="text-[11px] font-bold text-slate-400">
                    استان{selectedCity ? " / شهر" : ""}
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900">
                    {selectedCity
                      ? `${selectedProvince} - ${selectedCity}`
                      : selectedProvince || "انتخاب استان"}
                  </p>
                </div>
                <span className="text-lg text-teal-600">📍</span>
              </button>

              {isLocationOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl md:w-[560px]">
                  <div className="grid h-[340px] grid-cols-2">
                    <div className="overflow-y-auto border-l border-slate-100 p-3">
                      <h3 className="mb-2 px-1 text-xs font-bold text-slate-400">
                        استان‌ها
                      </h3>
                      <div className="space-y-1">
                        {PROVINCES_CITIES.map((province) => {
                          const active = selectedProvince === province.name;
                          return (
                            <button
                              key={province.name}
                              type="button"
                              onClick={() => {
                                setSelectedProvince(province.name);
                                setSelectedCity(null);
                              }}
                              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                active
                                  ? "bg-teal-600 text-white"
                                  : "text-slate-700 hover:bg-teal-50"
                              }`}
                            >
                              <span>{province.name}</span>
                              {active && <span>✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="overflow-y-auto p-3">
                      <h3 className="mb-2 px-1 text-xs font-bold text-slate-400">
                        شهرهای {selectedProvince || "..."}
                      </h3>

                      {selectedProvince ? (
                        <div className="space-y-1">
                          {availableCities.map((city) => {
                            const active = selectedCity === city;
                            return (
                              <button
                                key={city}
                                type="button"
                                onClick={() => {
                                  setSelectedCity(city);
                                  setIsLocationOpen(false);
                                }}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                  active
                                    ? "bg-teal-600 text-white"
                                    : "text-slate-700 hover:bg-teal-50"
                                }`}
                              >
                                <span>{city}</span>
                                {active && <span>✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex h-full min-h-[200px] items-center justify-center rounded-lg bg-slate-50 p-4 text-center text-xs font-semibold text-slate-400">
                          ابتدا یک استان را انتخاب کنید
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Specialty */}
            <div ref={specialtyRef} className="relative">
              <button
                type="button"
                aria-expanded={isSpecialtyOpen}
                onClick={() => {
                  setIsSpecialtyOpen((prev) => !prev);
                  setIsLocationOpen(false);
                }}
                className="flex h-16 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-right transition hover:border-teal-300"
              >
                <div className="text-right">
                  <p className="text-[11px] font-bold text-slate-400">تخصص</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900">
                    {selectedSpecialty
                      ? specialties.find((item) => item.value === selectedSpecialty)
                          ?.label ?? selectedSpecialty
                      : "لیست تخصص‌ها"}
                  </p>
                </div>
                <span className="text-lg text-teal-600">🩺</span>
              </button>

              {isSpecialtyOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 max-h-[340px] w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSpecialty(null);
                      setIsSpecialtyOpen(false);
                    }}
                    className="mb-1 flex w-full items-center justify-between rounded-lg bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-100"
                  >
                    <span>همه تخصص‌ها</span>
                  </button>

                  <div className="space-y-1">
                    {specialties.map((spec) => {
                      const active = selectedSpecialty === spec.value;
                      return (
                        <button
                          key={spec.value}
                          type="button"
                          onClick={() => {
                            setSelectedSpecialty(spec.value);
                            setIsSpecialtyOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition ${
                            active
                              ? "bg-teal-600 text-white"
                              : "text-slate-700 hover:bg-teal-50"
                          }`}
                        >
                          <span>{spec.label}</span>
                          {active && <span>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام پزشک، تخصص یا بیماری..."
              className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 transition focus:border-teal-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-100"
            />

            <button
              type="submit"
              className="h-14 rounded-xl bg-teal-600 px-8 text-sm font-bold text-white transition-all hover:bg-teal-700 hover:shadow-md"
            >
              جستجو
            </button>
          </div>

          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
              {activeFilters.map((filter) => (
                <div
                  key={filter.key}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 border border-teal-100"
                >
                  <span>{filter.label}</span>
                  <button
                    type="button"
                    onClick={filter.onRemove}
                    className="hover:text-red-600 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleResetFilters}
                className="mr-auto text-xs font-bold text-red-600 hover:underline"
              >
                پاک کردن همه
              </button>
            </div>
          )}
        </form>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-black text-slate-900 md:text-3xl">
          خدمات نوبت‌دهی داک‌تایم
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {HOME_SERVICES.map((service) => (
            <Link
              key={service.id}
              to={service.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg"
            >
              <span className="text-3xl">{service.icon}</span>
              <h3 className="mt-4 text-lg font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                {service.title}
              </h3>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                {service.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Doctors Section: متصل به هوک react-query و داده‌های سرور */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <h2 className="text-2xl font-black text-slate-900 md:text-3xl">
            پزشکان برجسته
          </h2>
          <Link to="/doctors" className="text-sm font-bold text-teal-700 hover:underline hover:text-teal-800">
            مشاهده همه پزشکان ←
          </Link>
        </div>

        {/* حالت لودینگ از دیتابیس */}
        {isLoading && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 h-64 flex flex-col justify-between">
                <div className="h-40 rounded-xl bg-slate-100" />
                <div className="h-4 bg-slate-100 rounded w-2/3 mt-2" />
                <div className="h-3 bg-slate-100 rounded w-1/2 mt-1" />
              </div>
            ))}
          </div>
        )}

        {/* خطا در دریافت اطلاعات */}
        {error && (
          <div className="mt-8 text-center text-red-600 font-bold p-6 bg-red-50 rounded-2xl border border-red-100">
            متأسفانه خطایی در دریافت اطلاعات پزشکان رخ داده است.
          </div>
        )}

        {/* نمایش لیست نهایی پزشکان */}
        {!isLoading && !error && topDoctors.length > 0 && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {topDoctors.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoctorId(doc.id)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 ${
                  selectedDoctorId === doc.id
                    ? "border-teal-500 bg-teal-50/40 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                }`}
              >
                <div className="relative h-40 overflow-hidden rounded-xl bg-slate-100">
                  <SafeImage src={doc.image} alt={doc.name} className="h-full w-full object-cover" />
                  {doc.rating !== null && (
                    <div className="absolute left-2 top-2 rounded-lg bg-white px-2 py-1 text-xs font-bold text-amber-600 shadow-sm">
                      ★ {doc.rating}
                    </div>
                  )}
                </div>

                <h3 className="mt-3 text-base font-black text-slate-900">{doc.name}</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">{doc.specialty_name}</p>
                {doc.next_available && (
                  <p className="mt-2 text-xs font-bold text-teal-700">
                    نزدیک‌ترین زمان: {doc.next_available}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick booking */}
      {selectedDoctor && (
        <section className="mx-auto max-w-3xl px-4 py-16">
          <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-[0_10px_35px_rgba(13,148,136,0.05)] md:p-10">
            <div className="text-center">
              <h2 className="text-xl font-black text-slate-900">
                رزرو سریع نوبت برای {selectedDoctor.name}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                تاریخ موردنظر را از تقویم زیر انتخاب کنید.
              </p>
            </div>

            <div className="mt-8">
              <BookingCalendar
                doctorId={selectedDoctor.id}
                doctorName={selectedDoctor.name}
                specialty={selectedDoctor.specialty}
              />
            </div>
          </div>
        </section>
      )}

      {/* Articles */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <h2 className="text-2xl font-black text-slate-900 md:text-3xl">
            مجله سلامت داک‌تایم
          </h2>
          <Link to="/articles" className="text-sm font-bold text-teal-700 hover:underline hover:text-teal-800">
            مشاهده همه مقالات ←
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((article) => (
            <article
              key={article.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="h-40 overflow-hidden bg-slate-100">
                <SafeImage src={article.image} alt={article.title} className="h-full w-full object-cover" />
              </div>

              <div className="p-5">
                <span className="text-xs font-bold text-teal-700">{article.category}</span>
                <h3 className="mt-2 text-base font-black leading-6 text-slate-900">
                  {article.title}
                </h3>
                <p className="mt-2 text-xs font-medium leading-6 text-slate-500">
                  {article.excerpt}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-slate-400">
                  <span>{article.date}</span>
                  <span className="text-teal-700 hover:text-teal-800">مطالعه مقاله ←</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Why DocTime: استفاده از افکت شیشه‌ای مدرن */}
      <section className="bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="text-center text-white">
            <h2 className="text-2xl font-black md:text-3xl">چرا داک‌تایم؟</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-teal-100">
              فرایند رزرو حضوری و تلفنی نوبت را با سیستمی ساده و مطمئن جایگزین کرده‌ایم.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_DOCTIME_ITEMS.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md transition-all duration-300 hover:bg-white/15"
              >
                <span className="text-2xl">{item.icon}</span>
                <h3 className="mt-3 text-base font-black text-white">{item.title}</h3>
                <p className="mt-2 text-xs font-medium leading-6 text-teal-50">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
