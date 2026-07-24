// Path: frontend/src/pages/AnamnesisForm.tsx

import React, { useState } from "react";
import axios from "axios";
import { Send, CheckCircle2, AlertCircle, ArrowRight, Activity, Heart } from "lucide-react";

// ساختار داده‌های شرح حال
interface AnamnesisData {
  addiction: {
    substanceName: string;
    usageDuration: string;
    usageAmount: string;
    previousAttempts: string;
  };
  constipation: {
    duration: string;
    severity: "low" | "medium" | "high" | "";
    associatedSymptoms: string[];
    currentMedications: string;
  };
}

export default function AnamnesisForm() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<"addiction" | "constipation" | null>(null);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trackingCode, setTrackingCode] = useState<number | null>(null);

  // داده‌های تفصیلی شرح حال بیمار
  const [anamnesisDetails, setAnamnesisDetails] = useState<AnamnesisData>({
    addiction: {
      substanceName: "",
      usageDuration: "",
      usageAmount: "",
      previousAttempts: "",
    },
    constipation: {
      duration: "",
      severity: "",
      associatedSymptoms: [],
      currentMedications: "",
    },
  });

  // ولیدیشن شماره موبایل ایران
  const validatePhone = (value: string) => {
    const phoneRegex = /^09\d{9}$/;
    if (!value) {
      setPhoneError("وارد کردن شماره تماس الزامی است.");
      return false;
    }
    if (!phoneRegex.test(value)) {
      setPhoneError("فرمت شماره همراه نامعتبر است. نمونه معتبر: ۰۹۱۲۳۴۵۶۷۸۹");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleCheckboxChange = (symptom: string) => {
    const currentSymptoms = anamnesisDetails.constipation.associatedSymptoms;
    if (currentSymptoms.includes(symptom)) {
      setAnamnesisDetails({
        ...anamnesisDetails,
        constipation: {
          ...anamnesisDetails.constipation,
          associatedSymptoms: currentSymptoms.filter((s) => s !== symptom),
        },
      });
    } else {
      setAnamnesisDetails({
        ...anamnesisDetails,
        constipation: {
          ...anamnesisDetails.constipation,
          associatedSymptoms: [...currentSymptoms, symptom],
        },
      });
    }
  };

  // ایجاد متادیتا و خلاصه شرح حال جهت ذخیره در فیلد summary_data
  const generateSummaryText = (): string => {
    if (type === "addiction") {
      const { substanceName, usageDuration, usageAmount, previousAttempts } = anamnesisDetails.addiction;
      return `نوع شرح حال: ترک اعتیاد\nماده مصرفی: ${substanceName}\nمدت مصرف: ${usageDuration}\nمیزان مصرف روزانه: ${usageAmount}\nسابقه ترک قبلی: ${previousAttempts}`;
    } else if (type === "constipation") {
      const { duration, severity, associatedSymptoms, currentMedications } = anamnesisDetails.constipation;
      return `نوع شرح حال: درمان یبوست\nمدت ابتلا: ${duration}\nشدت سختی دفع: ${severity}\nعلائم همراه: ${associatedSymptoms.join(", ") || "ندارد"}\nداروهای مصرفی فعلی: ${currentMedications || "ندارد"}`;
    }
    return "";
  };

  const handleSubmit = async () => {
    if (!validatePhone(phone)) {
      return;
    }

    setLoading(true);
    const summary = generateSummaryText();

    try {
      const response = await axios.post("http://localhost:8000/api/v1/consultations/submit", {
        phone_number: phone,
        consultation_type: type,
        summary_data: summary,
      });

      if (response.data && response.data.status === "success") {
        setTrackingCode(response.data.tracking_code);
        setSubmitted(true);
        setStep(3);
      }
    } catch (error) {
      alert("خطا در ارسال فرم به سرور. لطفاً از روشن بودن بک‌اند اطمینان حاصل کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl" dir="rtl">
      {/* مرحله ۱: انتخاب حوزه مشکل */}
      {step === 1 && (
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800 mb-2">ثبت درخواست شرح حال (Anamnesis)</h2>
          <p className="text-slate-500 text-sm mb-8">جهت تسهیل در تشخیص دقیق پزشک، حوزه مشکل خود را انتخاب کنید.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setType("addiction");
                setStep(2);
              }}
              className="p-6 border-2 border-slate-100 rounded-2xl hover:border-blue-600 hover:bg-blue-50/30 transition-all flex flex-col items-center gap-3 group text-right"
            >
              <div className="p-3 bg-red-50 text-red-500 rounded-xl group-hover:bg-red-100 transition-colors">
                <Heart size={28} />
              </div>
              <span className="text-lg font-black text-slate-800">مشاوره ترک اعتیاد</span>
              <span className="text-xs text-slate-500 text-center">ارزیابی تخصصی دوره و دوز مصرفی مواد</span>
            </button>

            <button
              onClick={() => {
                setType("constipation");
                setStep(2);
              }}
              className="p-6 border-2 border-slate-100 rounded-2xl hover:border-blue-600 hover:bg-blue-50/30 transition-all flex flex-col items-center gap-3 group text-right"
            >
              <div className="p-3 bg-amber-50 text-amber-500 rounded-xl group-hover:bg-amber-100 transition-colors">
                <Activity size={28} />
              </div>
              <span className="text-lg font-black text-slate-800">مشاوره درمان یبوست</span>
              <span className="text-xs text-slate-500 text-center">ارزیابی دوره ابتلا، شدت دفع و علائم روده</span>
            </button>
          </div>
        </div>
      )}

      {/* مرحله ۲: دریافت جزئیات و شماره تلفن */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-xl font-black text-slate-800">
              {type === "addiction" ? "شرح حال ترک اعتیاد" : "شرح حال درمان یبوست"}
            </h2>
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:text-blue-700"
            >
              <ArrowRight size={14} />
              <span>تغییر نوع درخواست</span>
            </button>
          </div>

          {/* فیلدهای اختصاصی اعتیاد */}
          {type === "addiction" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 mb-2">نام ماده مصرفی:</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={anamnesisDetails.addiction.substanceName}
                  onChange={(e) =>
                    setAnamnesisDetails({
                      ...anamnesisDetails,
                      addiction: { ...anamnesisDetails.addiction, substanceName: e.target.value },
                    })
                  }
                  placeholder="مثال: تریاک، متادون، ب2 و..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2">مدت زمان مصرف:</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={anamnesisDetails.addiction.usageDuration}
                    onChange={(e) =>
                      setAnamnesisDetails({
                        ...anamnesisDetails,
                        addiction: { ...anamnesisDetails.addiction, usageDuration: e.target.value },
                      })
                    }
                    placeholder="مثال: ۲ سال"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2">میزان مصرف روزانه:</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={anamnesisDetails.addiction.usageAmount}
                    onChange={(e) =>
                      setAnamnesisDetails({
                        ...anamnesisDetails,
                        addiction: { ...anamnesisDetails.addiction, usageAmount: e.target.value },
                      })
                    }
                    placeholder="مثال: روزی ۱ گرم"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 mb-2">سابقه ترک قبلی و روش‌ها:</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  value={anamnesisDetails.addiction.previousAttempts}
                  onChange={(e) =>
                    setAnamnesisDetails({
                      ...anamnesisDetails,
                      addiction: { ...anamnesisDetails.addiction, previousAttempts: e.target.value },
                    })
                  }
                  placeholder="آیا قبلاً اقدام به ترک کرده‌اید؟ چه روشی؟"
                />
              </div>
            </div>
          )}

          {/* فیلدهای اختصاصی یبوست */}
          {type === "constipation" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2">مدت ابتلا به بیماری:</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={anamnesisDetails.constipation.duration}
                    onChange={(e) =>
                      setAnamnesisDetails({
                        ...anamnesisDetails,
                        constipation: { ...anamnesisDetails.constipation, duration: e.target.value },
                      })
                    }
                    placeholder="مثال: ۳ ماه"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2">شدت سختی دفع:</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    value={anamnesisDetails.constipation.severity}
                    onChange={(e) =>
                      setAnamnesisDetails({
                        ...anamnesisDetails,
                        constipation: {
                          ...anamnesisDetails.constipation,
                          severity: e.target.value as "low" | "medium" | "high" | "",
                        },
                      })
                    }
                  >
                    <option value="">انتخاب کنید...</option>
                    <option value="low">خفیف (دفع نامنظم)</option>
                    <option value="medium">متوسط (نیاز به فشار زیاد)</option>
                    <option value="high">شدید (همراه با درد شدید)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 mb-2">علائم همراه (چند گزینه را می‌توانید انتخاب کنید):</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {["درد شکمی شدید", "خون در مدفوع", "نفخ شدید روده", "کاهش وزن ناگهانی"].map((symptom) => (
                    <label key={symptom} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={anamnesisDetails.constipation.associatedSymptoms.includes(symptom)}
                        onChange={() => handleCheckboxChange(symptom)}
                        className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500/20"
                      />
                      <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{symptom}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 mb-2">داروهای مصرفی فعلی:</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm h-20 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  value={anamnesisDetails.constipation.currentMedications}
                  onChange={(e) =>
                    setAnamnesisDetails({
                      ...anamnesisDetails,
                      constipation: { ...anamnesisDetails.constipation, currentMedications: e.target.value },
                    })
                  }
                  placeholder="داروهای ملین یا مسکن خاصی که مصرف می‌کنید..."
                />
              </div>
            </div>
          )}

          {/* فیلد شماره موبایل (مشترک) */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-black text-slate-600 mb-2">شماره تلفن همراه جهت هماهنگی و تماس پزشک:</label>
            <input
              type="tel"
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-left font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                phoneError ? "border-red-500" : "border-slate-200"
              }`}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (phoneError) validatePhone(e.target.value);
              }}
              placeholder="09123456789"
              dir="ltr"
            />
            {phoneError && (
              <div className="flex items-center gap-1.5 text-xs text-red-500 font-bold mt-2">
                <AlertCircle size={14} />
                <span>{phoneError}</span>
              </div>
            )}
          </div>

          <button
            disabled={loading}
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 transition-all"
          >
            {loading ? "در حال ثبت شرح حال..." : "ثبت و ارسال نهایی شرح حال"}
            <Send size={18} />
          </button>
        </div>
      )}

      {/* مرحله ۳: نمایش پیام موفقیت‌آمیز و کد پیگیری */}
      {step === 3 && submitted && (
        <div className="text-center py-10">
          <div className="flex justify-center mb-6 text-emerald-500">
            <CheckCircle2 size={72} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">شرح حال شما با موفقیت ثبت شد</h2>
          <p className="mt-4 text-slate-600 text-sm leading-relaxed">
            اطلاعات ارسالی شما برای پزشک متخصص ارسال گردید. پزشک پرونده را بررسی کرده و با شماره <span className="font-extrabold text-blue-600">{phone}</span> تماس خواهد گرفت.
          </p>
          {trackingCode && (
            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block">
              <span className="text-xs font-black text-slate-400 block mb-1">کد پیگیری درخواست شما:</span>
              <span className="text-lg font-black text-slate-800 tracking-widest">{trackingCode}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
