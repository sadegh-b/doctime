// مسیر فایل: src/pages/Profile.tsx

import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/user";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // دریافت اطلاعات پروفایل از سرور با مدیریت خطاها
  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const data = await getProfile();
      setProfile(data);
      setFullName(data.full_name || "");
      setEmail(data.email || "");
    } catch (err: any) {
      console.error("خطا در بارگذاری پروفایل:", err);
      setError("خطا در دریافت اطلاعات کاربری. لطفاً اتصال خود را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  }

  // اعتبارسنجی فرم و ارسال تغییرات به سرور
  async function saveChanges() {
    // حذف فاصله‌های خالی ابتدا و انتها
    const cleanEmail = email.trim();
    const cleanFullName = fullName.trim();

    if (!cleanFullName) {
      alert("لطفاً نام و نام خانوادگی خود را وارد کنید.");
      return;
    }

    // بررسی ساختار ایمیل در صورت وارد شدن (چون ایمیل اختیاری است اما فرمت آن باید درست باشد)
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      alert("لطفاً یک ایمیل معتبر وارد کنید.");
      return;
    }

    try {
      setSaving(true);
      const updated = await updateProfile({
        full_name: cleanFullName,
        email: cleanEmail,
      });

      setProfile(updated);
      alert("تغییرات با موفقیت ذخیره شد.");
    } catch (err: any) {
      console.error("خطا در ذخیره تغییرات:", err);
      alert(err?.response?.data?.detail || "خطا در ذخیره اطلاعات. مجدداً تلاش کنید.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50" dir="rtl">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-slate-600 font-medium">در حال بارگذاری اطلاعات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 max-w-xl mx-auto text-center" dir="rtl">
        <p className="text-red-500 font-bold mb-4">{error}</p>
        <button
          onClick={loadData}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4" dir="rtl">
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h1 className="text-2xl font-black text-slate-800 mb-8 pb-4 border-b border-slate-100">
          ویرایش اطلاعات پروفایل
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">نام و نام خانوادگی</label>
            <input
              type="text"
              placeholder="مثال: صادق بلوچ"
              className="w-full border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-800"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">ایمیل (اختیاری)</label>
            <input
              type="email"
              placeholder="example@domain.com"
              className="w-full border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-left text-slate-800"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            onClick={saveChanges}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl transition duration-200 shadow-lg shadow-blue-100 disabled:shadow-none"
          >
            {saving ? "در حال ذخیره‌سازی..." : "ذخیره تغییرات"}
          </button>
        </div>
      </div>
    </div>
  );
}
