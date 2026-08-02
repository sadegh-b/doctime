import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PROVINCES_CITIES } from "../data/provinces";
import { specialties } from "../data/specialties";
import { TOP_DOCTORS, ARTICLES } from "../data/mockData";
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

  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(
    TOP_DOCTORS[0]?.id ?? null
  );

  const locationRef = useRef<HTMLDivElement>(null);
  const specialtyRef = useRef<HTMLDivElement>(null);

  const availableCities = useMemo(() => {
    if (!selectedProvince) return [];
    const province = PROVINCES_CITIES.find((item) => item.name === selectedProvince);
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
      {/* Hero */}
      <section className="border-b border-blue-100 bg-blue-600">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center md:py-20">
          <h1 className="text-2xl font-black text-white md:text-4xl">
            رزرو آنلاین نوبت پزشک، کلینیک، آزمایشگاه و بیمارستان
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm font-medium text-blue-100 md:text-base">
            نوبت خود را در کمتر از یک دقیقه، بدون تماس تلفنی رزرو کنید.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/search"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              شروع جستجو
            </Link>
            <Link
              to="/doctors"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-blue-400 px-8 text-sm font-bold text-white transition hover:bg-blue-500"
            >
              مشاهده پزشکان
            </Link>
          </div>
        </div>
      </section>

      {/* Search card */}
      <section className="mx-auto -mt-8 max-w-4xl px-4">
        <form
          onSubmit={handleSearchSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg md:p-6"
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
                className="flex h-16 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 text-right transition hover:border-blue-300"
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
                <span className="text-lg text-blue-600">📍</span>
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
                                  ? "bg-blue-600 text-white"
                                  : "text-slate-700 hover:bg-blue-50"
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
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-700 hover:bg-blue-50"
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
                className="flex h-16 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 text-right transition hover:border-blue-300"
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
                <span className="text-lg text-blue-600">🩺</span>
              </button>

              {isSpecialtyOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 max-h-[340px] w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSpecialty(null);
                      setIsSpecialtyOpen(false);
                    }}
                    className="mb-1 flex w-full items-center justify-between rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
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
                              ? "bg-blue-600 text-white"
                              : "text-slate-700 hover:bg-blue-50"
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
              className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 transition focus:border-blue-400 focus:bg-white focus:outline-none"
            />

            <button
              type="submit"
              className="h-14 rounded-xl bg-blue-600 px-8 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              جستجو
            </button>
          </div>

          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
              {activeFilters.map((filter) => (
                <div
                  key={filter.key}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
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
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md"
            >
              <span className="text-3xl">{service.icon}</span>
              <h3 className="mt-4 text-lg font-black text-slate-900 group-hover:text-blue-700">
                {service.title}
              </h3>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                {service.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Doctors */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <h2 className="text-2xl font-black text-slate-900 md:text-3xl">
            پزشکان برجسته
          </h2>
          <Link to="/doctors" className="text-sm font-bold text-blue-700 hover:underline">
            مشاهده همه پزشکان ←
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TOP_DOCTORS.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoctorId(doc.id)}
              className={`cursor-pointer rounded-2xl border p-4 transition ${
                selectedDoctorId === doc.id
                  ? "border-blue-500 bg-blue-50/40"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="relative h-40 overflow-hidden rounded-xl bg-slate-100">
                <SafeImage src={doc.image} alt={doc.name} className="h-full w-full object-cover" />
                <div className="absolute left-2 top-2 rounded-lg bg-white px-2 py-1 text-xs font-bold text-amber-600 shadow-sm">
                  ★ {doc.rating}
                </div>
              </div>

              <h3 className="mt-3 text-base font-black text-slate-900">{doc.name}</h3>
              <p className="mt-1 text-xs font-semibold text-slate-500">{doc.specialty}</p>
              <p className="mt-2 text-xs font-bold text-blue-700">
                نزدیک‌ترین زمان: {doc.nextAvailable}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick booking */}
      {selectedDoctor && (
        <section className="mx-auto max-w-3xl px-4 py-16">
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm md:p-10">
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
          <Link to="/articles" className="text-sm font-bold text-blue-700 hover:underline">
            مشاهده همه مقالات ←
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((article) => (
            <article
              key={article.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:shadow-md"
            >
              <div className="h-40 overflow-hidden bg-slate-100">
                <SafeImage src={article.image} alt={article.title} className="h-full w-full object-cover" />
              </div>

              <div className="p-5">
                <span className="text-xs font-bold text-blue-700">{article.category}</span>
                <h3 className="mt-2 text-base font-black leading-6 text-slate-900">
                  {article.title}
                </h3>
                <p className="mt-2 text-xs font-medium leading-6 text-slate-500">
                  {article.excerpt}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-slate-400">
                  <span>{article.date}</span>
                  <span className="text-blue-700">مطالعه مقاله ←</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Why DocTime */}
      <section className="bg-blue-600">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="text-center text-white">
            <h2 className="text-2xl font-black md:text-3xl">چرا داک‌تایم؟</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-blue-100">
              فرایند رزرو حضوری و تلفنی نوبت را با سیستمی ساده و مطمئن جایگزین کرده‌ایم.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_DOCTIME_ITEMS.map((item) => (
              <div key={item.id} className="rounded-2xl bg-blue-500/40 p-5">
                <span className="text-2xl">{item.icon}</span>
                <h3 className="mt-3 text-base font-black text-white">{item.title}</h3>
                <p className="mt-2 text-xs font-medium leading-6 text-blue-100">
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
