import React, { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  PlusCircle,
  History,
  CreditCard,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  getWalletBalance,
  getWalletTransactions,
  initiatePayment,
} from "../../api/walletService";
import type { Transaction } from "../../types/wallet";

const MIN_DEPOSIT_TOMAN = 30000;

const formatToman = (value: number | string) => {
  const n = Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(n)) return "۰";
  return n.toLocaleString("fa-IR");
};

const WalletPage: React.FC = () => {
  const [balance, setBalance] = useState<string | number>("0");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<string>("saman");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [balanceData, transData] = await Promise.all([
        getWalletBalance(),
        getWalletTransactions(),
      ]);
      setBalance(balanceData?.balance ?? 0);
      setTransactions(Array.isArray(transData) ? transData : []);
    } catch (err) {
      console.error("Error fetching wallet data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const rawAmount = useMemo(() => {
    const numeric = Number(amount);
    return Number.isFinite(numeric) ? numeric : 0;
  }, [amount]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value);
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rawAmount < MIN_DEPOSIT_TOMAN) return;

    const amountInRials = rawAmount * 10;

    try {
      setIsSubmitting(true);
      const response: any = await initiatePayment(amountInRials);

      console.log("Payment initialization response:", response);

      // بررسی وجود لینک پرداخت در اشکال مختلف احتمالی
      const paymentUrl =
        response?.payment_url ||
        response?.url ||
        response?.paymentLink ||
        response?.data?.payment_url ||
        response?.data?.url ||
        null;

      // ۱. اگر لینک درگاه موجود بود، هدایت به درگاه بانکی
      if (paymentUrl && typeof paymentUrl === "string") {
        window.location.href = paymentUrl;
        return;
      }

      // ۲. اگر لینک نبود ولی پاسخ موفقیت‌آمیز مستقیم بود
      if (response?.success === true) {
        alert(
          `کیف پول با موفقیت شارژ شد.\nموجودی جدید: ${formatToman(
            response.balance ?? (Number(balance) + rawAmount)
          )} تومان`
        );
        setAmount("");
        // فراخوانی مجدد اطلاعات برای بروزرسانی UI
        await fetchData();
        return;
      }

      // ۳. در غیر این صورت پاسخ معتبر نیست
      throw new Error("پاسخ دریافتی از سرور معتبر یا حاوی لینک پرداخت نیست.");
    } catch (err: any) {
      console.error("Deposit execution error:", err);
      const serverMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "خطا در اتصال به درگاه و افزایش اعتبار";
      alert(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addQuickAmount = (value: number) => {
    setAmount((prev) => (Number(prev || 0) + value).toString());
  };

  const addThreeZeros = () => {
    if (!amount || rawAmount === 0) return;
    setAmount((prev) => (Number(prev) * 1000).toString());
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl p-4 sm:p-8" dir="rtl">
      <h1 className="mb-10 flex items-center gap-3 text-2xl font-black text-slate-800">
        <Wallet className="h-8 w-8 text-blue-600" />
        مدیریت موجودی و شارژ حساب
      </h1>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* بخش موجودی فعلی */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white shadow-xl shadow-blue-200">
            <div className="flex items-center justify-between opacity-80">
              <span className="text-sm font-bold">موجودی فعلی</span>
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black">{formatToman(balance)}</span>
              <span className="text-lg opacity-80">تومان</span>
            </div>
            <p className="mt-6 text-xs leading-relaxed opacity-70">
              این موجودی جهت رزرو نوبت و پرداخت‌های داخل برنامه استفاده می‌شود.
            </p>
          </div>

          {/* تاریخچه تراکنش‌ها */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-700">
              <History className="h-5 w-5 text-slate-400" />
              تراکنش‌های اخیر
            </h3>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">تراکُنشی یافت نشد.</p>
              ) : (
                transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between border-b border-slate-50 pb-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{tx.description || "شارژ حساب"}</span>
                      <span className="text-[10px] text-slate-400">{tx.created_at}</span>
                    </div>
                    <span className={`text-sm font-black ${Number(tx.amount) > 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatToman(tx.amount)} +
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* بخش افزایش اعتبار */}
        <div className="lg:col-span-7 rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-100/50">
          <h2 className="mb-8 flex items-center gap-3 text-xl font-black text-slate-800">
            <PlusCircle className="h-6 w-6 text-green-600" />
            افزایش اعتبار کیف پول
          </h2>

          <form onSubmit={handleDeposit} className="space-y-8">
            <div>
              <label className="mb-4 block text-sm font-bold text-slate-500">
                مبلغ مورد نظر برای افزایش اعتبار را انتخاب کنید (تومان)
              </label>

              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="مبلغ (مثال: ۵۰۰۰۰)"
                  className={`w-full rounded-2xl border-2 p-6 text-right text-2xl font-black transition-all focus:bg-white focus:outline-none ${
                    amount && rawAmount < MIN_DEPOSIT_TOMAN
                    ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500"
                    : "border-slate-100 bg-slate-50 text-slate-800 focus:border-blue-500"
                  }`}
                />

                {/* پیام محدودیت مبلغ */}
                <div className="mt-3 flex items-center gap-2">
                  {amount && rawAmount < MIN_DEPOSIT_TOMAN ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 animate-pulse">
                      <AlertCircle className="h-4 w-4" />
                      حداقل مبلغ شارژ ۳۰,۰۰۰ تومان می‌باشد.
                    </div>
                  ) : (
                    <div className="text-xs font-medium text-slate-400">
                      * حداقل مبلغ قابل شارژ: {MIN_DEPOSIT_TOMAN.toLocaleString("fa-IR")} تومان
                    </div>
                  )}
                </div>

                {rawAmount >= MIN_DEPOSIT_TOMAN && (
                   <div className="mt-2 text-sm font-black text-blue-600">
                     مبلغ نهایی: {rawAmount.toLocaleString("fa-IR")} تومان
                   </div>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  {[30000, 50000, 100000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => addQuickAmount(val)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      +{val.toLocaleString("fa-IR")}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={addThreeZeros}
                    className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-black transition-colors"
                  >
                    +۰۰۰
                  </button>
                </div>
              </div>
            </div>

            {/* انتخاب درگاه */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-500">انتخاب درگاه پرداخت:</label>
              <div className="grid grid-cols-1 gap-4">
                <label className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all ${selectedGateway === 'saman' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}>
                  <input type="radio" className="hidden" checked={selectedGateway === 'saman'} onChange={() => setSelectedGateway('saman')} />
                  <span className="font-bold text-slate-700">درگاه امن بانک سامان</span>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedGateway === 'saman' ? 'border-blue-500' : 'border-slate-300'}`}>
                    {selectedGateway === 'saman' && <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />}
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || rawAmount < MIN_DEPOSIT_TOMAN}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 text-lg font-black text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "تایید و پرداخت آنلاین"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
