import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronDown,
  MapPin,
  Search,
  Stethoscope,
  X,
} from "lucide-react";

import { PROVINCES_CITIES } from "../data/provinces";
import { specialties } from "../data/specialties";
import { ARTICLES } from "../data/mockData";
import { getDoctors, type Doctor } from "../services/doctors";
import BookingCalendar from "../components/BookingCalendar";
import SafeImage from "../components/common/SafeImage";

export default function Home() {
  const navigate = useNavigate();

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSpecialtyOpen, setIsSpecialtyOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(
    null
  );
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(
    null
  );

  const locationRef = useRef<HTMLDivElement>(null);
  const specialtyRef = useRef<HTMLDivElement>(null);

  const { data: doctorsList = [] } = useQuery<Doctor[]>({
    queryKey: ["featured-doctors"],
    queryFn: getDoctors,
  });

  const topDoctors = useMemo(() => {
    return [...doctorsList]
      .sort((firstDoctor, secondDoctor) => {
        return (secondDoctor.rating || 0) - (firstDoctor.rating || 0);
      })
      .slice(0, 4);
  }, [doctorsList]);

  const availableCities = useMemo(() => {
    if (!selectedProvince) {
      return [];
    }

    return (
      PROVINCES_CITIES.find((province) => province.name === selectedProvince)
        ?.cities ?? []
    );
  }, [selectedProvince]);

  const selectedDoctor = useMemo(() => {
    return (
      topDoctors.find((doctor) => doctor.id === selectedDoctorId) ?? null
    );
  }, [selectedDoctorId, topDoctors]);

  const selectedSpecialtyLabel = useMemo(() => {
    return (
      specialties.find((specialty) => specialty.value === selectedSpecialty)
        ?.label ?? "همه تخصص‌ها"
    );
  }, [selectedSpecialty]);

  useEffect(() => {
    if (topDoctors.length > 0 && selectedDoctorId === null) {
      setSelectedDoctorId(topDoctors[0].id);
    }
  }, [topDoctors, selectedDoctorId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        locationRef.current &&
        !locationRef.current.contains(target)
      ) {
        setIsLocationOpen(false);
      }

      if (
        specialtyRef.current &&
        !specialtyRef.current.contains(target)
      ) {
        setIsSpecialtyOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLocationToggle = () => {
    setIsLocationOpen((currentState) => !currentState);
    setIsSpecialtyOpen(false);
  };

  const handleSpecialtyToggle = () => {
    setIsSpecialtyOpen((currentState) => !currentState);
    setIsLocationOpen(false);
  };

  const handleProvinceSelect = (provinceName: string) => {
    setSelectedProvince(provinceName);
    setSelectedCity(null);
  };

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    setIsLocationOpen(false);
  };

  const handleSpecialtySelect = (specialtyValue: string) => {
    setSelectedSpecialty(specialtyValue);
    setIsSpecialtyOpen(false);
  };

  const clearLocation = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setSelectedProvince(null);
    setSelectedCity(null);
  };

  const clearSpecialty = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setSelectedSpecialty(null);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (selectedProvince) {
      params.set("province", selectedProvince);
    }

    if (selectedCity) {
      params.set("city", selectedCity);
    }

    if (selectedSpecialty) {
      params.set("specialty", selectedSpecialty);
    }

    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }

    const queryString = params.toString();

    navigate(queryString ? `/search?${queryString}` : "/search");
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-8 pt-12 md:pb-12 md:pt-20">
        <div className="pointer-events-none absolute right-[-120px] top-[-160px] h-[360px] w-[360px] rounded-full bg-blue-100/50 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-180px] left-[-120px] h-[360px] w-[360px] rounded-full bg-cyan-100/40 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-5 py-2.5 text-sm font-bold text-blue-700 shadow-sm md:text-base">
            <span className="text-base">✦</span>
            پلتفرم هوشمند نوبت‌دهی آنلاین پزشکان داک‌تایم
          </span>

          <h1 className="text-4xl font-black leading-[1.45] tracking-tight text-slate-950 md:text-6xl">
            نوبت‌دهی آنلاین
            <br />
            <span className="bg-gradient-to-l from-blue-700 to-cyan-500 bg-clip-text text-transparent">
              پزشکان متخصص
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base font-medium leading-8 text-slate-600 md:text-lg">
            بهترین پزشکان ایران در کنار شما هستند. اطلاعات پزشک را مشاهده کنید
            و در کمتر از یک دقیقه نوبت خود را رزرو کنید.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="relative z-20 mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <form
          onSubmit={handleSearchSubmit}
          className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.10)] sm:p-6 md:rounded-[36px] md:p-8"
        >
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-xl font-black text-slate-950 md:text-2xl">
                پزشک مورد نظر خود را پیدا کنید
              </h2>
              <p className="mt-1.5 text-sm font-medium text-slate-500 md:text-base">
                جستجو را با موقعیت مکانی یا تخصص پزشک شروع کنید
              </p>
            </div>

            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 sm:flex">
              <Search size={23} strokeWidth={2.2} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Location Selector */}
            <div ref={locationRef} className="relative">
              <button
                type="button"
                onClick={handleLocationToggle}
                aria-expanded={isLocationOpen}
                className={`group flex min-h-[82px] w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-right transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                  isLocationOpen
                    ? "border-blue-500 bg-white shadow-[0_8px_25px_rgba(37,99,235,0.10)]"
                    : "border-slate-200 bg-slate-50/70 hover:border-blue-300 hover:bg-white"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      isLocationOpen
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                    }`}
                  >
                    <MapPin size={21} strokeWidth={2.2} />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-xs font-bold text-slate-500">
                      موقعیت مکانی
                    </span>
                    <span className="mt-1 block truncate text-base font-extrabold text-slate-900 md:text-lg">
                      {selectedCity
                        ? `${selectedProvince}، ${selectedCity}`
                        : selectedProvince || "انتخاب استان و شهر"}
                    </span>
                  </span>
                </div>

                <span className="flex items-center gap-2 text-slate-400">
                  {(selectedProvince || selectedCity) && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={clearLocation}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          setSelectedProvince(null);
                          setSelectedCity(null);
                        }
                      }}
                      className="rounded-lg p-1 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <X size={17} />
                    </span>
                  )}

                  <ChevronDown
                    size={20}
                    className={`transition-transform ${
                      isLocationOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </span>
              </button>

              {isLocationOpen && (
                <div className="absolute right-0 top-full z-50 mt-3 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)] md:w-[650px]">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <p className="text-sm font-extrabold text-slate-900">
                      استان و شهر را انتخاب کنید
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      ابتدا استان و سپس شهر مورد نظر را انتخاب کنید.
                    </p>
                  </div>

                  <div className="grid h-[360px] grid-cols-2">
                    <div className="overflow-y-auto border-l border-slate-100 p-3">
                      {PROVINCES_CITIES.map((province) => (
                        <button
                          key={province.name}
                          type="button"
                          onClick={() =>
                            handleProvinceSelect(province.name)
                          }
                          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-right text-sm font-bold transition ${
                            selectedProvince === province.name
                              ? "bg-blue-50 text-blue-700"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>{province.name}</span>
                          {selectedProvince === province.name && (
                            <Check size={16} />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="overflow-y-auto p-3">
                      {selectedProvince ? (
                        availableCities.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => handleCitySelect(city)}
                            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-right text-sm font-bold transition ${
                              selectedCity === city
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span>{city}</span>
                            {selectedCity === city && (
                              <Check size={16} />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="flex h-full items-center justify-center px-5 text-center text-sm font-semibold leading-7 text-slate-400">
                          ابتدا یک استان را انتخاب کنید
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Specialty Selector */}
            <div ref={specialtyRef} className="relative">
              <button
                type="button"
                onClick={handleSpecialtyToggle}
                aria-expanded={isSpecialtyOpen}
                className={`group flex min-h-[82px] w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-right transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                  isSpecialtyOpen
                    ? "border-blue-500 bg-white shadow-[0_8px_25px_rgba(37,99,235,0.10)]"
                    : "border-slate-200 bg-slate-50/70 hover:border-blue-300 hover:bg-white"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      isSpecialtyOpen
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                    }`}
                  >
                    <Stethoscope size={21} strokeWidth={2.2} />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-xs font-bold text-slate-500">
                      تخصص پزشک
                    </span>
                    <span className="mt-1 block truncate text-base font-extrabold text-slate-900 md:text-lg">
                      {selectedSpecialtyLabel}
                    </span>
                  </span>
                </div>

                <span className="flex items-center gap-2 text-slate-400">
                  {selectedSpecialty && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={clearSpecialty}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          setSelectedSpecialty(null);
                        }
                      }}
                      className="rounded-lg p-1 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <X size={17} />
                    </span>
                  )}

                  <ChevronDown
                    size={20}
                    className={`transition-transform ${
                      isSpecialtyOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </span>
              </button>

              {isSpecialtyOpen && (
                <div className="absolute right-0 top-full z-50 mt-3 max-h-[360px] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                  <button
                    type="button"
                    onClick={() => handleSpecialtySelect("")}
                    className={`mb-1 flex w-full items-center justify-between rounded-xl px-4 py-3 text-right text-sm font-bold transition ${
                      !selectedSpecialty
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>همه تخصص‌ها</span>
                    {!selectedSpecialty && <Check size={16} />}
                  </button>

                  {specialties.map((specialty) => (
                    <button
                      key={specialty.value}
                      type="button"
                      onClick={() =>
                        handleSpecialtySelect(specialty.value)
                      }
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-right text-sm font-bold transition ${
                        selectedSpecialty === specialty.value
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{specialty.label}</span>
                      {selectedSpecialty === specialty.value && (
                        <Check size={16} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search Input and Submit Button */}
          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={21}
                className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="نام پزشک، بیماری یا تخصص را جستجو کنید"
                aria-label="جستجوی پزشک، بیماری یا تخصص"
                className="h-16 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-14 text-right text-base font-semibold text-slate-900 outline-none transition placeholder:text-sm placeholder:font-medium placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 md:text-lg"
              />
            </div>

            <button
              type="submit"
              className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 text-base font-extrabold text-white shadow-[0_12px_25px_rgba(37,99,235,0.22)] transition hover:bg-blue-700 hover:shadow-[0_16px_30px_rgba(37,99,235,0.28)] focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-[0.98] md:min-w-[170px] md:text-lg"
            >
              <Search size={20} />
              <span>جستجوی پزشک</span>
            </button>
          </div>
        </form>
      </section>

      {/* Featured Doctors */}
      <section className="border-t border-slate-100 bg-slate-50/60 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-950 md:text-4xl">
                پزشکان برجسته داک‌تایم
              </h2>
              <p className="mt-3 text-base font-medium text-slate-500 md:text-lg">
                محبوب‌ترین پزشکان از نگاه کاربران
              </p>
            </div>

            <Link
              to="/doctors"
              className="text-base font-extrabold text-blue-600 transition hover:text-blue-700 hover:underline md:text-lg"
            >
              مشاهده همه ←
            </Link>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {topDoctors.map((doctor) => (
              <button
                key={doctor.id}
                type="button"
                onClick={() => setSelectedDoctorId(doctor.id)}
                className={`rounded-[30px] border p-5 text-right transition-all duration-300 ${
                  selectedDoctorId === doctor.id
                    ? "scale-[1.02] border-blue-400 bg-white shadow-2xl"
                    : "border-slate-200 bg-white hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                }`}
              >
                <div className="relative h-60 overflow-hidden rounded-2xl bg-slate-50">
                  <SafeImage
                    src={doctor.image}
                    alt={doctor.name}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute left-3 top-3 rounded-xl bg-white/95 px-3 py-2 text-sm font-extrabold text-amber-500 shadow-sm">
                    ★ {doctor.rating}
                  </div>
                </div>

                <h3 className="mt-5 text-lg font-black text-slate-950">
                  {doctor.name}
                </h3>

                <p className="mt-1 text-base font-semibold text-slate-500">
                  {doctor.specialty_name}
                </p>

                <div className="mt-5 rounded-xl border-t border-slate-100 pt-4 text-center text-sm font-extrabold text-blue-600">
                  نزدیک‌ترین نوبت: امروز
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Calendar */}
      {selectedDoctor && (
        <section className="mx-auto max-w-5xl px-6 py-20">
          <div className="rounded-[38px] border border-blue-100 bg-white p-7 shadow-2xl shadow-blue-500/5 md:rounded-[48px] md:p-16">
            <div className="mb-10 text-center">
              <span className="inline-flex rounded-full bg-blue-50 px-5 py-2 text-sm font-extrabold text-blue-600">
                رزرو سریع نوبت
              </span>

              <h2 className="mt-5 text-2xl font-black text-slate-950 md:text-4xl">
                ثبت نوبت برای {selectedDoctor.name}
              </h2>

              <p className="mt-3 text-base font-medium text-slate-500 md:text-lg">
                تاریخ و ساعت ویزیت خود را تعیین کنید.
              </p>
            </div>

            <BookingCalendar
              doctorId={selectedDoctor.id}
              doctorName={selectedDoctor.name}
              specialty={selectedDoctor.specialty}
            />
          </div>
        </section>
      )}

      {/* Health Articles */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-black text-slate-950 md:text-4xl">
          آخرین مطالب مجله سلامت
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.slice(0, 3).map((article) => (
            <article
              key={article.id}
              className="overflow-hidden rounded-[30px] border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="h-56 overflow-hidden">
                <SafeImage
                  src={article.image}
                  alt={article.title}
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />
              </div>

              <div className="p-7">
                <h3 className="text-xl font-black leading-8 text-slate-950">
                  {article.title}
                </h3>

                <p className="mt-3 line-clamp-2 text-base font-medium leading-7 text-slate-600">
                  {article.excerpt}
                </p>

                <Link
                  to={`/articles/${article.id}`}
                  className="mt-6 inline-block text-base font-extrabold text-blue-600 transition hover:text-blue-700"
                >
                  مطالعه بیشتر ←
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Footer is rendered globally in App.tsx. */}
    </div>
  );
}
