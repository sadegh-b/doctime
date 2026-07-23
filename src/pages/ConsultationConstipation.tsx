// frontend/src/pages/Patient/ConsultationConstipation.tsx

import React, { useState } from "react";

function ConsultationConstipation() {
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setMessage({ type: "error", text: "لطفاً شرح حال خود را وارد کنید." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // شبیه‌سازی درخواست به بک‌اند (باید بعداً با ای‌پی‌آی واقعی جایگزین شود)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setMessage({
        type: "success",
        text: "درخواست مشاوره شما با موفقیت ثبت شد. پزشکان ما به زودی با شما تماس خواهند گرفت.",
      });
      setDescription("");
    } catch (error) {
      setMessage({
        type: "error",
        text: "خطایی در ثبت درخواست رخ داد. لطفاً مجدداً تلاش کنید.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 dir-rtl">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-8 rounded-2xl border border-emerald-100 mb-8">
        <h1 className="text-3xl font-black text-emerald-900 mb-4">
          مشاوره تخصصی درمان یبوست
        </h1>
        <p className="text-slate-700 leading-8 text-lg">
          یبوست یکی از مشکلات شایع گوارشی است که می‌تواند به دلیل رژیم غذایی نامناسب،
          کمبود فیبر، کم‌آبی بدن، عدم فعالیت بدنی مناسب یا سایر اختلالات گوارشی ایجاد شود.
          با پر کردن فرم زیر، پزشکان متخصص ما راهکارها و درمان‌های متناسب با شرایط شما را ارائه خواهند کرد.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* بخش فرم تعاملی */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="font-bold text-xl text-slate-800 mb-4">ثبت درخواست مشاوره فوری</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="symptoms" className="block text-sm font-medium text-slate-700 mb-2">
                توضیح علائم و شرح حال فعلی:
              </label>
              <textarea
                id="symptoms"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مثال: حدود ۳ روز است که دفع نداشته‌ام و همراه با دل‌درد خفیف است..."
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 transition-all text-sm"
                disabled={isSubmitting}
              />
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg text-sm ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 flex items-center justify-center gap-2 disabled:bg-emerald-400"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  در حال ثبت...
                </>
              ) : (
                "ارسال درخواست به پزشک متخصص"
              )}
            </button>
          </form>
        </div>

        {/* بخش نکات آموزشی */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-emerald-600">✦</span> اقدامات اولیه پیشنهادی:
          </h2>
          <ul className="space-y-3 text-slate-600 text-sm leading-7">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">•</span>
              افزایش مصرف فیبر روزانه (میوه‌ها، سبزیجات و غلات کامل)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">•</span>
              نوشیدن حداقل ۸ الی ۱۰ لیوان آب در طول روز
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">•</span>
              انجام فعالیت‌های ورزشی سبک مانند پیاده‌روی منظم
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">•</span>
              پرهیز از مصرف خودسرانه و طولانی‌مدت ملین‌های شیمیایی
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ConsultationConstipation;
