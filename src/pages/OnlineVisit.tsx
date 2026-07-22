import { Link } from "react-router-dom";
import famImage from "../assets/images/fam.jpg";

const FALLBACK_IMAGE = famImage;

type OnlineDoctor = {
  id: number;
  name: string;
  specialty: string;
  image: string;
  rating: number;
  experience: string;
  responseTime: string;
  price: string;
  online: boolean;
  tags: string[];
};

const onlineSpecialties = [
  { id: 1, title: "پزشک عمومی", icon: "🩺", count: "۱۲۰+ پزشک" },
  { id: 2, title: "زنان و زایمان", icon: "👩‍⚕️", count: "۶۵+ پزشک" },
  { id: 3, title: "پوست و مو", icon: "✨", count: "۷۰+ پزشک" },
  { id: 4, title: "روانشناسی", icon: "🧠", count: "۵۵+ پزشک" },
  { id: 5, title: "اطفال", icon: "👶", count: "۴۰+ پزشک" },
  { id: 6, title: "تغذیه", icon: "🥗", count: "۳۰+ پزشک" },
];

const onlineDoctors: OnlineDoctor[] = [
  {
    id: 1,
    name: "دکتر نازنین احمدی",
    specialty: "متخصص زنان و زایمان",
    image: FALLBACK_IMAGE,
    rating: 4.9,
    experience: "۱۲ سال سابقه",
    responseTime: "پاسخ در کمتر از ۱۰ دقیقه",
    price: "۲۴۹,۰۰۰ تومان",
    online: true,
    tags: ["چت آنلاین", "نسخه", "بررسی آزمایش"],
  },
  {
    id: 2,
    name: "دکتر آرش کریمی",
    specialty: "متخصص پوست، مو و زیبایی",
    image: FALLBACK_IMAGE,
    rating: 4.8,
    experience: "۹ سال سابقه",
    responseTime: "پاسخ در کمتر از ۱۵ دقیقه",
    price: "۲۹۹,۰۰۰ تومان",
    online: true,
    tags: ["مشاوره آنلاین", "ارسال عکس", "نسخه"],
  },
  {
    id: 3,
    name: "دکتر مهتاب رضایی",
    specialty: "روانشناس و مشاور",
    image: FALLBACK_IMAGE,
    rating: 4.9,
    experience: "۱۰ سال سابقه",
    responseTime: "پاسخ در کمتر از ۲۰ دقیقه",
    price: "۳۵۰,۰۰۰ تومان",
    online: true,
    tags: ["چت", "تماس", "مشاوره فردی"],
  },
  {
    id: 4,
    name: "دکتر پویا محمدی",
    specialty: "پزشک عمومی",
    image: FALLBACK_IMAGE,
    rating: 4.7,
    experience: "۸ سال سابقه",
    responseTime: "پاسخ در کمتر از ۸ دقیقه",
    price: "۱۸۹,۰۰۰ تومان",
    online: true,
    tags: ["ویزیت فوری", "نسخه", "مشاوره عمومی"],
  },
];

const onlineBenefits = [
  {
    title: "شروع سریع مشاوره",
    desc: "بدون نیاز به مراجعه حضوری، پزشک آنلاین را انتخاب کنید و در چند دقیقه مشاوره بگیرید.",
    icon: "⚡",
  },
  {
    title: "ارسال مدارک و آزمایش",
    desc: "نتایج آزمایش، تصویر یا شرح علائم را برای پزشک ارسال کنید و پاسخ دقیق‌تر بگیرید.",
    icon: "📄",
  },
  {
    title: "در دسترس در تمام روز",
    desc: "در هر ساعت از شبانه‌روز پزشک مناسب را پیدا کنید و مشاوره آنلاین بگیرید.",
    icon: "🕘",
  },
];

const visitSteps = [
  {
    id: 1,
    title: "انتخاب پزشک آنلاین",
    desc: "تخصص موردنظر را انتخاب کنید و پزشک آنلاین مناسب را بر اساس امتیاز، زمان پاسخ و هزینه ببینید.",
  },
  {
    id: 2,
    title: "ثبت سوال و ارسال مدارک",
    desc: "مشکل خود را توضیح دهید، علائم یا تصاویر و نتایج آزمایش را ارسال کنید و نوع مشاوره را شروع کنید.",
  },
  {
    id: 3,
    title: "دریافت پاسخ و ادامه درمان",
    desc: "پاسخ پزشک، توصیه درمانی، نسخه یا راهنمایی لازم را دریافت کنید و در صورت نیاز گفتگو را ادامه دهید.",
  },
];

const faqItems = [
  {
    q: "ویزیت آنلاین برای چه مشکلاتی مناسب است؟",
    a: "برای بسیاری از مسائل پزشکی مانند علائم اولیه، پیگیری درمان، تفسیر آزمایش، مشاوره پوست، تغذیه، روانشناسی و سوالات عمومی پزشکی مناسب است. در موارد اورژانسی باید حضوری مراجعه کنید.",
  },
  {
    q: "آیا پزشک در ویزیت آنلاین نسخه هم می‌نویسد؟",
    a: "بسته به نوع خدمت و تشخیص پزشک، امکان ارائه نسخه یا توصیه درمانی وجود دارد. این موضوع به نوع تخصص و شرایط بیمار بستگی دارد.",
  },
  {
    q: "چقدر طول می‌کشد تا پزشک پاسخ دهد؟",
    a: "بسته به پزشک، زمان پاسخ متفاوت است. در کارت هر پزشک، زمان تقریبی پاسخ نمایش داده شده تا انتخاب راحت‌تری داشته باشید.",
  },
];

export default function OnlineVisit() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f7fffb_0%,#ffffff_38%,#f8fbff_100%)]">
      <div className="space-y-24 pb-24">
        {/* ================= HERO ================= */}
        <section className="relative overflow-hidden px-4 pt-20 md:pt-24">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute right-[5%] top-8 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
            <div className="absolute left-[6%] top-24 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />
            <div className="absolute bottom-0 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-teal-100/40 blur-3xl" />
          </div>

          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-[38px] border border-emerald-100/80 bg-white/80 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_26%),radial-gradient(circle_at_15%_80%,rgba(6,182,212,0.12),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(248,250,252,0.78))]" />

              <div className="relative z-10 grid items-center gap-10 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-[1.08fr_0.92fr] lg:px-14 lg:py-14">
                {/* RIGHT CONTENT */}
                <div className="text-center lg:text-right" dir="rtl">
                  <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-4 py-2 text-xs font-black text-emerald-800 shadow-sm md:text-sm">
                      <span className="text-base">💬</span>
                      ویزیت آنلاین پزشک
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs font-extrabold text-slate-600 shadow-sm md:text-sm">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.12)]" />
                      پزشکان آنلاین و آماده پاسخ
                    </span>
                  </div>

                  <h1 className="mt-7 text-4xl font-black leading-[1.2] text-slate-950 md:text-5xl lg:text-6xl">
                    ویزیت آنلاین پزشک،
                    <br />
                    <span className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 bg-clip-text text-transparent">
                      سریع، امن و بدون مراجعه حضوری
                    </span>
                  </h1>

                  <p className="mx-auto mt-6 max-w-2xl text-sm font-semibold leading-8 text-slate-600 md:mx-0 md:text-lg md:leading-9">
                    با پزشکان عمومی، متخصص، روانشناس و مشاوران سلامت در داک‌تایم به‌صورت آنلاین
                    در ارتباط باشید، سوالات خود را بپرسید، مدارک و آزمایش‌ها را ارسال کنید و
                    پاسخ تخصصی دریافت کنید.
                  </p>

                  <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-4 text-center shadow-sm">
                      <p className="text-2xl font-black text-emerald-700 md:text-3xl">۲۴/۷</p>
                      <p className="mt-1 text-xs font-extrabold text-slate-600 md:text-sm">
                        دسترسی به ویزیت آنلاین
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-4 text-center shadow-sm">
                      <p className="text-2xl font-black text-emerald-700 md:text-3xl">۲۰۰+</p>
                      <p className="mt-1 text-xs font-extrabold text-slate-600 md:text-sm">
                        پزشک فعال آنلاین
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-4 text-center shadow-sm">
                      <p className="text-2xl font-black text-emerald-700 md:text-3xl">۱۰ دقیقه</p>
                      <p className="mt-1 text-xs font-extrabold text-slate-600 md:text-sm">
                        میانگین شروع پاسخ
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                    <Link
                      to="/doctors?mode=online"
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 text-sm font-black text-white shadow-[0_18px_40px_rgba(16,185,129,0.26)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(16,185,129,0.32)] md:text-base"
                    >
                      شروع ویزیت آنلاین
                    </Link>

                    <Link
                      to="/doctors"
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/95 px-8 py-4 text-sm font-black text-slate-800 shadow-sm transition-all duration-300 hover:border-emerald-300 hover:text-emerald-800 md:text-base"
                    >
                      مشاهده همه پزشکان
                    </Link>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                    {["چت پزشکی", "ارسال آزمایش", "نسخه و پیگیری درمان"].map((item) => (
                      <div
                        key={item}
                        className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/70 px-4 py-2 text-xs font-extrabold text-emerald-900"
                      >
                        <span className="text-emerald-600">✓</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* LEFT VISUAL PANEL */}
                <div className="relative" dir="rtl">
                  <div className="rounded-[32px] border border-white/80 bg-white/85 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl md:p-5">
                    <div className="rounded-[28px] bg-[linear-gradient(180deg,#f0fdf4_0%,#ffffff_48%,#ecfeff_100%)] p-4 md:p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-extrabold text-slate-500">پزشک آنلاین پیشنهادی</p>
                          <p className="mt-1 text-lg font-black text-slate-900">
                            {onlineDoctors[0].name}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white px-3 py-2 text-2xl shadow-sm">🩺</div>
                      </div>

                      <div className="rounded-[26px] border border-white/80 bg-white/90 p-4 shadow-sm">
                        <div className="flex items-start gap-4">
                          <img
                            src={onlineDoctors[0].image}
                            alt={onlineDoctors[0].name}
                            className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white shadow"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_IMAGE;
                            }}
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-base font-black text-slate-900">
                                  {onlineDoctors[0].name}
                                </p>
                                <p className="mt-1 text-sm font-bold text-slate-600">
                                  {onlineDoctors[0].specialty}
                                </p>
                              </div>

                              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                                ★ {onlineDoctors[0].rating}
                              </span>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                              <div className="rounded-2xl bg-emerald-50 p-3">
                                <p className="text-[11px] font-extrabold text-slate-500">زمان پاسخ</p>
                                <p className="mt-1 text-sm font-black text-emerald-700">
                                  {onlineDoctors[0].responseTime}
                                </p>
                              </div>

                              <div className="rounded-2xl bg-slate-50 p-3">
                                <p className="text-[11px] font-extrabold text-slate-500">هزینه مشاوره</p>
                                <p className="mt-1 text-sm font-black text-slate-900">
                                  {onlineDoctors[0].price}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {[
                          { title: "انتخاب پزشک آنلاین", desc: "بر اساس تخصص و زمان پاسخ" },
                          { title: "ارسال شرح حال و مدارک", desc: "متن، عکس یا آزمایش" },
                          { title: "دریافت پاسخ و نسخه", desc: "بدون مراجعه حضوری" },
                        ].map((step, index) => (
                          <div
                            key={step.title}
                            className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/80 p-3 shadow-sm"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-black text-white shadow">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900">{step.title}</p>
                              <p className="mt-1 text-xs font-semibold leading-6 text-slate-600">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 rounded-[24px] border border-emerald-100 bg-gradient-to-r from-emerald-50 to-cyan-50 p-4">
                        <p className="text-sm font-bold leading-7 text-slate-700">
                          برای مشکلات غیر اورژانسی، پیگیری درمان، تفسیر آزمایش و سوالات پزشکی،
                          ویزیت آنلاین سریع‌ترین مسیر ارتباط با پزشک است.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -left-4 top-10 hidden rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.10)] xl:block">
                    <p className="text-[11px] font-extrabold text-slate-500">ویزیت‌های آنلاین امروز</p>
                    <p className="mt-1 text-lg font-black text-emerald-700">+۳۴۰</p>
                  </div>

                  <div className="absolute -bottom-5 right-8 hidden rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.10)] xl:block">
                    <p className="text-[11px] font-extrabold text-slate-500">پزشک آنلاین فعال</p>
                    <p className="mt-1 text-lg font-black text-slate-900">۲۰۰+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= BENEFITS ================= */}
        <section className="px-4" dir="rtl">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <span className="inline-flex rounded-full border border-emerald-200 bg-white px-5 py-2 text-xs font-extrabold text-emerald-900">
                مزایای ویزیت آنلاین
              </span>
              <h2 className="mt-5 text-3xl font-black text-slate-900 md:text-5xl">
                چرا ویزیت آنلاین داک‌تایم؟
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-sm font-semibold leading-8 text-slate-600 md:text-lg">
                برای مشاوره پزشکی سریع، پیگیری درمان، تفسیر آزمایش و پرسش‌های غیر اورژانسی، ویزیت
                آنلاین می‌تواند مسیر ساده‌تر و سریع‌تری باشد.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {onlineBenefits.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/70 bg-white/75 p-7 shadow-[0_14px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_55px_rgba(16,185,129,0.12)]"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{item.title}</h3>
                  <p className="mt-3 text-sm font-semibold leading-8 text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= SPECIALTIES ================= */}
        <section className="px-4" dir="rtl">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex flex-col items-center justify-between gap-5 text-center md:flex-row md:text-right">
              <div>
                <span className="inline-flex rounded-full border border-emerald-200 bg-white px-5 py-2 text-xs font-extrabold text-emerald-900">
                  تخصص‌های مناسب مشاوره آنلاین
                </span>
                <h2 className="mt-5 text-3xl font-black text-slate-900 md:text-5xl">
                  با پزشک مناسب آنلاین صحبت کنید
                </h2>
                <p className="mt-4 text-sm font-semibold leading-8 text-slate-600 md:text-lg">
                  تخصص‌های پرمراجعه برای ویزیت آنلاین، مشاوره، پیگیری درمان و بررسی علائم
                </p>
              </div>

              <Link
                to="/specialties"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-800 transition hover:border-emerald-300 hover:text-emerald-800"
              >
                مشاهده همه تخصص‌ها
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {onlineSpecialties.map((item) => (
                <Link
                  key={item.id}
                  to={`/search?specialty=${encodeURIComponent(item.title)}`}
                  className="rounded-3xl border border-white/70 bg-white/80 p-5 text-center shadow-[0_12px_35px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-[0_18px_45px_rgba(16,185,129,0.10)]"
                >
                  <div className="mb-4 text-5xl">{item.icon}</div>
                  <div className="text-sm font-black text-slate-800">{item.title}</div>
                  <div className="mt-2 text-xs font-extrabold text-slate-500">{item.count}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ================= ONLINE DOCTORS ================= */}
        <section className="px-4" dir="rtl">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex flex-col items-center justify-between gap-5 text-center md:flex-row md:text-right">
              <div>
                <span className="inline-flex rounded-full border border-emerald-200 bg-white px-5 py-2 text-xs font-extrabold text-emerald-900">
                  پزشکان آنلاین
                </span>
                <h2 className="mt-5 text-3xl font-black text-slate-900 md:text-5xl">
                  پزشکان آماده مشاوره آنلاین
                </h2>
                <p className="mt-4 text-sm font-semibold leading-8 text-slate-600 md:text-lg">
                  پزشکان فعال با امتیاز بالا، زمان پاسخ مناسب و امکان شروع سریع ویزیت
                </p>
              </div>

              <Link
                to="/doctors?mode=online"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-800 transition hover:border-emerald-300 hover:text-emerald-800"
              >
                مشاهده همه پزشکان آنلاین
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {onlineDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_14px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(16,185,129,0.12)] md:p-6"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start">
                    <div className="relative mx-auto md:mx-0">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="h-24 w-24 rounded-3xl object-cover ring-4 ring-emerald-100 shadow-md"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                      {doctor.online && (
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-white bg-emerald-500 px-3 py-1 text-[10px] font-black text-white shadow md:left-auto md:right-0 md:translate-x-0">
                          آنلاین
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 text-center md:text-right">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <h3 className="truncate text-xl font-black text-slate-900">
                            {doctor.name}
                          </h3>
                          <p className="mt-1 text-sm font-bold text-slate-600">
                            {doctor.specialty}
                          </p>
                        </div>

                        <div className="flex items-center justify-center gap-2 md:justify-end">
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                            ★ {doctor.rating}
                          </span>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                            {doctor.responseTime}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-[11px] font-extrabold text-slate-500">سابقه</p>
                          <p className="mt-1 text-sm font-black text-slate-900">
                            {doctor.experience}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-[11px] font-extrabold text-slate-500">هزینه مشاوره</p>
                          <p className="mt-1 text-sm font-black text-slate-900">
                            {doctor.price}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-[11px] font-extrabold text-slate-500">نوع خدمت</p>
                          <p className="mt-1 text-sm font-black text-emerald-700">ویزیت آنلاین</p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                        {doctor.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-emerald-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
                        <Link
                          to={`/doctor/${doctor.id}`}
                          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 transition hover:border-emerald-300 hover:text-emerald-800"
                        >
                          مشاهده پروفایل پزشک
                        </Link>

                        <Link
                          to={`/doctor/${doctor.id}?visit=online`}
                          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-black text-white shadow-[0_14px_35px_rgba(16,185,129,0.20)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(16,185,129,0.28)]"
                        >
                          شروع مشاوره آنلاین
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= STEPS ================= */}
        <section className="px-4" dir="rtl">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <span className="inline-flex rounded-full border border-emerald-200 bg-white px-5 py-2 text-xs font-extrabold text-emerald-900">
                مراحل ویزیت آنلاین
              </span>
              <h2 className="mt-5 text-3xl font-black text-slate-900 md:text-5xl">
                ویزیت آنلاین در سه مرحله ساده
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-sm font-semibold leading-8 text-slate-600 md:text-lg">
                روند مشاوره آنلاین در داک‌تایم طوری طراحی شده که سریع، روشن و بدون پیچیدگی باشد.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {visitSteps.map((step) => (
                <div
                  key={step.id}
                  className="relative rounded-3xl border border-white/70 bg-white/80 p-7 shadow-[0_14px_45px_rgba(15,23,42,0.06)]"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-xl font-black text-white shadow-lg">
                    {step.id}
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{step.title}</h3>
                  <p className="mt-3 text-sm font-semibold leading-8 text-slate-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FAQ ================= */}
        <section className="px-4" dir="rtl">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <span className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-extrabold text-slate-700">
                سوالات متداول
              </span>
              <h2 className="mt-5 text-3xl font-black text-slate-900 md:text-5xl">
                درباره ویزیت آنلاین بیشتر بدانید
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-sm font-semibold leading-8 text-slate-600 md:text-lg">
                قبل از شروع مشاوره آنلاین، پاسخ چند سوال رایج را ببینید.
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item) => (
                <div
                  key={item.q}
                  className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
                >
                  <h3 className="text-lg font-black text-slate-900">{item.q}</h3>
                  <p className="mt-3 text-sm font-semibold leading-8 text-slate-600">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CTA =====