import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { Transaction } from "../../types/wallet";

interface TransactionListProps {
  transactions: Transaction[];
}

function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fa-IR").format(amount);
}

function formatDate(isoString: string): string {
  if (!isoString) return "تاریخ نامشخص";
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  } catch {
    return "تاریخ نامشخص";
  }
}

export default function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center text-sm font-bold text-slate-500 shadow-sm border border-slate-100">
        هنوز هیچ تراکنشی ثبت نشده است.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => {
        const isDeposit = tx.transaction_type === "deposit" || tx.transaction_type === "refund";
        return (
          <div
            key={tx.id}
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  isDeposit ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                }`}
              >
                {isDeposit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">
                  {tx.description || (isDeposit ? "افزایش موجودی" : "برداشت وجه")}
                </p>
                <p className="mt-1 text-[11px] font-bold text-slate-400">
                  {formatDate(tx.created_at)}
                </p>
              </div>
            </div>
            <div className="text-left">
              <span className={`text-sm font-black ${isDeposit ? "text-green-600" : "text-red-600"}`}>
                {isDeposit ? "+" : "-"} {formatCurrency(Math.abs(tx.amount))}
              </span>
              <span className="mr-1 text-[10px] font-bold text-slate-400">تومان</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
