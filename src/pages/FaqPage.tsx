const faqItems = [
  {
    question: "چطور درخواست مشاوره یا شرح حال ثبت کنم؟",
    answer:
      "از طریق فرم مربوطه اطلاعات لازم را وارد کنید. پس از ثبت موفق، سامانه یک کد پیگیری برای شما نمایش می‌دهد.",
  },
  {
    question: "کد پیگیری را از کجا دریافت می‌کنم؟",
    answer:
      "بعد از ثبت موفق درخواست، کد پیگیری در پاسخ سامانه نمایش داده می‌شود و باید آن را برای پیگیری‌های بعدی نگه دارید.",
  },
  {
    question: "وضعیت pending به چه معناست؟",
    answer:
      "این وضعیت یعنی درخواست شما با موفقیت ثبت شده و در انتظار بررسی یا ادامه فرایند است.",
  },
  {
    question: "اگر اطلاعات را اشتباه وارد کنم چه می‌شود؟",
    answer:
      "بهتر است اطلاعات را با دقت وارد کنید. در صورت بروز مشکل، از طریق صفحه تماس با ما موضوع را پیگیری کنید.",
  },
  {
    question: "اگر کد پیگیری را گم کنم چه کار کنم؟",
    answer:
      "در این حالت می‌توانید با پشتیبانی تماس بگیرید و با ارائه شماره تلفن ثبت شده، درخواست خود را پیگیری کنید.",
  },
];

const FaqPage = () => {
  return (
    <section className="bg-slate-50 py-16" dir="rtl">
      <div className="mx-auto max-w-5xl px-4">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 md:p-10">
          <h1 className="mb-8 text-3xl font-extrabold text-slate-900 md:text-4xl">
            سوالات متداول
          </h1>

          <div className="space-y-4">
            {faqItems.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <h2 className="mb-3 text-lg font-bold text-slate-900">
                  {item.question}
                </h2>
                <p className="leading-8 text-slate-700">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqPage;
