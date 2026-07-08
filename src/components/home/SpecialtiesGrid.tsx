import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import {
  HeartPulse,
  Baby,
  Eye,
  Activity,
  Brain,
  Smile,
  Bone,
  Stethoscope,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Clock3,
} from "lucide-react";

interface Specialty {
  id: string;
  name: string;
  count: string;
  description: string;
  icon: ReactNode;
  color: string;
  bgColor: string;
  href: string;
}

const SPECIALTIES: Specialty[] = [
  {
    id: "cardiology",
    name: "قلب و عروق",
    count: "+۱۲۰ پزشک",
    description: "ویزیت، نوار قلب، فشار خون، پیگیری بیماری‌های قلبی",
    icon: <HeartPulse className="w-7 h-7" />,
    color: "text-rose-500",
    bgColor: "bg-rose-50",
    href: "/search?specialty=قلب و عروق",
  },
  {
    id: "pediatrics",
    name: "کودکان و اطفال",
    count: "+۹۵ پزشک",
    description: "ویزیت نوزاد، رشد کودک، تب، آلرژی و واکسیناسیون",
    icon: <Baby className="w-7 h-7" />,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    href: "/search?specialty=کودکان",
  },
  {
    id: "ophthalmology",
    name: "چشم‌پزشکی",
    count: "+۸۰ پزشک",
    description: "معاینه چشم، عینک، خشکی چشم، لیزیک و آب‌مروارید",
    icon: <Eye className="w-7 h-7" />,
    color: "text-teal-500",
    bgColor: "bg-teal-50",
    href: "/search?specialty=چشم پزشکی",
  },
  {
    id: "internal",
    name: "داخلی و عمومی",
    count: "+۱۵۰ پزشک",
    description: "چکاپ، سرماخوردگی، مشکلات گوارش، دیابت و فشار خون",
    icon: <Activity className="w-7 h-7" />,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    href: "/search?specialty=داخلی",
  },
  {
    id: "neurology",
    name: "مغز و اعصاب",
    count: "+۶۰ پزشک",
    description: "سردرد، میگرن، تشنج، بی‌حسی و اختلالات عصبی",
    icon: <Brain className="w-7 h-7" />,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    href: "/search?specialty=مغز و اعصاب",
  },
  {
    id: "psychiatry",
    name: "روان‌پزشکی",
    count: "+۷۰ پزشک",
    description: "اضطراب، افسردگی، بی‌خوابی، وسواس و درمان دارویی",
    icon: <Smile className="w-7 h-7" />,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
    href: "/search?specialty=روانپزشکی",
  },
  {
    id: "orthopedics",
    name: "ارتوپدی",
    count: "+۷۵ پزشک",
    description: "کمردرد، زانو، آسیب ورزشی، مفاصل و شکستگی‌ها",
    icon: <Bone className="w-7 h-7" />,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    href: "/search?specialty=ارتوپدی",
  },
  {
    id: "general",
    name: "پزشک عمومی",
    count: "+۲۰۰ پزشک",
    description: "ویزیت اولیه، بررسی علائم، ارجاع به متخصص مناسب",
    icon: <Stethoscope className="w-7 h-7" />,
    color: "text-cyan-500",
    bgColor: "bg-cyan-50",
    href: "/search?specialty=پزشک عمومی",
  },
];

const FEATURES = [
  {
    id: 1,
    title: "رزرو سریع و آنلاین",
    desc: "بدون تماس تلفنی، نوبت پزشک را در چند دقیقه ثبت کنید.",
    icon: <Clock3 className="w-5 h-5" />,
  },
  {
    id: 2,
    title: "پزشکان تأییدشده",
    desc: "نمایش اطلاعات تخصص، امتیاز و زمان‌های خالی هر پزشک.",
    icon: <ShieldCheck className="w-5 h-5" />,
  },
  {
    id: 3,
    title: "پیشنهاد تخصص مناسب",
    desc: "اگر تخصص دقیق را نمی‌دانید، از دسته‌بندی‌ها شروع کنید.",
    icon: <Sparkles className="w-5 h-5" />,
  },
];

export default function SpecialtiesGrid() {
  return (
    <section
      dir="rtl"
      className="relative overflow-hidden rounded-[32px] border border-slate-100 bg-gradient-to-b from-white to-slate-50/70 px-4 py-14 sm:px-6 lg:px-8"
    >
      {/* decorative background */}
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-cyan-100/40 blur-3xl" />

      <div className="relative z-10">
        {/* header */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl text-right">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
              <Sparkles className="h-4 w-4" />
              دسته‌بندی تخصص‌های پزشکی
            </span>

            <h2 className="text-2xl font-black leading-tight text-slate-900 md:text-4xl">
              پزشک مناسب را از بین
              <span className="mx-2 text-blue-600">تخصص‌های پرمراجعه</span>
              سریع‌تر پیدا کنید
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-600 md:text-base">
              اگر نام پزشک را نمی‌دانید، از تخصص شروع کنید. داک‌تایم پزشکان را بر اساس
              دسته‌بندی‌های پرمراجعه، شهر، زمان خالی و نیاز درمانی شما مرتب می‌کند تا
              مسیر نوبت‌گیری کوتاه‌تر و دقیق‌تر شود.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/search"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
            >
              شروع نوبت‌گیری
            </Link>

            <Link
              to="/specialties"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:border-blue-200 hover:text-blue-700"
            >
              مشاهده همه تخصص‌ها
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* top summary strip */}
        <div className="mb-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.id}
              className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm backdrop-blur"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                {feature.icon}
              </div>
              <h3 className="mb-1 text-sm font-black text-slate-800">
                {feature.title}
              </h3>
              <p className="text-sm leading-7 text-slate-500">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* content */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          {/* specialties grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {SPECIALTIES.map((spec) => (
              <Link
                key={spec.id}
                to={spec.href}
                className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-100 hover:shadow-xl hover:shadow-slate-200/60"
              >
                <div className="absolute left-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-slate-100/60 blur-2xl transition-all duration-300 group-hover:scale-125" />

                <div
                  className={`relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${spec.bgColor} ${spec.color} transition-transform duration-300 group-hover:scale-110`}
                >
                  {spec.icon}
                </div>

                <div className="relative text-right">
                  <h3 className="mb-2 text-base font-black text-slate-800 transition-colors group-hover:text-blue-700">
                    {spec.name}
                  </h3>

                  <p className="mb-4 min-h-[56px] text-sm leading-7 text-slate-500">
                    {spec.description}
                  </p>

                  <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                      {spec.count}
                    </span>

                    <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 transition-all group-hover:gap-2">
                      مشاهده پزشکان
                      <ArrowLeft className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* side card */}
          <aside className="rounded-[28px] border border-slate-100 bg-slate-900 p-6 text-white shadow-2xl shadow-slate-200">
            <div className="mb-6 flex items-center justify-between">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-blue-100">
                انتخاب هوشمند تخصص
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <Stethoscope className="h-5 w-5 text-cyan-300" />
              </div>
            </div>

            <h3 className="text-xl font-black leading-9">
              نمی‌دانید باید به چه پزشکی مراجعه کنید؟
            </h3>

            <p className="mt-4 text-sm leading-8 text-slate-300">
              از بین تخصص‌های پرکاربرد شروع کنید، شهر موردنظر را انتخاب کنید و لیست
              پزشکان دارای نوبت فعال را ببینید. این بخش برای کوتاه‌کردن مسیر تصمیم‌گیری
              بیمار طراحی شده است.
            </p>

            <div className="mt-8 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-1 text-sm font-black">پیشنهاد برای علائم عمومی</div>
                <div className="text-sm text-slate-300">
                  داخلی، پزشک عمومی، گوارش، غدد
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-1 text-sm font-black">پیشنهاد برای درد و آسیب</div>
                <div className="text-sm text-slate-300">
                  ارتوپدی، مغز و اعصاب، طب فیزیکی
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-1 text-sm font-black">پیشنهاد برای کودکان</div>
                <div className="text-sm text-slate-300">
                  اطفال، گوش و حلق و بینی، آلرژی
                </div>
              </div>
            </div>

            <Link
              to="/search"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700"
            >
              جستجوی پزشک و نوبت
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}