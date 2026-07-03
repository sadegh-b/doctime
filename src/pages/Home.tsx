import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PROVINCES_CITIES } from "../data/provinces";
import { specialties } from "../data/specialties";
import { SPECIALTIES, TOP_DOCTORS, ARTICLES } from "../data/mockData";
import BookingCalendar from "../components/BookingCalendar";

type RevealKey =
  | "hero"
  | "search"
  | "stats"
  | "benefits"
  | "specialties"
  | "doctors"
  | "quick-booking"
  | "articles"
  | "cta";

export default function Home() {
  const navigate = useNavigate();

  // =========================
  // State
  // =========================
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSpecialtyOpen, setIsSpecialtyOpen] = useState(false);

  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(
    TOP_DOCTORS[0]?.id ?? null
  );

  const [revealedSections, setRevealedSections] = useState<Set<RevealKey>>(new Set());

  const locationRef = useRef<HTMLDivElement>(null);
  const specialtyRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // =========================
  // Derived Data
  // =========================
  const availableCities = useMemo(() => {
    if (!selectedProvince) return [];
    const province = PROVINCES_CITIES.find((p) => p.name === selectedProvince);
    return province?.cities ?? [];
  }, [selectedProvince]);

  const selectedDoctor = useMemo(
    () => TOP_DOCTORS.find((doc) => doc.id === selectedDoctorId) ?? null,
    [selectedDoctorId]
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
      items.push({
        key: "specialty",
        label: `تخصص: ${selectedSpecialty}`,
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

  // =========================
  // Effects
  // =========================
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false);
      }
      if (specialtyRef.current && !specialtyRef.current.contains(event.target as Node)) {
        setIsSpecialtyOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute("data-reveal-id") as RevealKey | null;
          if (!id) return;

          setRevealedSections((prev) => {
            if (prev.has(id)) return prev;
            const next = new Set(prev);
            next.add(id);
            return next;
          });
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    const elements = document.querySelectorAll("[data-reveal-id]");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  // =========================
  // Handlers
  // =========================
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

  const benefits = [
    {
      title: "نوبت‌گیری سریع",
      desc: "در چند ثانیه پزشک موردنظر خود را پیدا کنید و نوبت رزرو کنید.",
      icon: "⚡",
    },
    {
      title: "پزشکان معتبر",
      desc: "پروفایل پزشکان با تخصص، امتیاز، زمان حضور و اطلاعات تکمیلی نمایش داده می‌شود.",
      icon: "🩺",
    },
    {
      title: "رزرو آنلاین ۲۴ ساعته",
      desc: "در هر ساعت از شبانه‌روز بدون تماس تلفنی نوبت خود را ثبت کنید.",
      icon: "📅",
    },
  ];

  const stats = [
    { label: "پزشک متخصص", value: "۲۰۰+" },
    { label: "نوبت موفق", value: "۵۰,۰۰۰+" },
    { label: "رضایت بیماران", value: "۹۸٪" },
  ];

  // =========================
  // Helpers
  // =========================
  const revealClass = (key: RevealKey) =>
    `transition-all duration-1000 ease-out ${
      revealedSections.has(key) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    }`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f8fffb_0%,#ffffff_40%,#f9fbff_100%)]">
      <div className="relative z-10 space-y-28 pb-28">
        {/* ================= HERO ================= */}
        <section className="relative px-4 pt-24 md:pt-28">
          <div className="mx-auto max-w-7xl">
            <div
              data-reveal-id="hero"
              className={`relative overflow-hidden rounded-[36px] border border-emerald-100/70 bg-white/80 px-6 py-10 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:px-12 md:py-14 lg:px-16 ${revealClass(
                "hero"
              )}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.12),transparent_30%),radial-gradient(circle_at_center,rgba(255,255,255,0.55),transparent_60%)]" />

              <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
                {/* Hero Content */}
                <div className="text-center lg:text-right">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-extrabold text-emerald-900 shadow-sm">
                    رزرو آنلاین پزشک، سریع و بدون دردسر
                  </span>

                  <h1 className="mt-6 text-4xl font-black leading-[1.25] text-slate-900 md:text-6xl">
                    نوبت‌دهی آنلاین پزشک
                    <br />
                    <span className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 bg-clip-text text-transparent">
                      با داک‌تایم
                    </span>
                  </h1>

                  <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-slate-600 md:mx-0 md:text-lg">
                    استان، شهر، تخصص یا نام پزشک را انتخاب کنید و خیلی سریع پزشک مناسب را پیدا
                    کنید. داک‌تایم برای رزرو آنلاین، مشاهده زمان‌های خالی و دسترسی راحت‌تر به
                    پزشکان طراحی شده است.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                    <Link
                      to="/search"
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-3.5 text-sm font-black text-white shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl md:px-8 md:text-base"
                    >
                      شروع جستجوی پزشک
                    </Link>

                    <Link
                      to="/doctors"
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-black text-slate-800 transition-all duration-300 hover:border-emerald-300 hover:text-emerald-800 md:px-8 md:text-base"
                    >
                      مشاهده همه پزشکان
                    </Link>
                  </div>

                  <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-white/70 bg-white/70 px-4 py-4 text-center shadow-sm"
                      >
                        <p className="text-2xl font-black text-emerald-700 md:text-3xl">
                          {stat.value}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-600 md:text-sm">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hero Aside */}
                <div className="relative">
                  <div className="rounded-[30px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                    <div className="rounded-[24px] bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-5">
                      <div className="mb-5 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-extrabold text-slate-500">نوبت نزدیک</p>
                          <p className="mt-1 text-lg font-black text-slate-900">
                            {TOP_DOCTORS[0]?.name ?? "پزشک پیشنهادی"}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white px-3 py-2 text-2xl shadow-sm">🩺</div>
                      </div>

                      <div className="space-y-3">
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <p className="text-xs font-extrabold text-slate-500">تخصص</p>
                          <p className="mt-1 text-sm font-black text-slate-900">
                            {TOP_DOCTORS[0]?.specialty ?? "متخصص داخلی"}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <p className="text-xs font-extrabold text-slate-500">اولین زمان خالی</p>
                            <p className="mt-1 text-sm font-black text-emerald-700">
                              {TOP_DOCTORS[0]?.nextAvailable ?? "امروز"}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <p className="text-xs font-extrabold text-slate-500">امتیاز</p>
                            <p className="mt-1 text-sm font-black text-amber-600">
                              ★ {TOP_DOCTORS[0]?.rating ?? "4.9"}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                          <p className="text-sm font-bold leading-7 text-emerald-900">
                            با جستجوی هوشمند بر اساس تخصص، شهر و نام پزشک، سریع‌تر به پزشک مناسب
                            برسید.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -left-4 -top-4 hidden rounded-2xl bg-white px-4 py-3 shadow-lg md:block">
                    <p className="text-xs font-extrabold text-slate-500">رزرو موفق</p>
                    <p className="mt-1 text-lg font-black text-emerald-700">+۵۰,۰۰۰</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= SEARCH BOX ================= */}
            <div
              data-reveal-id="search"
              className={`relative z-20 mx-auto -mt-10 max-w-6xl px-1 ${revealClass("search")}`}
            >
              <form
                onSubmit={handleSearchSubmit}
                className="rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-[0_24px_60px_rgba(16,24,40,0.10)] backdrop-blur-2xl md:rounded-[32px]"
              >
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.2fr_1.2fr_1.6fr_auto]">
                  {/* Location */}
                  <div ref={locationRef} className="relative">
                    <button
                      type="button"
                      aria-expanded={isLocationOpen}
                      onClick={() => {
                        setIsLocationOpen((prev) => !prev);
                        setIsSpecialtyOpen(false);
                      }}
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-right transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/30"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-lg text-emerald-700">
                          📍
                        </div>
                        <div className="min-w-0 flex-1 text-right">
                          <p className="mb-1 text-[11px] font-extrabold text-slate-500">موقعیت</p>
                          <p className="truncate text-sm font-black text-slate-900 md:text-base">
                            {selectedCity
                              ? `${selectedProvince}، ${selectedCity}`
                              : selectedProvince
                              ? `استان ${selectedProvince}`
                              : "انتخاب استان و شهر"}
                          </p>
                        </div>
                      </div>
                      <span className="text-slate-400">▼</span>
                    </button>

                    {isLocationOpen && (
                      <div className="absolute right-0 top-full z-50 mt-3 w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl lg:w-[520px]">
                        <div className="grid h-[360px] grid-cols-2">
                          {/* Provinces */}
                          <div className="overflow-y-auto border-l border-slate-100 p-4">
                            <h3 className="mb-3 text-xs font-extrabold tracking-wide text-slate-500">
                              استان‌ها
                            </h3>
                            <div className="space-y-2">
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
                                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                                      active
                                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                                        : "text-slate-800 hover:bg-emerald-50 hover:text-emerald-800"
                                    }`}
                                  >
                                    <span>{province.name}</span>
                                    {active && <span>✓</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Cities */}
                          <div className="overflow-y-auto p-4">
                            <h3 className="mb-3 text-xs font-extrabold tracking-wide text-slate-500">
                              شهرهای {selectedProvince || "..."}
                            </h3>

                            {selectedProvince ? (
                              <div className="space-y-2">
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
                                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                                        active
                                          ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md"
                                          : "text-slate-800 hover:bg-teal-50 hover:text-teal-800"
                                      }`}
                                    >
                                      <span>{city}</span>
                                      {active && <span>✓</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="flex h-full min-h-[220px] items-center justify-center rounded-2xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-400">
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
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-right transition-all duration-200 hover:border-cyan-200 hover:bg-cyan-50/20"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-50 text-lg text-cyan-700">
                          🩺
                        </div>
                        <div className="min-w-0 flex-1 text-right">
                          <p className="mb-1 text-[11px] font-extrabold text-slate-500">تخصص</p>
                          <p className="truncate text-sm font-black text-slate-900 md:text-base">
                            {selectedSpecialty || "همه تخصص‌ها"}
                          </p>
                        </div>
                      </div>
                      <span className="text-slate-400">▼</span>
                    </button>

                    {isSpecialtyOpen && (
                      <div className="absolute right-0 top-full z-50 mt-3 max-h-[360px] w-full overflow-y-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl lg:w-[320px]">
                        <h3 className="mb-3 text-xs font-extrabold tracking-wide text-slate-500">
                          لیست تخصص‌ها
                        </h3>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSpecialty(null);
                            setIsSpecialtyOpen(false);
                          }}
                          className="mb-2 flex w-full items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
                        >
                          <span>همه تخصص‌ها</span>
                          <span>🔄</span>
                        </button>

                        <div className="space-y-2">
                          {specialties.map((spec) => {
                            const active = selectedSpecialty === spec;
                            return (
                              <button
                                key={spec}
                                type="button"
                                onClick={() => {
                                  setSelectedSpecialty(spec);
                                  setIsSpecialtyOpen(false);
                                }}
                                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                                  active
                                    ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md"
                                    : "text-slate-800 hover:bg-cyan-50 hover:text-cyan-800"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span>🩺</span>
                                  <span>{spec}</span>
                                </div>
                                {active && <span>✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Search input */}
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      🔍
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="نام پزشک، تخصص، بیماری یا مرکز درمانی..."
                      className="h-full min-h-[60px] w-full rounded-2xl border border-slate-200 bg-white px-12 py-4 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 md:text-base"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="inline-flex min-h-[60px] items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 text-sm font-black text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl md:text-base"
                  >
                    جستجوی پزشک
                  </button>
                </div>

                {/* Active filters */}
                {activeFilters.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                    {activeFilters.map((filter) => (
                      <button
                        key={filter.key}
                        type="button"
                        onClick={filter.onRemove}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-extrabold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        <span>{filter.label}</span>
                        <span>✕</span>
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mr-auto inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-extrabold text-rose-700 transition hover:bg-rose-100"
                    >
                      حذف همه فیلترها
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>

        {/* ================= WHY DOCTIME ================= */}
        <section
          data-reveal-id="benefits"
          className={`px-4 ${revealClass("benefits")}`}
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <span className="inline-flex rounded-full border border-emerald-200 bg-white px-5 py-2 text-xs font-extrabold text-emerald-900">
                چرا داک‌تایم
              </span>
              <h2 className="mt-5 text-3xl font-black text-slate-900 md:text-5xl">
                تجربه‌ای ساده‌تر برای نوبت‌گیری پزشکی
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-sm font-semibold leading-8 text-slate-600 md:text-lg">
                همه‌چیز برای پیدا کردن پزشک مناسب و رزرو نوبت، در یک مسیر سریع و واضح طراحی شده
                است.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {benefits.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/70 bg-white/70 p-7 shadow-[0_14px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_55px_rgba(16,185,129,0.12)]"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{item.title}</h3>
                  <p className="mt-3 text-sm font-semibold leading-8 text-slate-600">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= SPECIALTIES ================= */}
        <section
          data-reveal-id="specialties"
          className={`px-4 ${revealClass("specialties")}`}
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <span className="inline-flex rounded-full border border-emerald-200 bg-white px-5 py-2 text-xs font-extrabold text-emerald-900">
                انتخاب تخصص
              </span>
              <h2 className="mt-5 text-3xl font-black text-slate-900 md:text-5xl">
                تخصص‌های محبوب
              </h2>
              <p className="mt-4 text-sm font-semibold leading-8 text-slate-600 md:text-lg">
                پرجستجوترین تخصص‌ها را انتخاب کنید و سریع‌تر به پزشک موردنظر برسید.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {SPECIALTIES.map((spec) => {
                const active = selectedSpecialty === spec.title;
                return (
                  <button
                    key={spec.id}
                    onClick={() => setSelectedSpecialty(spec.title)}
                    className={`rounded-3xl border p-5 text-center transition-all duration-300 ${
                      active
                        ? "border-emerald-300 bg-white shadow-[0_16px_40px_rgba(16,185,129,0.15)] ring-2 ring-emerald-100"
                        : "border-white/70 bg-white/70 shadow-[0_12px_35px_rgba(15,23,42,0.05)] hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-[0_18px_45px_rgba(16,185,129,0.10)]"
                    }`}
                  >
                    <div className="mb-4 text-5xl">{spec.icon}</div>
                    <div className="text-sm font-extrabold text-slate-800">{spec.title}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/specialties"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-800 transition hover:border-emerald-300 hover:text-emerald-800"
              >
                مشاهده همه تخصص‌ها
              </Link>
            </div>
          </div>
        </section>

        {/* ================= TOP DOCTORS ================= */}
        <section
          data-reveal-id="doctors"
          className={`px-4 ${revealClass("doctors")}`}
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex flex-col items-center justify-between gap-5 text-center md:flex-row md:text-right">
              <div>
                <span className="inline-flex rounded-full border border-emerald-200 bg-white px-5 py-2 text-xs font-extrabold text-emerald-900">
                  پزشکان پیشنهادی
                </span>
                <h2 className="mt-5 text-3xl font-black text-slate-900 md:text-5xl">
                  پزشکان برتر داک‌تایم
                </h2>
                <p className="mt-4 text-sm font-semibold leading-8 text-slate-600 md:text-lg">
                  پزشکان محبوب با امتیاز بالا، زمان خالی فعال و دسترسی سریع
                </p>
              </div>

              <Link
                to="/doctors"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-800 transition hover:border-emerald-300 hover:text-emerald-800"
              >
                مشاهده همه پزشکان
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {TOP_DOCTORS.map((doc) => (
                <Link
                  key={doc.id}
                  to={`/doctor/${doc.id}`}
                  className="group rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(16,185,129,0.12)]"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="h-20 w-20 rounded-full object-cover ring-4 ring-emerald-100 shadow-md"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-black text-slate-900 transition-colors group-hover:text-emerald-800">
                            {doc.name}
                          </h3>
                          <p className="mt-1 text-sm font-bold text-slate-600">{doc.specialty}</p>
                        </div>

                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                          ★ {doc.rating}
                        </span>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-emerald-800">
                          {doc.nextAvailable}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-600">
                          رزرو آنلاین
                        </span>
                      </div>

                      <div className="mt-5 inline-flex items-center gap-2 text-sm font-black text-emerald-700">
                        مشاهده پروفایل
                        <span className="transition-transform duration-300 group-hover:-translate-x-1">
                          ←
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ================= QUICK BOOKING ================= */}
        <section
          data-reveal-id="quick-booking"
          className={`px-4 ${revealClass("quick-booking")}`}
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <span className="inline-flex rounded-full border border-emerald-200 bg-white px-5 py-2 text-xs font-extrabold text-emerald-900">
                رزرو فوری
              </span>
              <h2 className="mt-5 text-3xl font-black text-slate-900 md:text-5xl">
                رزرو سریع نوبت
              </h2>
              <p className="mt-4 text-sm font-semibold leading-8 text-slate-600 md:text-lg">
                پزشک موردنظر را انتخاب کنید و مستقیم زمان‌های خالی او را ببینید.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              {/* Calendar */}
              <div className="order-2 rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl lg:order-1 md:p-8">
                {selectedDoctor ? (
                  <>
                    <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-emerald-50/70 p-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={selectedDoctor.image}
                          alt={selectedDoctor.name}
                          className="h-16 w-16 rounded-full object-cover ring-4 ring-white shadow"
                        />
                        <div>
                          <h3 className="text-lg font-black text-slate-900">
                            {selectedDoctor.name}
                          </h3>
                          <p className="mt-1 text-sm font-bold text-slate-600">
                            {selectedDoctor.specialty}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-amber-700">
                          ★ {selectedDoctor.rating}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700">
                          {selectedDoctor.nextAvailable}
                        </span>
                      </div>
                    </div>

                    <BookingCalendar doctorId={selectedDoctor.id} />
                  </>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                    <p className="text-lg font-black text-slate-500">
                      برای شروع نوبت‌گیری، یکی از پزشکان را انتخاب کنید.
                    </p>
                  </div>
                )}
              </div>

              {/* Doctor selector */}
              <div className="order-1 lg:order-2">
                <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
                  <h3 className="mb-4 text-xl font-black text-slate-900">انتخاب پزشک</h3>
                  <div className="space-y-3">
                    {TOP_DOCTORS.map((doc) => {
                      const active = selectedDoctorId === doc.id;
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => setSelectedDoctorId(doc.id)}
                          className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-right transition-all duration-300 ${
                            active
                              ? "border-emerald-300 bg-emerald-50 shadow-md ring-2 ring-emerald-100"
                              : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
                          }`}
                        >
                          <img
                            src={doc.image}
                            alt={doc.name}
                            className="h-14 w-14 rounded-full object-cover ring-2 ring-emerald-100"
                          />

                          <div className="min-w-0 flex-1 text-right">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-black text-slate-900">
                                {doc.name}
                              </p>
                              {active && (
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
                                  ✓
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs font-bold text-slate-500">{doc.specialty}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-black text-amber-600">
                                ★ {doc.rating}
                              </span>
                              <span className="text-slate-300">|</span>
                              <span className="text-[11px] font-extrabold text-emerald-700">
                                {doc.nextAvailable}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ARTICLES ================= */}
        <section
          data-reveal-id="articles"
          className={`px-4 ${revealClass("articles")}`}
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex flex-col items-center justify-between gap-5 text-center md:flex-row md:text-right">
              <div>
                <span className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-extrabold text-slate-700">
                  مجله سلامت
                </span>
                <h2 className="mt-5 text-3xl font-black text-slate-900 md:text-5xl">
                  مقالات و راهنمای سلامت
                </h2>
                <p className="mt-4 text-sm font-semibold leading-8 text-slate-600 md:text-lg">
                  مطالب کاربردی برای انتخاب بهتر پزشک و مراقبت از سلامتی
                </p>
              </div>

              <Link
                to="/articles"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-800 transition hover:border-emerald-300 hover:text-emerald-800"
              >
                مشاهده همه مقالات
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {ARTICLES.map((article) => (
                <Link
                  key={article.id}
                  to={`/articles/${article.id}`}
                  className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-slate-50">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  <div className="p-6">
                    <h3 className="line-clamp-2 text-lg font-black text-slate-900 transition-colors group-hover:text-emerald-800">
                      {article.title}
                    </h3>

                    <p className="mt-3 line-clamp-3 text-sm font-semibold leading-7 text-slate-600">
                      {article.excerpt}
                    </p>

                    <div className="mt-5 flex items-center justify-between text-xs font-extrabold text-slate-500">
                      <span>{article.date}</span>
                      <span className="text-emerald-700 transition-transform group-hover:-translate-x-1">
                        مطالعه مقاله ←
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section
          data-reveal-id="cta"
          className={`px-4 ${revealClass("cta")}`}
        >
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-[36px] border border-emerald-100 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 text-center shadow-[0_20px_60px_rgba(16,185,129,0.20)] md:p-14">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.14),transparent_28%)]" />

              <div className="relative z-10">
                <h2 className="text-3xl font-black text-white md:text-5xl">
                  همین امروز نوبت بگیرید
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-sm font-semibold leading-8 text-white/90 md:text-lg">
                  بدون اتلاف وقت، پزشک موردنظر خود را پیدا کنید، زمان خالی را ببینید و نوبت خود
                  را آنلاین رزرو کنید.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-black text-emerald-800 shadow-xl transition-all duration-300 hover:scale-[1.03] md:text-base"
                  >
                    ثبت‌نام رایگان
                  </Link>

                  <Link
                    to="/search"
                    className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 py-4 text-sm font-black text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 md:text-base"
                  >
                    جستجوی پزشک
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}