import { Link } from "react-router-dom";

const quickLinks = [
  { label: "صفحه اصلی", href: "/" },
  { label: "پزشکان", href: "/doctors" },
  { label: "جستجوی پزشک", href: "/search" },
  { label: "مجله سلامت", href: "/articles" },
];

const companyLinks = [
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
  { label: "سوالات متداول", href: "/faq" },
  { label: "قوانین و مقررات", href: "/terms" },
  { label: "حریم خصوصی", href: "/privacy" },
];

export default function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-sky-200 bg-[linear-gradient(180deg,#f8fbff_0%,#edf5ff_45%,#dfeeff_100%)]">
      {/* subtle footer background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* light blue glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff_0%,#f6faff_28%,#eaf3ff_55%,#dcecff_100%)]" />

        {/* top soft haze */}
        <div className="absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(245,250,255,0.78)_45%,rgba(235,244,255,0)_100%)]" />

        {/* wave lines */}
        <svg
          className="absolute inset-x-0 bottom-0 h-[240px] w-full opacity-60"
          viewBox="0 0 1440 260"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 165C90 150 150 120 245 130C340 140 410 205 520 205C640 205 680 140 790 140C900 140 950 205 1080 205C1200 205 1300 145 1440 165"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth="1.5"
          />
          <path
            d="M0 188C110 170 180 138 290 152C390 165 470 225 585 225C690 225 750 160 860 160C980 160 1040 228 1165 228C1285 228 1365 170 1440 182"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="1.2"
          />
          <path
            d="M0 214C100 195 200 170 310 182C430 195 520 245 640 245C760 245 820 185 935 185C1060 185 1135 242 1260 242C1350 242 1405 210 1440 200"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1"
          />
          <path
            d="M0 235C120 220 210 205 340 215C470 225 560 255 690 255C830 255 900 210 1020 210C1140 210 1240 252 1360 252C1400 252 1425 248 1440 245"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
          />
        </svg>

        {/* tiny soft dots */}
        <div className="absolute bottom-[120px] left-[14%] h-2 w-2 rounded-full bg-white/70 blur-[1px]" />
        <div className="absolute bottom-[105px] left-[34%] h-2.5 w-2.5 rounded-full bg-white/70 blur-[1px]" />
        <div className="absolute bottom-[138px] left-[57%] h-2 w-2 rounded-full bg-white/75 blur-[1px]" />
        <div className="absolute bottom-[118px] left-[76%] h-2.5 w-2.5 rounded-full bg-white/65 blur-[1px]" />

        {/* side soft blue glows */}
        <div className="absolute -left-16 bottom-10 h-64 w-64 rounded-full bg-sky-300/15 blur-3xl" />
        <div className="absolute -right-16 bottom-8 h-72 w-72 rounded-full bg-blue-300/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr_0.9fr_1fr]">
          {/* brand */}
          <div className="rounded-[28px] border border-sky-100 bg-white p-6 shadow-[0_14px_45px_rgba(37,99,235,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-500 text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)]">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </div>

              <div>
                <h3 className="bg-gradient-to-r from-blue-700 via-sky-700 to-cyan-700 bg-clip-text text-2xl font-black text-transparent">
                  DocTime
                </h3>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  سامانه نوبت‌دهی آنلاین پزشکان
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm font-semibold leading-8 text-slate-600">
              داک‌تایم برای ساده‌کردن مسیر پیدا کردن پزشک، مشاهده زمان‌های خالی و رزرو آنلاین
              نوبت طراحی شده است. هدف ما تجربه‌ای سریع، قابل اعتماد و حرفه‌ای برای بیماران و
              پزشکان است.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/search"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-sky-600 px-5 py-2.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5"
              >
                جستجوی پزشک
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full border border-sky-100 bg-white px-5 py-2.5 text-sm font-black text-slate-800 transition hover:border-sky-300 hover:text-sky-800"
              >
                ایجاد حساب کاربری
              </Link>
            </div>
          </div>

          {/* quick links */}
          <div className="rounded-[28px] border border-sky-100 bg-white p-6 shadow-[0_14px_45px_rgba(37,99,235,0.06)]">
            <h4 className="text-lg font-black text-slate-900">دسترسی سریع</h4>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="group inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-sky-800"
                  >
                    <span className="h-2 w-2 rounded-full bg-sky-500 transition group-hover:scale-125" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* company */}
          <div className="rounded-[28px] border border-sky-100 bg-white p-6 shadow-[0_14px_45px_rgba(37,99,235,0.06)]">
            <h4 className="text-lg font-black text-slate-900">داک‌تایم</h4>
            <ul className="mt-5 space-y-3">
              {companyLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="group inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-sky-800"
                  >
                    <span className="h-2 w-2 rounded-full bg-blue-500 transition group-hover:scale-125" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div className="rounded-[28px] border border-sky-100 bg-white p-6 shadow-[0_14px_45px_rgba(37,99,235,0.06)]">
            <h4 className="text-lg font-black text-slate-900">اطلاعات تماس</h4>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
                <p className="text-xs font-extrabold text-slate-500">پشتیبانی تلفنی</p>
                <p className="mt-1 text-sm font-black text-slate-900" dir="ltr">
                  021-12345678
                </p>
              </div>

              <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
                <p className="text-xs font-extrabold text-slate-500">ایمیل</p>
                <p className="mt-1 text-sm font-black text-slate-900">
                  info@doctime.ir
                </p>
              </div>

              <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
                <p className="text-xs font-extrabold text-slate-500">آدرس</p>
                <p className="mt-1 text-sm font-black leading-7 text-slate-900">
                  چابهار، بلوار آزادی، پلاک ۱۲
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* bottom */}
        <div className="mt-10 rounded-[28px] border border-sky-200/80 bg-[linear-gradient(180deg,rgba(18,44,86,0.88)_0%,rgba(23,53,102,0.92)_100%)] px-5 py-5 shadow-[0_10px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 text-center md:flex-row md:items-center md:justify-between md:text-right">
            <div>
              <p className="text-sm font-bold text-sky-50">
                © {new Date().getFullYear()} DocTime. تمامی حقوق این سامانه محفوظ است.
              </p>
              <p className="mt-2 text-sm font-black text-sky-100">
                طراح و توسعه‌دهنده:{" "}
                <span className="text-sky-300">محمدصادق بلوچ</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-end">
              <span className="rounded-full border border-sky-400/30 bg-white/10 px-3 py-1 text-xs font-extrabold text-sky-50">
                نوبت‌دهی آنلاین
              </span>
              <span className="rounded-full border border-sky-400/30 bg-white/10 px-3 py-1 text-xs font-extrabold text-sky-50">
                پزشکان متخصص
              </span>
              <span className="rounded-full border border-sky-400/30 bg-white/10 px-3 py-1 text-xs font-extrabold text-sky-50">
                تجربه سریع‌تر بیماران
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}