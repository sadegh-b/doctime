// Path: frontend/src/pages/WalletPage.tsx

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  useWallet,
  usePatientWalletTransactions,
  useDepositWallet,
  useTopupDoctorWallet,
} from "../hooks/useWallet";
import { Wallet, ArrowUpCircle, History, CheckCircle2, AlertCircle, CreditCard } from "lucide-react";

/**
 * استخراج هوشمند لینک پرداخت از خروجی بک‌اند
 */
function extractPaymentUrl(result: any): string | null {
  if (!result) return null;
  const potentialPaths = [
    result.payment_url, result.url, result.paymentLink,
    result.data?.payment_url, result.data?.url
  ];
  return potentialPaths.find(p => typeof p === "string" && p.trim().length > 0) || null;
}

export default function WalletPage() {
  const { role } = useAuth();
  const [amount, setAmount] = useState<string>("");

  // استفاده از هوک‌های مربوطه با پاس دادن نقش صحیح
  const { data: wallet, isLoading: walletLoading, isError: walletError } = useWallet(role || undefined);
  const isPatient = role === "patient";
  const isDoctor = role === "doctor";

  const { data: transactions, isLoading: transactionsLoading } = usePatientWalletTransactions(isPatient);

  const depositMutation = useDepositWallet();
  const topupDoctorMutation = useTopupDoctorWallet();

  const quickAmounts = [30000, 50000, 100000, 500000];

  const handleAction = async (customAmount?: number) => {
    const finalAmount = customAmount || Number(amount);

    if (!Number.isFinite(finalAmount) || finalAmount < 30000) {
      alert("حداقل مبلغ جهت شارژ ۳۰،۰۰۰ تومان می‌باشد.");
      return;
    }

    try {
      let result;
      if (isDoctor) {
        result = await topupDoctorMutation.mutateAsync({
          amount: finalAmount,
          referenceId: `REF-${Date.now()}`,
          description: "شارژ مستقیم پنل پزشک"
        });
      } else {
        result = await depositMutation.mutateAsync(finalAmount);
      }

      console.log("Mutation Executed Successfully, Result:", result);

      // ۱. اگر لینک درگاه پرداخت وجود دارد هدایت شود
      const paymentUrl = extractPaymentUrl(result);
      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      // ۲. در صورت شارژ مستقیم و موفقیت‌آمیز
      if (result && (result.success === true || result.status === 'ok')) {
        alert(`کیف پول با موفقیت شارژ شد.\nموجودی جدید: ${Number(result.balance).toLocaleString("fa-IR")} تومان`);
        setAmount("");
      }
    } catch (error: any) {
      console.error("Payment Execution Error:", error);
      alert(error?.response?.data?.message || "بروز خطا در پردازش عملیات مالی.");
    }
  };

  if (walletLoading) {
    return <div className="p-10 text-center font-black text-blue-600">در حال دریافت اطلاعات مالی از سرور...</div>;
  }

  if (walletError) {
    return <div className="p-10 text-center text-red-500 font-black">خطا در اتصال به سرویس مالی داک‌تایم!</div>;
  }

  const safeBalance = Number(wallet?.balance ?? 0);
  const isActionPending = depositMutation.isPending || topupDoctorMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">

        {/* هدر صفحه */}
        <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-10 text-white text-center">
          <Wallet className="mx-auto mb-4 w-16 h-16 text-blue-200" />
          <h1 className="text-3xl font-black mb-2 text-white">مدیریت موجودی و شارژ حساب</h1>
          <p className="text-blue-100 opacity-80 text-white">این موجودی جهت رزرو نوبت و پرداخت‌های داخل برنامه استفاده می‌شود.</p>
        </div>

        <div className="p-8">
          {/* باکس موجودی فعلی */}
          <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100 flex flex-col md:flex-row items-center justify-between mb-10">
            <div>
              <span className="text-blue-600 font-bold block mb-2 text-lg">موجودی فعلی:</span>
              <span className="text-5xl font-black text-slate-900">
                {safeBalance.toLocaleString("fa-IR")}
                <span className="text-xl font-bold text-slate-400 mr-3 text-slate-400">تومان</span>
              </span>
            </div>
            <div className="mt-6 md:mt-0">
               <CreditCard size={48} className="text-blue-300" />
            </div>
          </div>

          {/* فرم افزایش اعتبار */}
          <div className="mb-12 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <ArrowUpCircle className="text-emerald-500" />
              افزایش اعتبار کیف پول
            </h3>

            <div className="flex flex-col gap-6">
              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="مبلغ مورد نظر (تومان)..."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 px-5 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none font-bold text-xl transition-all text-black bg-white"
                />
                <button
                  onClick={() => handleAction()}
                  disabled={isActionPending}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isActionPending ? "منتظر بمانید..." : "تایید و پرداخت آنلاین"}
                </button>
              </div>

              {/* دکمه‌های مقادیر پیش‌فرض */}
              <div className="flex flex-wrap gap-3">
                {quickAmounts.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAction(val)}
                    className="px-5 py-2 rounded-full border-2 border-slate-200 bg-white text-slate-700 font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
                  >
                    +{val.toLocaleString("fa-IR")} تومان
                  </button>
                ))}
              </div>
              <p className="text-sm text-slate-500 font-medium">* حداقل مبلغ قابل شارژ: ۳۰,۰۰۰ تومان</p>
            </div>
          </div>

          {/* لیست تراکنش‌های اخیر */}
          <div>
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <History size={24} className="text-blue-600" />
              تراکنش‌های اخیر
            </h3>
            <div className="space-y-3">
              {transactionsLoading ? (
                <div className="text-center py-10 text-slate-400 font-bold">در حال بارگذاری لیست تراکنش‌ها...</div>
              ) : transactions && transactions.length > 0 ? (
                transactions.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${t.type === "deposit" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                        {t.type === "deposit" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg text-black">{t.description || "شارژ کیف پول"}</p>
                        <span className="text-sm text-slate-400 font-medium block mt-1" dir="ltr">
                          {t.created_at ? new Date(t.created_at).toLocaleString('fa-IR') : "---"}
                        </span>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className={`text-xl font-black ${t.type === "deposit" ? "text-emerald-600" : "text-red-600"}`}>
                        {t.type === "deposit" ? "+" : "-"} {Number(t.amount).toLocaleString("fa-IR")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-slate-400 font-bold italic">تراکنشی یافت نشد.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
