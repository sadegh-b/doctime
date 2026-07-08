import {
  Search,
  CalendarDays,
  ShieldCheck,
  Stethoscope,
  Star,
  Clock3,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    id: 1,
    icon: <Search className="w-6 h-6" />,
    title: "جستجوی سریع پزشک",
    description:
      "با انتخاب تخصص، شهر، نام پزشک یا نوع خدمت، در چند ثانیه به پزشکان مرتبط و نوبت‌های فعال دسترسی پیدا کنید.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    id: 2,
    icon: <CalendarDays className="w-6 h-6" />,
    title: "مشاهده زمان‌های خالی",
    description:
      "قبل از رزرو، زمان‌های آزاد پزشکان را به‌صورت شفاف ببینید و مناسب‌ترین ساعت را بدون تماس تلفنی انتخاب کنید.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    id: 3,
    icon: <Stethoscope className="w-6 h-6" />,
    title: "پروفایل کامل پزشکان",
    description:
      "اطلاعات تخصص، امتیاز بیماران، سوابق، شهر، خدمات و نوبت‌های فعال هر پزشک را قبل از ثبت نهایی بررسی کنید.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    id: 4,
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "رزرو مطمئن و ساده",
    description:
      "فرآیند نوبت‌گیری در داک‌تایم ساده، سریع و شفاف طراحی شده تا بدون سردرگمی نوبت خود را ثبت کنید.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
];

const trustItems = [
  "جستجو بر اساس تخصص، شهر و نام پزشک",
  "نمایش زمان‌های خالی قبل از ثبت نوبت",
  "نمایش امتیاز و اطلاعات کلیدی پزشک",
  "رابط کاربری ساده برای رزرو سریع‌تر",
];

export default function WhyDocTimeSection() {
  return (
    <section
      dir="rtl"
      className="relative overflow-hidden py-20 md:py-24"
    >
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute left-0 bottom-0 h-80 w-80 rounded-full bg-emerald-100/40 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* header */}
        <div className="max-w-3xl text-right mb-12 md:mb-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black text-blue-700">
            <ShieldCheck className="w-4 h-4" />
            چرا داک‌تایم
          </span>

          <h2 className="mt-5 text-3xl md:text-5xl font-black text-slate-900 leading-[1.4]">
            همه‌چیز برای یک{" "}
            <span className="text-blue-600">نوبت‌گیری سریع، شفاف و مطمئن</span>
          </h2>

          <p className="mt-5 text-slate-600 text-base md:text-lg leading-8 max-w-2xl">
            از جستجوی پزشک تا مشاهده زمان‌های خالی، بررسی اطلاعات پزشک و رزرو آنلاین
            نوبت، تمام مراحل در داک‌تایم به‌صورت یکپارچه طراحی شده تا کاربر بدون
            تماس تلفنی و بدون سردرگمی، سریع‌تر به نوبت مناسب برسد.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
          {/* right / feature cards */}
          <div className="xl:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className={`group relative overflow-hidden rounded-3xl border ${feature.border} bg-white p-6 md:p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-blue-500 via-cyan-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div
                    className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bg} ${feature.color} shadow-sm`}
                  >
                    {feature.icon}
                  </div>

                  <h3 className="text-lg md:text-xl font-extrabold text-slate-900 mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-sm md:text-base text-slate-600 leading-8">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* left / showcase panel */}
          <div className="xl:col-span-4">
            <div className="relative h-full rounded-[32px] border border-slate-200 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 p-6 md:p-7 text-white shadow-[0_20px_80px_rgba(15,23,42,0.18)] overflow-hidden">
              <div className="absolute -top-16 -left-10 w-40 h-40 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full bg-emerald-500/20 blur-3xl" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-100 border border-white/10">
                  <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                  تجربه بهتر برای رزرو آنلاین
                </div>

                <h3 className="mt-5 text-2xl md:text-3xl font-black leading-[1.5]">
                  چرا کاربران برای نوبت‌گیری،
                  <span className="text-cyan-300"> داک‌تایم </span>
                  را انتخاب می‌کنند؟
                </h3>

                <p className="mt-4 text-sm md:text-base text-slate-300 leading-8">
                  چون مسیر جستجو تا رزرو نوبت کوتاه‌تر، واضح‌تر و قابل‌اعتمادتر
                  شده است؛ کاربر سریع می‌فهمد چه پزشکی مناسب اوست و چه زمانی
                  می‌تواند نوبت بگیرد.
                </p>

                {/* quick trust list */}
                <div className="mt-7 space-y-3">
                  {trustItems.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-300 mt-0.5 shrink-0" />
                      <span className="text-sm text-slate-200 leading-7">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                {/* mini stat / preview card */}
                <div className="mt-7 rounded-3xl bg-white text-slate-900 p-5 shadow-xl">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <p className="text-xs text-slate-500 font-bold">
                        نزدیک‌ترین نوبت پیشنهادی
                      </p>
                      <h4 className="mt-1 text-base font-black">
                        دکتر سارا نوری
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">
                        متخصص بیماری‌های داخلی
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Clock3 className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">اولین زمان خالی</span>
                      <span className="font-extrabold text-emerald-600">
                        فردا ۱۰:۳۰
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">امتیاز بیماران</span>
                      <span className="font-extrabold text-amber-500">
                        ★ 4.8
                      </span>
                    </div>
                  </div>

                  <button className="mt-5 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white py-3 font-bold transition-colors flex items-center justify-center gap-2">
                    مشاهده نوبت‌ها
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* bottom stats */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "۲۴/۷", label: "رزرو آنلاین شبانه‌روزی" },
            { value: "۲۰۰+", label: "پزشک فعال" },
            { value: "۵۰,۰۰۰+", label: "نوبت ثبت‌شده" },
            { value: "۹۸٪", label: "رضایت کاربران" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-100 bg-white px-5 py-5 text-center shadow-sm"
            >
              <div className="text-2xl md:text-3xl font-black text-slate-900">
                {item.value}
              </div>
              <div className="mt-2 text-sm text-slate-500 font-medium">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}