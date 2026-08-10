import { useWallet, useWalletTransactions } from "../../hooks/useWallet";
import WalletBalanceCard from "../../components/wallet/WalletBalanceCard";
import TransactionList from "../../components/wallet/TransactionList";
import { CreditCard, History, AlertCircle } from "lucide-react";

export default function Wallet() {
  const { data: wallet, isLoading: isWalletLoading, isError: isWalletError } = useWallet();
  const { data: transactions = [], isLoading: isTxLoading } = useWalletTransactions();

  if (isWalletLoading || isTxLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-black text-slate-600" dir="rtl">
        در حال بارگذاری اطلاعات مالی...
      </div>
    );
  }

  if (isWalletError || !wallet) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-5 text-center" dir="rtl">
        <AlertCircle size={40} className="text-red-500" />
        <h2 className="mt-4 text-lg font-black text-slate-800">خطا در بارگذاری کیف پول</h2>
        <p className="mt-2 text-sm text-slate-500">لطفاً اتصال اینترنت خود را بررسی کرده و مجدداً تلاش کنید.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8" dir="rtl">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-sky-600">
            <CreditCard size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">کیف پول من</h1>
            <p className="text-xs font-bold text-slate-400">مدیریت موجودی و سابقه تراکنش‌ها</p>
          </div>
        </header>

        <section>
          <WalletBalanceCard balance={wallet.balance} />
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800">
            <History size={18} />
            <h3 className="text-sm font-black">تاریخچه آخرین تراکنش‌ها</h3>
          </div>
          <TransactionList transactions={transactions} />
        </section>
      </div>
    </main>
  );
}
