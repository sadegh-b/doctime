import { useMemo, useState } from "react";
import { useWallet, useTopupDoctorWallet } from "../../hooks/useWallet";

export default function DoctorWallet() {
  const { data, isLoading, isError, error, refetch } = useWallet("doctor");
  const topupMutation = useTopupDoctorWallet();

  const [amount, setAmount] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [description, setDescription] = useState("شارژ مستقیم کیف پول پزشک");

  const balance = useMemo(() => {
    const raw = data as Record<string, unknown> | undefined;
    const value =
      raw?.balance ??
      raw?.current_balance ??
      raw?.available_balance ??
      raw?.wallet_balance ??
      0;

    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }, [data]);

  const currency = useMemo(() => {
    const raw = data as Record<string, unknown> | undefined;
    return String(raw?.currency ?? "تومان");
  }, [data]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    if (!referenceId.trim()) {
      return;
    }

    await topupMutation.mutateAsync({
      amount: parsedAmount,
      referenceId: referenceId.trim(),
      description: description.trim() || "شارژ مستقیم کیف پول پزشک",
    });

    setAmount("");
    setReferenceId("");
    setDescription("شارژ مستقیم کیف پول پزشک");
    refetch();
  };

  const quickAmounts = [100000, 200000, 500000, 1000000];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">کیف پول پزشک</h1>
        <p className="mt-2 text-sm text-slate-600">
          موجودی، شارژ مستقیم، و مدیریت پرداخت‌ها برای حساب پزشک.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="text-sm text-slate-500">موجودی فعلی</div>
              <div className="mt-1 text-3xl font-bold text-slate-900">
                {isLoading ? "در حال دریافت..." : `${balance.toLocaleString("fa-IR")} ${currency}`}
              </div>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              بروزرسانی
            </button>
          </div>

          {isError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error?.message || "خطا در دریافت موجودی کیف پول پزشک"}
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs text-slate-500">وضعیت اتصال</div>
              <div className="mt-1 font-semibold text-slate-900">فعال</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs text-slate-500">نوع حساب</div>
              <div className="mt-1 font-semibold text-slate-900">Doctor Wallet</div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">شارژ مستقیم کیف پول</h2>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                مبلغ
              </label>
              <input
                type="number"
                min="1"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="مثلاً 500000"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAmount(String(value))}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  {value.toLocaleString("fa-IR")}
                </button>
              ))}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                شناسه مرجع
              </label>
              <input
                type="text"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="شماره پیگیری / reference id"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                توضیحات
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={topupMutation.isPending}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {topupMutation.isPending ? "در حال ثبت..." : "ثبت شارژ"}
            </button>

            {topupMutation.isSuccess && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                شارژ با موفقیت ثبت شد.
              </div>
            )}

            {topupMutation.isError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {topupMutation.error?.message || "ثبت شارژ ناموفق بود."}
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
