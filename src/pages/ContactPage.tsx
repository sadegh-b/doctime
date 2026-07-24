const contactItems = [
  {
    title: "شماره تماس",
    value: "021-12345678",
  },
  {
    title: "ایمیل",
    value: "support@doctime.ir",
  },
  {
    title: "ساعات پاسخگویی",
    value: "شنبه تا پنج شنبه، 9 صبح تا 6 عصر",
  },
  {
    title: "آدرس",
    value: "تهران، ایران",
  },
];

const ContactPage = () => {
  return (
    <section className="bg-slate-50 py-16" dir="rtl">
      <div className="mx-auto max-w-5xl px-4">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 md:p-10">
          <h1 className="mb-4 text-3xl font-extrabold text-slate-900 md:text-4xl">
            تماس با ما
          </h1>

          <p className="mb-8 leading-8 text-slate-700 md:text-lg">
            برای ارتباط با تیم DocTime می‌توانید از راه‌های زیر استفاده کنید.
            ما تلاش می‌کنیم در سریع‌ترین زمان ممکن پاسخ‌گوی شما باشیم.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {contactItems.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <h2 className="mb-2 text-lg font-bold text-slate-900">
                  {item.title}
                </h2>
                <p className="text-slate-700">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
