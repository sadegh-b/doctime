import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Stethoscope,
  ChevronDown,
  ArrowLeft,
  Sparkles,
  Newspaper,
  HeartPulse,
  Pill,
} from "lucide-react";

import { PROVINCES_CITIES } from "../data/provinces";
import { specialties } from "../data/specialties";
import { TOP_DOCTORS } from "../data/mockData";
import BookingCalendar from "../components/BookingCalendar";
import SafeImage from "../components/common/SafeImage";

type RevealKey =
  | "hero"
  | "search"
  | "services"
  | "doctors"
  | "quick-booking"
  | "articles";

const HOME_SERVICES = [
  {
    id: 1,
    title: "نوبت پزشکان",
    desc: "رزرو نوبت حضوری پزشکان متخصص، عمومی و فوق تخصص",
    icon: <Stethoscope size={28} className="text-blue-600" />,
    href: "/doctors",
  },
  {
    id: 2,
    title: "کلینیک",
    desc: "مشاهده کلینیک‌ها، خدمات درمانی و رزرو نوبت",
    icon: <MapPin size={28} className="text-blue-600" />,
    href: "/clinics",
  },
  {
    id: 3,
    title: "آزمایشگاه",
    desc: "جستجوی آزمایشگاه‌ها و دریافت نوبت خدمات آزمایش",
    icon: <Search size={28} className="text-blue-600" />,
    href: "/labs",
  },
];

const HOME_ARTICLES = [
  {
    id: 1,
    title: "یبوست مزمن؛ چه زمانی نیاز به مراجعه به پزشک دارید؟",
    excerpt:
      "اگر یبوست بیشتر از چند روز ادامه پیدا کند، با درد، نفخ شدید یا خون‌ریزی همراه باشد، لازم است علت آن به‌صورت تخصصی بررسی شود.",
    category: "گوارش",
    date: "۱۴۰۵/۰۴/۰۶",
    image: "/images/articles/constipation.jpg",
    href: "/articles/constipation-warning-signs",
    icon: <Pill size={18} className="text-amber-600" />,
  },
  {
    id: 2,
    title: "ترک اعتیاد؛ چرا حمایت پزشکی و روانشناسی اهمیت حیاتی دارد؟",
    excerpt:
      "ترک خودسرانه بعضی مواد می‌تواند با علائم شدید جسمی و روانی همراه باشد. آشنایی با نقش پزشک، روانپزشک و مشاور در این مسیر ضروری است.",
    category: "سلامت روان و اعتیاد",
    date: "۱۴۰۵/۰۴/۱۱",
    image: "/images/articles/addiction-recovery.jpg",
    href: "/articles/addiction-recovery-guide",
    icon: <Sparkles size={18} className="text-violet-600" />,
  },
  {
    id: 3,
    title: "علائم هشداردهنده بیماری‌های قلبی که نباید نادیده گرفته شوند",
    excerpt:
      "درد قفسه سینه، تنگی نفس، تپش قلب، خستگی غیرعادی و تعریق سرد از نشانه‌هایی هستند که در بعضی موارد باید فوری بررسی شوند.",
    category: "قلب و عروق",
    date: "۱۴۰۵/۰۴/۱۸",
    image: "/images/articles/heart-warning.jpg",
    href: "/articles/heart-warning-signs",
    icon: <HeartPulse size={18} className="text-rose-600" />,
  },
  {
    id: 4,
    title: "قند خون بالا؛ نشانه‌ها، عوامل خطر و زمان مناسب برای آزمایش",
    excerpt:
      "تشنگی زیاد، تکرر ادرار، تاری دید و خستگی می‌توانند از علائم بالا بودن قند خون باشند. تشخیص زودهنگام از عوارض جدی پیشگیری می‌کند.",
    category: "دیابت",
    date: "۱۴۰۵/۰۴/۲۳",
    image: "/images/articles/diabetes-check.jpg",
    href: "/articles/diabetes-signs",
    icon: <Newspaper size={18} className="text-blue-600" />,
  },
  {
    id: 5,
    title: "چه زمانی برای درد معده، نفخ و سوزش سر دل باید متخصص گوارش را ببینیم؟",
    excerpt:
      "بعضی علائم گوارشی گذرا هستند، اما اگر تکرار شوند یا کیفیت زندگی را مختل کنند، مراجعه به پزشک بهترین تصمیم است.",
    category: "گوارش",
    date: "۱۴۰۵/۰۴/۲۷",
    image: "/images/articles/stomach-care.jpg",
    href: "/articles/gastro-visit-time",
    icon: <Pill size={18} className="text-emerald-600" />,
  },
  {
    id: 6,
    title: "فشار خون، قند و چربی خون؛ سه عددی که باید جدی بگیرید",
    excerpt:
      "کنترل دوره‌ای این شاخص‌ها به پیشگیری از سکته، بیماری قلبی، نارسایی کلیه و بسیاری از عوارض خاموش کمک می‌کند.",
    category: "پیشگیری و چکاپ",
    date: "۱۴۰۵/۰۵/۰۱",
    image: "/images/articles/checkup-metrics.jpg",
    href: "/articles/checkup-metrics",
    icon: <HeartPulse size={18} className="text-cyan-600" />,
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
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    const elements = document.querySelectorAll("[data-reveal-id]");
    elements.forEach((element) => observerRef.current?.observe(element));

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
    `transition-[opacity,transform] duration-700 ease-out ${
      revealedSections.has(key) ? "opacity-100" : "translate-y-4 opacity-0"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 md:pt-12">
        <section
          data-reveal-id="hero"
          className={`relative z-10 text-center ${revealClass("hero")}`}
        >
          <div className="mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-extrabold text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              سامانه هوشمند نوبت‌دهی پزشکی
            </div>

            <h1 className="text-4xl font-black leading-[1.45] tracking-[-0.03em] text-slate-900 md:text-5xl lg:text-[3.6rem]">
              رزرو آنلاین
              <span className="mx-2 inline-block text-blue-600">نوبت پزشک</span>
              <br className="hidden sm:block" />
              <span className="text-slate-800">و مراکز درمانی</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm font-semibold leading-8 text-slate-500 md:text-base">
              پزشک، تخصص، شهر یا مرکز درمانی موردنظر خود را جستجو کنید و بدون تماس
              تلفنی در چند دقیقه نوبت بگیرید.
            </p>
          </div>
        </section>

        <section
          data-reveal-id="search"
          className={`relative z-[60] mx-auto mt-10 max-w-6xl overflow-visible ${revealClass(
            "search"
          )}`}
        >
          <form
            onSubmit={handleSearchSubmit}
            className="relative z-[60] overflow-visible rounded-[34px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_26px_70px_rgba(15,23,42,0.10)] ring-1 ring-slate-100 backdrop-blur md:p-5 lg:p-6"
          >
            <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-700">
                <Sparkles size={14} />
                جستجوی سریع و هوشمند پزشک
              </div>

              <p className="text-xs font-bold text-slate-500">
                شهر، تخصص و نام پزشک را وارد کنید تا نتیجه دقیق‌تری ببینید
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.08fr_1.08fr_1.45fr_auto]">
              <div ref={locationRef} className="relative">
                <button
                  type="button"
                  aria-expanded={isLocationOpen}
                  onClick={() => {
                    setIsLocationOpen((prev) => !prev);
                    setIsSpecialtyOpen(false);
                  }}
                  className="group flex min-h-[78px] w-full items-center gap-3 rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition hover:border-slate-300 hover:bg-white"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <MapPin size={20} className="text-blue-600" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[11px] font-extrabold text-slate-400">
                      استان / شهر
                    </span>
                    <span className="mt-1 text-[15px] font-black text-slate-800">
                      {selectedCity
                        ? `${selectedProvince} - ${selectedCity}`
                        : selectedProvince || "انتخاب مکان"}
                    </span>
                  </div>

                  <ChevronDown
                    size={18}
                    className="mr-auto text-slate-400 transition group-hover:text-slate-600"
                  />
                </button>

                {isLocationOpen && (
                  <div className="absolute right-0 top-full z-[100] mt-3 w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_70px_rgba(15,23,42,0.16)] md:w-[720px]">
                    <div className="grid h-[360px] grid-cols-2">
                      <div className="overflow-y-auto border-l border-slate-100 p-4">
                        <h3 className="mb-3 text-xs font-extrabold text-slate-500">
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
                                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition ${
                                  active
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-slate-700 hover:bg-slate-50"
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
                        <h3 className="mb-3 text-xs font-extrabold text-slate-500">
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
                                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition ${
                                    active
                                      ? "bg-blue-600 text-white shadow-sm"
                                      : "text-slate-700 hover:bg-slate-50"
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

              <div ref={specialtyRef} className="relative">
                <button
                  type="button"
                  aria-expanded={isSpecialtyOpen}
                  onClick={() => {
                    setIsSpecialtyOpen((prev) => !prev);
                    setIsLocationOpen(false);
                  }}
                  className="group flex min-h-[78px] w-full items-center gap-3 rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition hover:border-slate-300 hover:bg-white"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Stethoscope size={20} className="text-blue-600" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[11px] font-extrabold text-slate-400">
                      تخصص
                    </span>
                    <span className="mt-1 text-[15px] font-black text-slate-800">
                      {selectedSpecialty
                        ? specialties.find((item) => item.value === selectedSpecialty)
                            ?.label ?? selectedSpecialty
                        : "لیست تخصص‌ها"}
                    </span>
                  </div>

                  <ChevronDown
                    size={18}
                    className="mr-auto text-slate-400 transition group-hover:text-slate-600"
                  />
                </button>

                {isSpecialtyOpen && (
                  <div className="absolute right-0 top-full z-[100] mt-3 max-h-[380px] w-full overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_28px_70px_rgba(15,23,42,0.16)] md:w-[420px]">
                    <h3 className="mb-3 text-xs font-extrabold text-slate-500">
                      لیست تخصص‌ها
                    </h3>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSpecialty(null);
                        setIsSpecialtyOpen(false);
                      }}
                      className="mb-2 flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                    >
                      <span>همه تخصص‌ها</span>
                      <span>✕</span>
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
                            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition ${
                              active
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-700 hover:bg-slate-50"
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

              <div className="relative">
                <Search
                  size={20}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="نام پزشک، مرکز درمانی یا بیماری..."
                  className="min-h-[78px] w-full rounded-[24px] border border-slate-200 bg-slate-50/80 py-3 pl-4 pr-12 text-[15px] font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                className="min-h-[78px] rounded-[24px] bg-gradient-to-r from-blue-600 to-cyan-500 px-8 text-[15px] font-black text-white shadow-[0_14px_28px_rgba(37,99,235,0.22)] transition hover:translate-y-[-1px] hover:shadow-[0_18px_36px_rgba(37,99,235,0.28)]"
              >
                جستجو
              </button>
            </div>

            {activeFilters.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                {activeFilters.map((filter) => (
                  <div
                    key={filter.key}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    <span>{filter.label}</span>
                    <button type="button" onClick={filter.onRemove}>
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
        </section>

        <section
          data-reveal-id="services"
          className={`relative z-0 mt-20 ${revealClass("services")}`}
        >
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-900">خدمات اصلی</h2>
            <p className="mt-3 text-sm font-bold text-slate-500">
              مسیر موردنظر خود را برای رزرو نوبت انتخاب کنید
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {HOME_SERVICES.map((service) => (
              <Link
                key={service.id}
                to={service.href}
                className="group rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                  {service.icon}
                </div>

                <h3 className="mt-6 text-xl font-black text-slate-900">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm font-bold leading-7 text-slate-500">
                  {service.desc}
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm font-black text-blue-600 opacity-0 transition group-hover:opacity-100">
                  مشاهده بیشتر
                  <ArrowLeft size={16} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section
          data-reveal-id="doctors"
          className={`mt-20 ${revealClass("doctors")}`}
        >
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-black text-slate-900">پزشکان برتر</h2>
              <p className="mt-2 text-sm font-bold text-slate-500">
                پزشکان با بیشترین رضایت و امتیاز کاربران
              </p>
            </div>

            <Link to="/doctors" className="text-sm font-black text-blue-600 hover:underline">
              مشاهده همه
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TOP_DOCTORS.slice(0, 4).map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoctorId(doc.id)}
                className={`cursor-pointer rounded-[28px] border bg-white p-4 transition ${
                  selectedDoctorId === doc.id
                    ? "border-blue-200 shadow-[0_12px_28px_rgba(37,99,235,0.10)]"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.05)]"
                }`}
              >
                <div className="relative overflow-hidden rounded-2xl bg-slate-100">
                  <SafeImage
                    src={doc.image}
                    alt={doc.name}
                    className="aspect-[4/4.2] w-full object-cover"
                  />
                  <div className="absolute left-3 top-3 rounded-xl bg-white px-2 py-1 text-xs font-black text-amber-500 shadow-sm">
                    ★ {doc.rating}
                  </div>
                </div>

                <h3 className="mt-4 text-lg font-black text-slate-900">{doc.name}</h3>
                <p className="mt-1 text-sm font-bold text-slate-500">{doc.specialty}</p>
                <p className="mt-3 text-xs font-black text-blue-600">
                  نزدیک‌ترین زمان: {doc.nextAvailable}
                </p>
              </div>
            ))}
          </div>
        </section>

        {selectedDoctor && (
          <section
            data-reveal-id="quick-booking"
            className={`mt-20 ${revealClass("quick-booking")}`}
          >
            <div className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-6 md:px-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-700">
                      <Sparkles size={14} />
                      رزرو سریع و هوشمند
                    </div>

                    <h2 className="mt-4 text-2xl font-black text-slate-900 md:text-[2rem]">
                      رزرو سریع برای {selectedDoctor.name}
                    </h2>

                    <p className="mt-2 text-sm font-bold text-slate-500">
                      زمان مناسب را انتخاب و نوبت خود را نهایی کنید
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
                    <div className="text-xs font-extrabold text-slate-400">پزشک انتخاب‌شده</div>
                    <div className="mt-1 text-base font-black text-slate-900">
                      {selectedDoctor.name}
                    </div>
                    <div className="mt-1 text-sm font-bold text-blue-600">
                      {selectedDoctor.specialty}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex flex-col items-center">
                  <BookingCalendar
                    doctorId={selectedDoctor.id}
                    doctorName={selectedDoctor.name}
                    specialty={selectedDoctor.specialty}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        <section
          data-reveal-id="articles"
          className={`mt-20 ${revealClass("articles")}`}
        >
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-extrabold text-slate-700">
                <Newspaper size={14} />
                محتوای کاربردی و آموزشی
              </div>
              <h2 className="mt-4 text-3xl font-black text-slate-900">مجله سلامت</h2>
              <p className="mt-2 text-sm font-bold text-slate-500">
                مطالب آموزشی، پیشگیرانه و راهنمای مراجعه برای موضوعات مهم سلامت
              </p>
            </div>

            <Link to="/articles" className="text-sm font-black text-blue-600 hover:underline">
              مشاهده همه مقالات
            </Link>
          </div>

                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {HOME_ARTICLES.map((article) => (
              <Link
                key={article.id}
                to={article.href}
                className="group overflow-hidden rounded-[30px] border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]"
              >
                <div className="relative bg-slate-100">
                  <SafeImage
                    src={article.image}
                    alt={article.title}
                    className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />

                  <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm backdrop-blur">
                    {article.icon}
                    <span>{article.category}</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-black leading-8 text-slate-900 transition group-hover:text-blue-700">
                    {article.title}
                  </h3>

                  <p className="mt-3 text-sm font-bold leading-7 text-slate-500">
                    {article.excerpt}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-bold text-slate-400">
                      {article.date}
                    </span>

                    <span className="inline-flex items-center gap-2 text-sm font-black text-blue-600">
                      مطالعه مقاله
                      <ArrowLeft size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
