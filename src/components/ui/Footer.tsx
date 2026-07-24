import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  ArrowLeftCircle,
  PlusCircle,
  ShieldCheck,
  Info,
  HelpCircle,
  FileText,
  Lock,
  BookOpen,
  Activity,
  HeartPulse,
  Pill,
} from "lucide-react";

const quickLinks = [
  { label: "صفحه اصلی", href: "/", icon: <ArrowLeftCircle size={14} /> },
  { label: "پزشکان", href: "/doctors", icon: <ArrowLeftCircle size={14} /> },
  { label: "جستجوی پزشک", href: "/search", icon: <ArrowLeftCircle size={14} /> },
  { label: "مجله سلامت", href: "/health-magazine", icon: <BookOpen size={14} /> },
];

const companyLinks = [
  { label: "درباره ما", href: "/about", icon: <Info size={14} /> },
  { label: "تماس با ما", href: "/contact", icon: <Phone size={14} /> },
  { label: "سوالات متداول", href: "/faq", icon: <HelpCircle size={14} /> },
  { label: "قوانین و مقررات", href: "/terms", icon: <FileText size={14} /> },
  { label: "حریم خصوصی", href: "/privacy", icon: <Lock size={14} /> },
];

const magazineLinks = [
  {
    label: "ترک اعتیاد",
    href: "/health-magazine/addiction-recovery",
    icon: <Activity size={14} />,
  },
  {
    label: "یبوست",
    href: "/health-magazine/constipation",
    icon: <HeartPulse size={14} />,
  },
  {
    label: "دیابت",
    href: "/health-magazine/diabetes",
    icon: <Pill size={14} />,
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-sky-200 bg-[linear-gradient(180deg,#f8fbff_0%,#edf5ff_45%,#dfeeff_100%)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff_0%,#f6faff_28%,#eaf3ff_55%,#dcecff_100%)]" />
        <div className="absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(245,250,255,0.78)_45%,rgba(235,244,255,0)_100%)]" />

        <svg
          className="absolute inset-x-0 bottom-0 h-[240px] w-full opacity-60"
          viewBox="0 0 1440 260"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 165C90 150 150 120 245 130C340 140 410 205 520 205C640 205 680 140 790 140C900 140 950 205 1080 205C1200 205 1300 145 1440 165" stroke="rgba(255,255,255,0.95)" strokeWidth="1.5" />
          <path d="M0 188C110 170 180 138 290 152C390 165 470 225 585 225C690 225 750 160 860 160C980 160 1040 228 1165 228C1285 228 1365 170 1440 182" stroke="rgba(255,255,255,0.75)" strokeWidth="1.2" />
          <path d="M0 214C100 195 200 170 310 182C430 195 520 245 640 245C760 245 820 185 935 185C1060 185 1135 242 1260 242C1350 242 1405 210 1440 200" stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
          <path d="M0 235C120 220 210 205 340 215C470 225 560 255 690 255C830 255 900 210 1020 210C1140 210 1240 252 1360 252C1400 252 1425 248 1440 245" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
        </svg>

        <div className="absolute bottom-[120px] left-[14%] h-2 w-2 rounded-full bg-white/70 blur-[1px]" />
        <div className="absolute bottom-[105px] left-[34%] h-2.5 w-2.5 rounded-full bg-white/70 blur-[1px]" />
        <div className="absolute -left-16 bottom-10 h-64 w-64 rounded-full bg-sky-300/15 blur-3xl" />
        <div className="absolute -right-16 bottom-8 h-72 w-72 rounded-full bg-blue-300/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.8fr_0.8fr_0.9fr_1fr]">
          <div className="rounded-[32px] border border-white/60 bg-white/40 p-7 shadow-[0_14px_45px_rgba(37,99,235,0.08)] backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg">
                <PlusCircle size={24} />
              </div>
              <div>
                <h3 className="bg-gradient-to-r from-blue-700 to-sky-700 bg-clip-text text-2xl font-black text-transparent">
                  DocTime
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Online Healthcare Platform
                </p>
              </div>
            </div>
            <p className="mt-5 text-justify text-sm font-semibold leading-7 text-slate-600">
              داک‌تایم با هدف هوشمندسازی نوبت‌دهی پزشکی، تجربه‌ای مدرن و سریع را
              برای بیماران فراهم می‌کند تا بدون دغدغه، بهترین پزشک را انتخاب
              کنند.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/search"
                className="rounded-full bg-blue-600 px-6 py-2.5 text-xs font-black text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-700"
              >
                جستجوی پزشک
              </Link>
              <Link
                to="/register"
                className="rounded-full border border-blue-100 bg-white/80 px-6 py-2.5 text-xs font-black text-slate-700 transition-all hover:border-blue-300"
              >
                عضویت پزشکان
              </Link>
            </div>
          </div>

          <div className="p-2">
            <h4 className="mb-6 text-lg font-black text-slate-900">دسترسی سریع</h4>
            <ul className="space-y-4">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="group flex items-center gap-3 text-sm font-bold text-slate-500 transition-colors hover:text-blue-600"
                  >
                    <span className="text-slate-300 transition-colors group-hover:text-blue-500">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-2">
            <h4 className="mb-6 text-lg font-black text-slate-900">داک‌تایم</h4>
            <ul className="space-y-4">
              {companyLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="group flex items-center gap-3 text-sm font-bold text-slate-500 transition-colors hover:text-blue-600"
                  >
                    <span className="text-slate-300 transition-colors group-hover:text-blue-500">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-2">
            <h4 className="mb-6 text-lg font-black text-slate-900">مجله سلامت</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/health-magazine"
                  className="group flex items-center gap-3 text-sm font-bold text-slate-500 transition-colors hover:text-blue-600"
                >
                  <span className="text-slate-300 transition-colors group-hover:text-blue-500">
                    <BookOpen size={14} />
                  </span>
                  همه مقالات
                </Link>
              </li>
              {magazineLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="group flex items-center gap-3 text-sm font-bold text-slate-500 transition-colors hover:text-blue-600"
                  >
                    <span className="text-slate-300 transition-colors group-hover:text-blue-500">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[32px] border border-blue-100/50 bg-white/50 p-6 shadow-sm backdrop-blur-sm">
            <h4 className="mb-6 text-lg font-black text-slate-900">اطلاعات تماس</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">
                    شماره تماس
                  </p>
                  <p className="text-sm font-black text-slate-800" dir="ltr">
                    ۰۲۱-۱۲۳۴۵۶۷۸
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">
                    ایمیل پشتیبانی
                  </p>
                  <p className="text-sm font-black text-slate-800">
                    info@doctime.ir
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">
                    دفتر مرکزی
                  </p>
                  <p className="text-sm font-black leading-6 text-slate-800">
                    چابهار، بلوار آزادی، پلاک ۱۲
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-3xl bg-slate-900/90 p-6 text-white shadow-xl backdrop-blur-xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-center md:text-right">
              <p className="text-sm font-bold opacity-80">
                © {new Date().getFullYear()} تمامی حقوق این سامانه متعلق به
                داک‌تایم است.
              </p>
              <p className="mt-1 text-sm font-black">
                توسعه یافته با ❤️ توسط{" "}
                <span className="text-blue-400">محمدصادق بلوچ</span>
              </p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-black">
                <ShieldCheck size={12} className="text-blue-400" />
                تایید شده
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-black">
                پرداخت امن
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
