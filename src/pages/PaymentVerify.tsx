import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Receipt } from "lucide-react";
import { verifyPayment } from "../api/walletService";
import type { PaymentVerifyResponse } from "../api/walletService";

const PaymentVerify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<PaymentVerifyResponse | null>(null);

  const authority = searchParams.get("Authority");
  const status = searchParams.get("Status");

  useEffect(() => {
    const verify = async () => {
      if (authority && status) {
        try {
          const response = await verifyPayment(authority, status);
          setResult(response);
        } catch (error) {
          console.error("Verification failed:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    verify();
  }, [authority, status]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4" dir="rtl">
      {/* افزایش عرض کادر به max-w-2xl و پدینگ به p-12 برای فضای بیشتر */}
      <div className="w-full max-w-2xl rounded-[2.5rem] bg-white p-10 md:p-14 shadow-2xl shadow-slate-200/60 border border-slate-100">
        {loading ? (
          <div className="flex flex-col items-center gap-6 py-12">
            <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
            <p className="text-xl font-bold text-slate-600">در حال تایید تراکنش از بانک...</p>
          </div>
        ) : result?.success ? (
          /* وضعیت موفقیت با فونت‌های درشت‌تر */
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <div className="rounded-full bg-green-50 p-6">
                <CheckCircle2 className="h-20 w-20 text-green-500" />
              </div>
            </div>
            <h1 className="mb-4 text-3xl font-black text-slate-900">پرداخت موفقیت‌آمیز بود</h1>
            <p className="mb-10 text-lg text-slate-500">مبلغ مورد نظر با موفقیت به کیف پول شما اضافه شد.</p>

            <div className="mb-10 space-y-5 rounded-3xl bg-slate-50 p-8">
              <div className="flex justify-between items-center text-base md:text-lg">
                <span className="text-slate-500">شماره پیگیری:</span>
                <span className="font-mono font-black text-slate-800">{result.tracking_code}</span>
              </div>
              <div className="flex justify-between items-center text-base md:text-lg">
                <span className="text-slate-500">مبلغ شارژ:</span>
                <span className="font-black text-green-600 text-2xl">
                  {Number(result.amount).toLocaleString("fa-IR")} <span className="text-sm">تومان</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/wallet")}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 text-xl font-black text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200"
            >
              <Receipt className="h-6 w-6" />
              مشاهده کیف پول
            </button>
          </div>
        ) : (
          /* وضعیت خطا با طراحی درشت */
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <div className="rounded-full bg-red-50 p-6">
                <XCircle className="h-20 w-20 text-red-500" />
              </div>
            </div>
            <h1 className="mb-4 text-3xl font-black text-slate-900">خطا در پرداخت</h1>
            <p className="mb-10 text-lg text-slate-500 leading-relaxed">
              {result?.message || "تراکنش توسط کاربر لغو شد یا مشکلی در شبکه بانکی پیش آمد."}
            </p>

            <button
              onClick={() => navigate("/wallet")}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 py-5 text-xl font-black text-white transition-all hover:bg-black"
            >
              <ArrowLeft className="h-6 w-6" />
              بازگشت و تلاش مجدد
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentVerify;
