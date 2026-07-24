import { useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";

import { PROVINCES_CITIES, type Province } from "../../data/provinces";
import { specialties } from "../../data/specialties";
import { getDoctors } from "../../services/doctors";

type SearchFormState = {
  province: string;
  city: string;
  specialty: string;
  query: string;
};

const stats = [
  { value: "۲۰۰+", label: "پزشک فعال" },
  { value: "۵۰,۰۰۰+", label: "نوبت ثبت‌شده" },
  { value: "۹۸٪", label: "رضایت کاربران" },
];

const trustBadges = [
  "رزرو آنلاین ۲۴ ساعته",
  "مشاهده زمان‌های خالی پزشکان",
  "دسترسی سریع به پزشکان متخصص",
];

export default function HeroSection() {
  const navigate = useNavigate();

  const [form, setForm] = useState<SearchFormState>({
    province: "سیستان و بلوچستان",
    city: "",
    specialty: "",
    query: "",
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
    staleTime: 1000 * 60 * 5,
  });

  const activeProvince = useMemo(
    () =>
      PROVINCES_CITIES.find(
        (province: Province) => province.name === form.province
      ),
    [form.province]
  );

  const cities = activeProvince?.cities ?? [];
  const featuredDoctor = doctors[0];

  const updateField = <K extends keyof SearchFormState>(
    key: K,
    value: SearchFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleProvinceChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      province: value,
      city: "",
    }));
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (form.province) {
      params.set("province", form.province);
    }

    if (form.city) {
      params.set("city", form.city);
    }

    if (form.specialty) {
      params.set("specialty", form.specialty);
    }

    if (form.query.trim()) {
      params.set("search", form.query.trim());
    }

    const query = params.toString();
    navigate(query ? `/search?${query}` : "/search");
  };

  return (
    <section
      dir="rtl"
      className="relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.10),transparent_25%),linear-gradient(180deg,#f8fbff_0%,#ffffff_60%)] pb-14 pt-10 md:pb-20 md:pt-14"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 right-0 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute left-1/3 top-1/3 h-24 w-24 rounded-full bg-sky-100 blur-2xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-[1.2fr_0.8fr] xl:gap-12">
          <div className="text-right">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/90 px-4 py-2 shadow-sm backdrop-blur">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <CalendarClock size={18} />
              </span>
              <div className="text-sm font-extrabold text-slate-700">
                رزرو آنلاین پزشک در کمتر از چند دقیقه
              </div>
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[1.2] text-slate-900 md:text-5xl xl:text-6xl">
              نوبت‌دهی آنلاین پزشکان
              <span className="mx-2 inline-block text-blue-600">
                با داک‌تایم
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
              پزشک مناسب را بر اساس تخصص، شهر، نام پزشک یا نوع خدمات پیدا کنید،
              زمان‌های خالی را ببینید و بدون تماس تلفنی نوبت خود را آنلاین رزرو
              کنید. داک‌تایم برای یک تجربه سریع، مطمئن و شفاف در نوبت‌گیری پزشکی
              طراحی شده است.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-start">
              <button
                onClick={() =>
                  document.getElementById("hero-search")?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  })
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                شروع نوبت‌گیری
                <ArrowLeft size={18} />
              </button>

              <Link
                to="/doctors"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
              >
                مشاهده پزشکان
              </Link>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {trustBadges.map((item) => (
                <div
                  key={item}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-3 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-100 backdrop-blur"
                >
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-slate-100 bg-white/95 p-5 shadow-sm"
                >
                  <div className="text-2xl font-black text-slate-900 md:text-3xl">
                    {item.value}
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-500">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:pt-8">
            <div className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.10)] md:p-6">
              <div className="absolute left-0 top-0 h-28 w-28 rounded-full bg-blue-100/50 blur-2xl" />
              <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-emerald-100/50 blur-2xl" />

              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-700">
                  <ShieldCheck size={16} />
                  نزدیک‌ترین نوبت پیشنهادی
                </div>

                {!featuredDoctor ? (
                  <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
                    <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                  </div>
                ) : (
                  <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-xl font-black text-blue-700 shadow-sm">
                        {featuredDoctor.name.replace("دکتر ", "").charAt(0)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-black text-slate-900">
                          {featuredDoctor.name}
                        </h3>

                        <p className="mt-1 text-sm font-bold text-slate-600">
                          {featuredDoctor.specialty_name}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-100">
                            <MapPin size={14} className="text-slate-400" />
                            {featuredDoctor.city ? (
                              featuredDoctor.city
                            ) : (
                              <span className="text-red-600">
                                خطای اطلاعات شهر
                              </span>
                            )}
                          </span>

                          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-100">
                            <Star
                              size={14}
                              className="fill-yellow-400 text-yellow-400"
                            />
                            {featuredDoctor.rating !== null ? (
                              featuredDoctor.rating.toLocaleString("fa-IR")
                            ) : (
                              <span className="text-slate-400">
                                بدون امتیاز
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                        <div className="text-xs font-extrabold text-slate-400">
                          اولین زمان خالی
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm font-black text-emerald-600">
                          <Clock3 size={16} />
                          {featuredDoctor.next_available ??
                            "زمان آزادی ثبت نشده است"}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                        <div className="text-xs font-extrabold text-slate-400">
                          امتیاز بیماران
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm font-black text-slate-800">
                          <Star
                            size={16}
                            className="fill-yellow-400 text-yellow-400"
                          />
                          {featuredDoctor.rating !== null
                            ? featuredDoctor.rating.toLocaleString("fa-IR")
                            : "بدون امتیاز"}
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      با فیلتر تخصص، شهر و نام پزشک، سریع‌تر پزشک مناسب خود را
                      پیدا کنید و نوبت آنلاین بگیرید.
                    </p>
                  </div>
                )}

                <div className="mt-4 rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                      <Users size={20} />
                    </div>

                    <div>
                      <div className="text-xs font-extrabold text-emerald-700">
                        اعتماد کاربران
                      </div>
                      <div className="mt-1 text-sm font-bold text-emerald-900">
                        تجربه سریع، مطمئن و شفاف در نوبت‌گیری پزشکی
                      </div>
                    </div>
                  </div>
                </div>

                <form
                  id="hero-search"
                  onSubmit={handleSearch}
                  className="mt-5 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <label className="block">
                      <span className="mb-2 flex items-center gap-2 text-xs font-extrabold text-slate-500">
                        <MapPin size={14} />
                        استان
                      </span>

                      <div className="relative">
                        <select
                          value={form.province}
                          onChange={(e) => handleProvinceChange(e.target.value)}
                          className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
                        >
                          {PROVINCES_CITIES.map((province) => (
                            <option key={province.name} value={province.name}>
                              {province.name}
                            </option>
                          ))}
                        </select>

                        <ChevronDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 flex items-center gap-2 text-xs font-extrabold text-slate-500">
                        <MapPin size={14} />
                        شهر
                      </span>

                      <div className="relative">
                        <select
                          value={form.city}
                          onChange={(e) => updateField("city", e.target.value)}
                          className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
                        >
                          <option value="">همه شهرها</option>
                          {cities.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>

                        <ChevronDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 flex items-center gap-2 text-xs font-extrabold text-slate-500">
                        <Stethoscope size={14} />
                        تخصص
                      </span>

                      <div className="relative">
                        <select
                          value={form.specialty}
                          onChange={(e) =>
                            updateField("specialty", e.target.value)
                          }
                          className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
                        >
                          <option value="">همه تخصص‌ها</option>
                          {specialties.map((specialty) => (
                            <option
                              key={specialty.value}
                              value={specialty.value}
                            >
                              {specialty.label}
                            </option>
                          ))}
                        </select>

                        <ChevronDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 flex items-center gap-2 text-xs font-extrabold text-slate-500">
                        <Search size={14} />
                        جستجو
                      </span>

                      <input
                        type="text"
                        value={form.query}
                        onChange={(e) => updateField("query", e.target.value)}
                        placeholder="نام پزشک یا خدمت"
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-bold text-slate-500">
                      جستجو بر اساس شهر، تخصص و نام پزشک انجام می‌شود.
                    </p>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
                    >
                      جستجوی پزشک
                      <Search size={16} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
