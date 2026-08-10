import React, { useState } from "react";
import { Wallet, Plus, Loader2 } from "lucide-react";
import { useDepositWallet } from "../../hooks/useWallet";

interface WalletBalanceCardProps {
  balance: number;
}

function formatCurrency(amount: number): string {
  // تبدیل اعداد به فارسی و سه‌رقم سه‌رقم جدا کردن
  return new Intl.NumberFormat("fa-IR").format(amount);
}

export default function WalletBalanceCard({ balance }: WalletBalanceCardProps) {
  const [amount, setAmount] = useState<string>("");
  const [showDepositForm, setShowDepositForm] = useState(false);
  const depositMutation = useDepositWallet();

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    try {
      await depositMutation.mutateAsync(numAmount);
      setAmount("");
      setShowDepositForm(false);
    } catch (error) {
      console.error("خطا در شارژ موجودی", error);
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
          onClick={() => setShowDepositForm(!showDepositForm)}
          className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs font-black backdrop-blur-sm transition hover:bg-white/30"
        >
          <Plus size={16} />
          شارژ سریع
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-3xl font-black">
          {formatCurrency(balance)} <span className="text-sm font-bold">تومان</span>
        </h2>
      </div>

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
                {depositMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "تایید"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
