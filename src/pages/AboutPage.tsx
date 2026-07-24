const AboutPage = () => {
  return (
    <section className="bg-slate-50 py-16" dir="rtl">
      <div className="mx-auto max-w-5xl px-4">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 md:p-10">
          <h1 className="mb-6 text-3xl font-extrabold text-slate-900 md:text-4xl">
            درباره ما
          </h1>

          <div className="space-y-5 text-base leading-8 text-slate-700 md:text-lg">
            <p>
              ما در DocTime تلاش می‌کنیم مسیر دریافت خدمات پزشکی و مشاوره را
              ساده‌تر، سریع‌تر و قابل پیگیری‌تر کنیم. هدف ما این است که کاربران
              بتوانند بدون پیچیدگی، درخواست خود را ثبت کرده و وضعیت آن را به
              صورت شفاف دنبال کنند.
            </p>

            <p>
              این سامانه با تمرکز بر تجربه کاربری، دسترسی آسان و نظم در فرایند
              پیگیری طراحی شده است تا بیماران و کاربران بتوانند با اطمینان بیشتر
              از خدمات آنلاین استفاده کنند.
            </p>

            <p>
              ما باور داریم فناوری باید در خدمت آرامش و تصمیم‌گیری بهتر کاربران
              باشد؛ به همین دلیل روی سادگی، شفافیت و بهبود مستمر تجربه استفاده از
              سامانه تمرکز کرده‌ایم.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;
