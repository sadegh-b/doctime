import { Link } from "react-router-dom";
import { Activity, HeartPulse, Pill, ArrowLeft } from "lucide-react";

const articles = [
  {
    title: "راهنمای ترک اعتیاد",
    description:
      "آشنایی با مراحل ترک اعتیاد، اهمیت حمایت خانواده و نقش مشاوره تخصصی در روند درمان.",
    to: "/health-magazine/addiction-recovery",
    icon: <Activity size={20} />,
  },
  {
    title: "یبوست؛ علت‌ها و راه‌های کنترل",
    description:
      "بررسی علت‌های شایع یبوست، روش‌های خانگی کنترل آن و زمان مناسب مراجعه به پزشک.",
    to: "/health-magazine/constipation",
    icon: <HeartPulse size={20} />,
  },
  {
    title: "دیابت؛ شناخت، پیشگیری و کنترل",
    description:
      "مروری بر علائم دیابت، عوامل خطر، سبک زندگی مناسب و اهمیت پیگیری درمان.",
    to: "/health-magazine/diabetes",
    icon: <Pill size={20} />,
  },
];

const HealthMagazinePage = () => {
  return (
    <section className="bg-slate-50 py-16" dir="rtl">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 md:p-10">
          <h1 className="mb-4 text-3xl font-extrabold text-slate-900 md:text-4xl">
            مجله سلامت
          </h1>
          <p className="max-w-3xl leading-8 text-slate-700 md:text-lg">
            در مجله سلامت DocTime مطالبی کاربردی و ساده درباره موضوعات مهم سلامت
            منتشر می‌شود تا کاربران با آگاهی بیشتر تصمیم بگیرند و مسیر درمان خود
            را بهتر دنبال کنند.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <div
              key={article.to}
              className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                {article.icon}
              </div>
              <h2 className="mb-3 text-xl font-bold text-slate-900">
                {article.title}
              </h2>
              <p className="mb-6 leading-8 text-slate-700">
                {article.description}
              </p>
              <Link
                to={article.to}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
              >
                مطالعه مقاله
                <ArrowLeft size={16} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HealthMagazinePage;
