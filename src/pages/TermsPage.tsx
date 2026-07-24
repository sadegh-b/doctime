const TermsPage = () => {
  return (
    <section className="bg-slate-50 py-16" dir="rtl">
      <div className="mx-auto max-w-5xl px-4">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 md:p-10">
          <h1 className="mb-6 text-3xl font-extrabold text-slate-900 md:text-4xl">
            قوانین و مقررات
          </h1>

          <div className="space-y-5 text-base leading-8 text-slate-700 md:text-lg">
            <p>
              استفاده از سامانه DocTime به معنای پذیرش قوانین و مقررات جاری سایت
              است. کاربران متعهد می‌شوند اطلاعات صحیح، کامل و به‌روز وارد کنند.
            </p>

            <p>
              مسئولیت صحت اطلاعات ثبت شده در فرم‌ها بر عهده کاربر است. در صورت
              ثبت اطلاعات ناقص یا نادرست، ممکن است ارائه خدمات یا پیگیری درخواست
              با اختلال مواجه شود.
            </p>

            <p>
              اطلاعات کاربران با رعایت اصول محرمانگی نگهداری می‌شود و فقط در
              چارچوب خدمات سامانه مورد استفاده قرار می‌گیرد.
            </p>

            <p>
              DocTime می‌تواند در هر زمان برای بهبود خدمات یا انطباق با شرایط
              جدید، این قوانین را به‌روزرسانی کند. استفاده مستمر از سایت به
              معنای پذیرش نسخه جدید قوانین خواهد بود.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsPage;
