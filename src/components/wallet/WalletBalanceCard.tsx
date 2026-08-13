// Path: frontend/src/components/WalletBalanceCard.tsx
import React, { useState } from "react";
import { Wallet, Plus, Loader2 } from "lucide-react";
import { useDepositWallet } from "../hooks/useWallet";

interface WalletBalanceCardProps {
  balance: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fa-IR").format(amount);
}

/** استخراج لینک پرداخت از پاسخ، صرف‌نظر از نامِ فیلد */
function extractPaymentUrl(data: Record<string, any>): string | null {
  return (
    data.payment_url ??
    data.url ??
    data.paymentLink ??
    data.data?.payment_url ??
    data.data?.url ??
    data.data?.paymentLink ??
    null
  );
}

export default function WalletBalanceCard({ balance }: WalletBalanceCardProps) {
  const [amount, setAmount] = useState<string>("");
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [error, setError] = useState<string>("");
  const depositMutation = useDepositWallet();

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("مبلغ وارد شده معتبر نیست.");
      return;
    }
    if (numAmount < 10000) {
      setError("حداقل مبلغ شارژ ۱۰,۰۰۰ تومان است.");
      return;
    }

    try {
      const result = await depositMutation.mutateAsync(numAmount);

      // حالت A: درگاه redirect دارد → کاربر را می‌فرستیم
      const paymentUrl = extractPaymentUrl(result);
      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      // حالت B: شارژ مستقیم بود → فقط فرم را ببند
      setAmount("");
      setShowDepositForm(false);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "خطا در شروع پرداخت. دوباره تلاش کنید."
      );
    }
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-sky-600 to-cyan-500 p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet size={24} />
          <span className="text-sm font-bold opacity-90">موجودی کیف پول</span>
        </div>
        <button
          onClick={() => {
            setShowDepositForm((prev) => !prev);
            setError("");
          }}
          className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs font-black backdrop-blur-sm transition hover:bg-white/30"
        >
          <Plus size={16} />
          شارژ سریع
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-3xl font-black">
          {formatCurrency(balance)}{" "}
          <span className="text-sm font-bold">تومان</span>
        </h2>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-500/90 px-3 py-2 text-xs font-bold">
          {error}
        </div>
      )}

      {showDepositForm && (
        <form onSubmit={handleDepositSubmit} className="mt-5 border-t border-white/20 pt-4">
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold">مبلغ را به تومان وارد کنید:</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="مثلاً 50000"
                required
                className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder-white/50 border border-white/20 outline-none focus:border-white/50"
              />
              <button
                type="submit"
                disabled={depositMutation.isPending}
                className="flex items-center gap-1 rounded-xl bg-white px-4 py-2 text-sm font-black text-sky-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                {depositMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "تایید"
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
