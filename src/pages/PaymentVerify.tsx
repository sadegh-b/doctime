// Path: frontend/src/pages/PaymentVerify.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  Receipt,
} from "lucide-react";
import { verifyPayment } from "../api/walletService";
import type { PaymentVerifyResponse } from "../api/walletService";

type ViewState = "loading" | "success" | "error";

export default function PaymentVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<PaymentVerifyResponse | null>(null);
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const authority =
    searchParams.get("Authority") ?? searchParams.get("authority") ?? "";
  const status =
    searchParams.get("Status") ?? searchParams.get("status") ?? "";

  const canVerify = useMemo(() => {
    return Boolean(authority && status);
  }, [authority, status]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!canVerify) {
        if (!mounted) return;
        setViewState("error");
        setErrorMessage("پارامترهای پرداخت ناقص هستند.");
        setLoading(false);
        return;
      }

      try {
        const response = await verifyPayment(authority, status);

        if (!mounted) return;

        setResult(response);

        if (response.success) {
          setViewState("success");
        } else {
          setViewState("error");
          setErrorMessage(response.message || "پرداخت ناموفق بود.");
        }
      } catch (error: unknown) {
        if (!mounted) return;

        setViewState("error");
        setErrorMessage(
          error instanceof Error && error.message
            ? error.message
            : "خطا در تایید پرداخت."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [authority, status, canVerify]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-2xl rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-2xl shadow-slate-200/60 md:p-14">
        {loading || viewState === "loading" ? (
          <div className="flex flex-col items-center gap-6 py-12">
            <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
            <p className="text-xl font-bold text-slate-600">
              در حال تایید تراکنش از بانک...
            </p>
          </div>
        ) : viewState === "success" ? (
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <div className="rounded-full bg-green-50 p-6">
                <CheckCircle2 className="h-20 w-20 text-green-500" />
              </div>
            </div>

            <h1 className="mb-4 text-3xl font-black text-slate-900">
              پرداخت موفقیت‌آمیز بود
            </h1>

            <p className="mb-10 text-lg text-slate-500">
              مبلغ مورد نظر با موفقیت به کیف پول شما اضافه شد.
            </p>

            <div className="mb-10 space-y-5 rounded-3xl bg-slate-50 p-8">
              <div className="flex items-center justify-between text-base md:text-lg">
                <span className="text-slate-500">شماره پیگیری:</span>
                <span className="font-mono font-black text-slate-800">
                  {result?.tracking_code || "-"}
                </span>
              </div>

              <div className="flex items-center justify-between text-base md:text-lg">
                <span className="text-slate-500">مبلغ شارژ:</span>
                <span className="text-2xl font-black text-green-600">
                  {typeof result?.amount === "number"
                    ? Number(result.amount).toLocaleString("fa-IR")
                    : "-"}{" "}
                  <span className="text-sm">تومان</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/wallet", { replace: true })}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 text-xl font-black text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200"
            >
              <Receipt className="h-6 w-6" />
              مشاهده کیف پول
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <div className="rounded-full bg-red-50 p-6">
                <XCircle className="h-20 w-20 text-red-500" />
              </div>
            </div>

            <h1 className="mb-4 text-3xl font-black text-slate-900">
              خطا در پرداخت
            </h1>

            <p className="mb-10 text-lg leading-relaxed text-slate-500">
              {errorMessage ||
                result?.message ||
                "تراکنش توسط کاربر لغو شد یا مشکلی در شبکه بانکی پیش آمد."}
            </p>

            <button
              onClick={() => navigate("/wallet", { replace: true })}
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
}
