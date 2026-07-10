import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PROVINCES_CITIES } from "../data/provinces";
import { specialties } from "../data/specialties";
import { TOP_DOCTORS, ARTICLES } from "../data/mockData";
import BookingCalendar from "../components/BookingCalendar";
import SafeImage from "../components/common/SafeImage";

type RevealKey =
  | "hero"
  | "search"
  | "services"
  | "doctors"
  | "quick-booking"
  | "articles"
  | "cta";

const HOME_SERVICES = [
  {
    id: 1,
    title: "نوبت پزشکان",
    desc: "رزرو نوبت حضوری پزشکان متخصص، عمومی و فوق تخصص",
    icon: "🩺",
    href: "/doctors",
    badge: "حضوری + آنلاین",
  },
  {
    id: 2,
    title: "کلینیک",
    desc: "مشاهده کلینیک‌ها، خدمات درمانی و رزرو نوبت",
    icon: "🏥",
    href: "/clinics",
    badge: "مراکز درمانی",
  },
  {
    id: 3,
    title: "آزمایشگاه",
    desc: "جستجوی آزمایشگاه‌ها و دریافت نوبت خدمات آزمایش",
    icon: "🧪",
    href: "/labs",
    badge: "آزمایش و چکاپ",
  },
  {
    id: 4,
    title: "بیمارستان",
    desc: "یافتن بیمارستان‌ها، مراکز تخصصی و خدمات بستری",
    icon: "🏨",
    href: "/hospitals",
    badge: "مراکز بیمارستانی",
  },
  {
    id: 5,
    title: "پزشکان آنلاین",
    desc: "مشاوره پزشکی آنلاین، متنی، صوتی یا تصویری",
    icon: "💻",
    href: "/online-doctors",
    badge: "ویزیت آنلاین",
  },
  {
    id: 6,
    title: "پزشکان خیریه",
    desc: "پزشکان خیریه با امکان ویزیت حضوری یا آنلاین",
    icon: "🤝",
    href: "/charity-doctors",
    badge: "حضوری + آنلاین",
  },
];

const WHY_DOCTIME_ITEMS = [
  {
    id: 1,
    icon: "⚡",
    title: "نوبت‌گیری سریع",
    desc: "در چند ثانیه پزشک، کلینیک یا مرکز درمانی موردنظر خود را پیدا کنید و نوبت بگیرید.",
  },
  {
    id: 2,
    icon: "🩺",
    title: "پزشکان معتبر",
    desc: "پروفایل پزشکان با تخصص، امتیاز، زمان حضور، نوع ویزیت و اطلاعات تکمیلی نمایش داده می‌شود.",
  },
  {
    id: 3,
    icon: "📅",
    title: "رزرو آنلاین ۲۴ ساعته",
    desc: "در هر ساعت از شبانه‌روز بدون تماس تلفنی، نوبت خود را ثبت کنید.",
  },
  {
    id: 4,
    icon: "💻",
    title: "ویزیت حضوری و آنلاین",
    desc: "امکان رزرو ویزیت حضوری، تصویری، صوتی یا متنی متناسب با نیاز شما فراهم است.",
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

  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(
    TOP_DOCTORS[0]?.id ?? null
  );

  const [revealedSections, setRevealedSections] = useState<Set<RevealKey>>(
    new Set()
  );

  const locationRef = useRef<HTMLDivElement>(null);
  const specialtyRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

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
      const specialtyLabel =
        specialties.find((s) => s.value === selectedSpecialty)?.label ??
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
        threshold: 0.15,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    const elements = document.querySelectorAll("[data-reveal-id]");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
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

  const revealClass = (key: RevealKey) =>
    `transition-all duration-1000 ease-out ${
      revealedSections.has(key)
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-8"
    }`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#effcff_0%,#ffffff_42%,#f4fbff_100%)] text-slate-900">
      {/* background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute right-[-140px] top-[-80px] h-[340px] w-[340px] rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute left-[-120px] top-[240px] h-[300px] w-[300px] rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[15%] h-[320px] w-[320px] rounded-full bg-teal-200/20 blur-3xl" />
      </div>

      <div className="relative z-10 space-y-24 pb-16">
        {/* HERO */}
        <section className="relative px-4 pt-4 md:pt-6">
          <div className="mx-auto max-w-7xl">
            <div
              data-reveal-id="hero"
              className={`relative overflow-hidden rounded-[28px] border border-cyan-100/70 bg-white/85 px-6 py-8 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:px-10 md:py-9 lg:px-12 ${revealClass(
                "hero"
              )}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.10),transparent_28%),radial-gradient(circle_at_center,rgba(255,255,255,0.55),transparent_60%)]" />

              <div className="relative z-10 mx-auto max-w-4xl text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/80 bg-white/90 px-4 py-2 shadow-sm backdrop-blur">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-500 shadow-[0_0_0_4px_rgba(6,182,212,0.14)]" />
                </div>
                <h1 className="mt-5">
                 <span className="inline-flex rounded-2xl border border-cyan-100 bg-cyan-50/80 px-4 py-3 text-lg font-extrabold leading-8 text-cyan-900 shadow-sm md:px-5 md:py-3.5 md:text-[1.55rem] lg:text-[1.8rem]">
                       رزرو آنلاین پزشک، کلینیک، آزمایشگاه و بیمارستان
                  </span>
                 </h1>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    to="/search"
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gradient-to-r from-cyan-600 to-teal-600 px-8 text-sm font-black text-white shadow-[0_14px_35px_rgba(6,182,212,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(6,182,212,0.35)] md:text-base"
                  >
                    شروع جستجو
                  </Link>

                  <Link
                    to="/doctors"
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-slate-200 bg-white/90 px-8 text-sm font-black text-slate-800 shadow-sm transition-all duration-300 hover:border-cyan-300 hover:text-cyan-800 md:text-base"
                  >
                    مشاهده پزشکان
                  </Link>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-xs font-extrabold text-cyan-800">
                    <span className="text-sm">✓</span>
                    نوبت‌دهی پزشکان متخصص
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-xs font-extrabold text-sky-800">
                    <span className="text-sm">✓</span>
                    ویزیت آنلاین و حضوری
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-700">
                    <span className="text-sm">✓</span>
                    جستجو بر اساس شهر و تخصص
                  </div>
                </div>
              </div>
            </div>

            {/* SEARCH BOX */}
            <div
              data-reveal-id="search"
              className={`relative z-20 mx-auto -mt-8 max-w-6xl px-1 ${revealClass(
                "search"
              )}`}
            >
              <form
                onSubmit={handleSearchSubmit}
                className="rounded-[30px] border border-white/70 bg-white/90 p-4 shadow-[0_24px_60px_rgba(16,24,40,0.10)] backdrop-blur-2xl md:rounded-[34px] md:p-5"
              >
                <div className="grid grid-cols-1 gap-3">
                  {/* province (dropdown also lets the user pick a city inside it) */}
                  <div ref={locationRef} className="relative">
                    <button
                      type="button"
                      aria-expanded={isLocationOpen}
                      onClick={() => {
                        setIsLocationOpen((prev) => !prev);
                        setIsSpecialtyOpen(false);
                      }}
                      className="flex min-h-[78px] w-full items-center justify-between gap-3 rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-right shadow-sm transition-all duration-200 hover:border-cyan-200 hover:bg-cyan-50/30"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl text-slate-500">⌄</span>
                        <div className="text-right">
                          <p className="text-[12px] font-extrabold text-slate-500">
                            استان{selectedCity ? " / شهر" : ""}
                          </p>
                          <p className="mt-1 text-lg font-black text-slate-900">
                            {selectedCity
                              ? `${selectedProvince} - ${selectedCity}`
                              : selectedProvince || "انتخاب استان"}
                          </p>
                        </div>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-xl text-cyan-700">
                        📍
                      </div>
                    </button>

                    {isLocationOpen && (
                      <div className="absolute right-0 top-full z-50 mt-3 w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:w-[720px]">
                        <div className="grid h-[380px] grid-cols-2">
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
                                        ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md"
                                        : "text-slate-800 hover:bg-cyan-50 hover:text-cyan-800"
                                    }`}
                                  >
                                    <span>{province.name}</span>
                                    {active && <span>✓</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

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
                                          ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md"
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
                </div>

                {/* specialty */}
                <div className="mt-3">
                  <div ref={specialtyRef} className="relative">
                    <button
                      type="button"
                      aria-expanded={isSpecialtyOpen}
                      onClick={() => {
                        setIsSpecialtyOpen((prev) => !prev);
                        setIsLocationOpen(false);
                      }}
                      className="flex min-h-[78px] w-full items-center justify-between gap-3 rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-right shadow-sm transition-all duration-200 hover:border-cyan-200 hover:bg-cyan-50/20"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl text-slate-500">⌄</span>
                        <div className="text-right">
                          <p className="text-[12px] font-extrabold text-slate-500">
                            تخصص
                          </p>
                          <p className="mt-1 text-lg font-black text-slate-900">
                            {selectedSpecialty
                              ? specialties.find((s) => s.value === selectedSpecialty)?.label ?? selectedSpecialty
                              : "لیست تخصص‌ها"}
                          </p>
                        </div>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-xl text-cyan-700">
                        🩺
                      </div>
                    </button>

                    {isSpecialtyOpen && (
                      <div className="absolute right-0 top-full z-50 mt-3 max-h-[380px] w-full overflow-y-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl md:w-[420px]">
                        <h3 className="mb-3 text-xs font-extrabold tracking-wide text-slate-500">
                          لیست تخصص‌ها
                        </h3>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSpecialty(null);
                            setIsSpecialtyOpen(false);
                          }}
                          className="mb-2 flex w-full items-center justify-between rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-800 transition hover:bg-cyan-100"
                        >
                          <span>همه تخصص‌ها</span>
                          <span>🔄</span>
                        </button>

                        <div className="space-y-2">
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
                                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                                  active
                                    ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md"
                                    : "text-slate-800 hover:bg-cyan-50 hover:text-cyan-800"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span>🩺</span>
                                  <span>{spec.label}</span>
                                </div>
                                {active && <span>✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* query */}
                <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
                  <div className="relative">
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xl text-slate-400">
                      🔍
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="جستجوی نام پزشک، تخصص یا بیماری..."
                      className="min-h-[64px] w-full rounded-[20px] border border-slate-200 bg-slate-50/50 py-3 pl-5 pr-14 text-sm font-bold text-slate-800 transition focus:border-cyan-300 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex min-h-[64px] items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-cyan-600 to-teal-600 px-8 font-black text-white shadow-[0_8px_20px_rgba(6,182,212,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(6,182,212,0.25)]"
                  >
                    <span>جستجو</span>
                    <span>🔍</span>
                  </button>
                </div>

                {activeFilters.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                    <span className="text-xs font-extrabold text-slate-500">
                      فیلترهای فعال:
                    </span>

                    {activeFilters.map((filter) => (
                      <div
                        key={filter.key}
                        className="inline-flex items-center gap-2 rounded-xl bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-800"
                      >
                        <span>{filter.label}</span>
                        <button
                          type="button"
                          onClick={filter.onRemove}
                          className="hover:text-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mr-auto text-xs font-black text-red-600 hover:underline"
                    >
                      پاک کردن همه
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section
          data-reveal-id="services"
          className={`mx-auto max-w-7xl px-4 ${revealClass("services")}`}
        >
          <div className="text-center">
            <h2 className="text-3xl font-black text-slate-900 md:text-4xl">
              خدمات نوبت‌دهی داک‌تایم
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-bold leading-7 text-slate-500">
              خدمت مورد نظر خود را انتخاب کرده و مراحل رزرو نوبت آنلاین را آغاز
              کنید.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {HOME_SERVICES.map((service) => (
              <Link
                key={service.id}
                to={service.href}
                className="group relative overflow-hidden rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-200 hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)]"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-teal-500 opacity-80" />

                <div className="flex items-center justify-between">
                  <span className="text-4xl">{service.icon}</span>
                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-black text-cyan-800">
                    {service.badge}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-black text-slate-900 transition group-hover:text-cyan-800">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm font-bold leading-7 text-slate-500">
                  {service.desc}
                </p>

                <div className="mt-5 text-sm font-black text-cyan-700 opacity-0 transition group-hover:opacity-100">
                  مشاهده و رزرو ←
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* DOCTORS */}
        <section
          data-reveal-id="doctors"
          className={`mx-auto max-w-7xl px-4 ${revealClass("doctors")}`}
        >
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h2 className="text-3xl font-black text-slate-900">
                پزشکان برجسته داک‌تایم
              </h2>
              <p className="mt-2 text-sm font-bold text-slate-500">
                پرامتیازترین پزشکان بر اساس نظرات و بازخورد بیماران.
              </p>
            </div>

            <Link
              to="/doctors"
              className="text-sm font-black text-cyan-700 hover:underline"
            >
              مشاهده همه پزشکان ←
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TOP_DOCTORS.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoctorId(doc.id)}
                className={`cursor-pointer rounded-[28px] border p-5 transition-all duration-300 ${
                  selectedDoctorId === doc.id
                    ? "border-cyan-500 bg-cyan-50/20 shadow-[0_12px_30px_rgba(6,182,212,0.08)]"
                    : "border-slate-100 bg-white hover:border-slate-300"
                }`}
              >
                <div className="relative h-48 overflow-hidden rounded-2xl bg-slate-100">
                  <SafeImage
                    src={doc.image}
                    alt={doc.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-3 top-3 rounded-xl bg-white/95 px-2 py-1 text-xs font-black text-amber-600 shadow-sm backdrop-blur">
                    ★ {doc.rating}
                  </div>
                </div>

                <h3 className="mt-4 text-lg font-black text-slate-900">
                  {doc.name}
                </h3>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  {doc.specialty}
                </p>
                <p className="mt-3 text-xs font-black text-cyan-800">
                  نزدیک‌ترین زمان: {doc.nextAvailable}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* QUICK BOOKING */}
        {selectedDoctor && (
          <section
            data-reveal-id="quick-booking"
            className={`mx-auto max-w-4xl px-4 ${revealClass("quick-booking")}`}
          >
            <div className="rounded-[36px] border border-cyan-100 bg-white p-6 shadow-xl md:p-10">
              <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900">
                  رزرو سریع نوبت برای {selectedDoctor.name}
                </h2>
                <p className="mt-1 text-sm font-bold text-slate-500">
                  تاریخ موردنظر را از تقویم زیر انتخاب کنید و نوبت خود را آنلاین
                  نهایی کنید.
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

        {/* ARTICLES */}
        <section
          data-reveal-id="articles"
          className={`mx-auto max-w-7xl px-4 ${revealClass("articles")}`}
        >
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h2 className="text-3xl font-black text-slate-900">
                مجله سلامت داک‌تایم
              </h2>
              <p className="mt-2 text-sm font-bold text-slate-500">
                آخرین اخبار پزشکی و مقالات علمی معتبر در حوزه سلامت.
              </p>
            </div>

            <Link
              to="/articles"
              className="text-sm font-black text-cyan-700 hover:underline"
            >
              مشاهده همه مقالات ←
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ARTICLES.map((article) => (
              <article
                key={article.id}
                className="group overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:shadow-md"
              >
                <div className="h-48 overflow-hidden bg-slate-100">
                  <SafeImage
                    src={article.image}
                    alt={article.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-6">
                  <span className="text-[11px] font-black text-cyan-800">
                    {article.category}
                  </span>

                  <h3 className="mt-3 text-lg font-black leading-7 text-slate-900 group-hover:text-cyan-800">
                    {article.title}
                  </h3>

                  <p className="mt-2 text-xs font-bold leading-6 text-slate-500">
                    {article.excerpt}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-slate-400">
                    <span>{article.date}</span>
                    <span className="text-cyan-700 group-hover:underline">
                      مطالعه مقاله ←
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* WHY DOCTIME */}
        <section
          data-reveal-id="cta"
          className={`mx-auto max-w-7xl px-4 ${revealClass("cta")}`}
        >
          <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-cyan-600 via-sky-600 to-teal-600 px-6 py-10 text-white shadow-[0_25px_60px_rgba(8,145,178,0.28)] md:px-10 md:py-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.14),transparent_30%)]" />

            <div className="relative z-10">
              <div className="text-center">
                <div className="inline-flex items-center rounded-full bg-white/15 px-4 py-2 text-sm font-black backdrop-blur">
                  چرا داک‌تایم؟
                </div>

                <h2 className="mt-5 text-3xl font-black md:text-4xl">
                  رزرو درمانی، سریع‌تر و مطمئن‌تر
                </h2>

                <p className="mx-auto mt-4 max-w-3xl text-sm font-bold leading-8 text-cyan-50 md:text-base">
                  ما فرایند سخت و زمان‌بر رزرو حضوری و تلفنی نوبت پزشک را با
                  سیستمی ساده و مطمئن جایگزین کرده‌ایم تا تمرکز شما فقط روی
                  سلامتی‌تان باشد.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {WHY_DOCTIME_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[24px] border border-white/20 bg-white/10 p-5 backdrop-blur-md"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-black text-white">{item.title}</h3>
                    <p className="mt-3 text-sm font-bold leading-7 text-cyan-50/95">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
