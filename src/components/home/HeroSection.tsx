import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Stethoscope,
  ShieldCheck,
  CalendarClock,
  Users,
  ArrowLeft,
  CheckCircle2,
  Star,
  Clock3,
  ChevronDown,
} from "lucide-react";
import { PROVINCES_CITIES, type Province } from "../../data/provinces";
import { specialties } from "../../data/specialties";
import { doctors } from "../../data/mockData";

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (form.province) params.set("province", form.province);
    if (form.city) params.set("city", form.city);
    if (form.specialty) params.set("specialty", form.specialty);
    if (form.query.trim()) params.set("q", form.query.trim());

    navigate(`/search?${params.toString()}`);
  };

  return (
    <section
      dir="rtl"
      className="relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.10),transparent_25%),linear-gradient(180deg,#f8fbff_0%,#ffffff_60%)] pt-10 md:pt-14 pb-14 md:pb-20"
    >
      {/* decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 right-0 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute top-1/3 left-1/3 h-24 w-24 rounded-full bg-sky-100 blur-2xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-[1.2fr_0.8fr] xl:gap-12">
          {/* RIGHT CONTENT */}
          <div className="text-right">
            {/* top badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/90 px-4 py-2 shadow-sm backdrop-blur">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <CalendarClock size={18} />
              </span>
              <div className="text-sm font-extrabold text-slate-700">
                رزرو آنلاین پزشک در کمتر از چند دقیقه
              </div>
            </div>

            {/* heading */}
            <h1 className="max-w-3xl text-4xl leading-[1.2] text-slate-900 md:text-5xl xl:text-6xl font-black">
              نوبت‌دهی آنلاین پزشکان
              <span className="mx-2 inline-block text-blue-600">با داک‌تایم</span>
            </h1>

            {/* description */}
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
              پزشک مناسب را بر اساس تخصص، شهر، نام پزشک یا نوع خدمات پیدا کنید،
              زمان‌های خالی را ببینید و بدون تماس تلفنی نوبت خود را آنلاین رزرو
              کنید. داک‌تایم برای یک تجربه سریع، مطمئن و شفاف در نوبت‌گیری پزشکی
              طراحی شده است.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-start">
              <button
                onClick={() => document.getElementById("hero-search")?.scrollIntoView({ behavior: "smooth", block: "center" })}
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

            {/* trust badges */}
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

            {/* stats */}
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

          {/* LEFT / FEATURE CARD */}
          <div className="lg:pt-8">
            <div className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.10)] md:p-6">
              <div className="absolute left-0 top-0 h-28 w-28 rounded-full bg-blue-100/50 blur-2xl" />
              <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-emerald-100/50 blur-2xl" />

              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-700">
                  <ShieldCheck size={16} />
                  نزدیک‌ترین نوبت پیشنهادی
                </div>

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
                        {featuredDoctor.specialty}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-100">
                          <MapPin size={14} className="text-slate-400" />
                          {featuredDoctor.city}
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-100">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          {featuredDoctor.rating}
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
                        {featuredDoctor.nextAvailable}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                      <div className="text-xs font-extrabold text-slate-400">
                        امتیاز بیماران
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm font-black text-slate-800">
                        <Star size={16} className="fill-yellow-400 text-yellow-400" />
                        {featuredDoctor.rating}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    با فیلتر تخصص، شهر و نام پزشک، سریع‌تر پزشک مناسب خود را پیدا
                    کنید و نوبت آنلاین بگیرید.
                  </p>
                </div>

                <div className="mt-4 rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                      <Users size={20} />
                    </div>

                    <div>
                      <div className="text-xs font-extrabold text-emerald-700">
                        اعتماد کاربران
                      </div>
                      <div className="mt-1 text-sm font-black text-slate-800">
                        ۵۰ هزار+ نوبت موفق
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH PANEL */}
        <div
          id="hero-search"
          className="mt-10 rounded-[32px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur md:mt-12 md:p-6"
        >
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div className="text-right">
              <div className="text-sm font-black text-blue-600">
                جستجوی پزشک و نوبت
              </div>
              <h2 className="mt-1 text-2xl font-black text-slate-900">
                پزشک مناسب را سریع‌تر پیدا کنید
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                استان و شهر، تخصص و نام پزشک را مشخص کنید تا نزدیک‌ترین نوبت‌های
                قابل رزرو را ببینید.
              </p>
            </div>

            <div className="hidden rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500 lg:block">
              ۵۰ هزار+ نوبت موفق
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_1.05fr_1.15fr_2fr_auto]"
          >
            {/* province */}
            <Field label="استان">
              <div className="relative flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-blue-500 focus-within:bg-white">
                <MapPin size={18} className="shrink-0 text-blue-600" />
                <select
                  value={form.province}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="h-14 w-full appearance-none bg-transparent px-2 text-sm font-bold text-slate-700 outline-none"
                >
                  {PROVINCES_CITIES.map((province: Province) => (
                    <option key={province.name} value={province.name}>
                      {province.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="pointer-events-none absolute left-3 text-slate-400" />
              </div>
            </Field>

            {/* city */}
            <Field label="شهر">
              <div className="relative flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-blue-500 focus-within:bg-white">
                <MapPin size={18} className="shrink-0 text-blue-600" />
                <select
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className="h-14 w-full appearance-none bg-transparent px-2 text-sm font-bold text-slate-700 outline-none"
                >
                  <option value="">انتخاب شهر</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="pointer-events-none absolute left-3 text-slate-400" />
              </div>
            </Field>

            {/* specialty */}
            <Field label="تخصص پزشکی">
              <div className="relative flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-blue-500 focus-within:bg-white">
                <Stethoscope size={18} className="shrink-0 text-blue-600" />
                <select
                  value={form.specialty}
                  onChange={(e) => updateField("specialty", e.target.value)}
                  className="h-14 w-full appearance-none bg-transparent px-2 text-sm font-bold text-slate-700 outline-none"
                >
                  <option value="">همه تخصص‌ها</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="pointer-events-none absolute left-3 text-slate-400" />
              </div>
            </Field>

            {/* query */}
            <Field label="جستجوی پزشک یا خدمت">
              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-blue-500 focus-within:bg-white">
                <Search size={18} className="shrink-0 text-blue-600" />
                <input
                  type="text"
                  value={form.query}
                  onChange={(e) => updateField("query", e.target.value)}
                  placeholder="نام پزشک، تخصص، مرکز درمانی یا خدمت موردنظر را جستجو کنید..."
                  className="h-14 w-full bg-transparent px-3 text-sm font-bold text-slate-700 placeholder:text-slate-400 outline-none"
                />
              </div>
            </Field>

            {/* submit */}
            <div className="flex items-end">
              <button
                type="submit"
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 xl:w-auto"
              >
                <Search size={18} />
                جستجو و مشاهده نوبت‌ها
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 pr-1 text-right text-xs font-extrabold text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}