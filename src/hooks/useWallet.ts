// Path: frontend/src/hooks/useWallet.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDoctorWalletBalance,
  getWalletBalance,
  getWalletTransactions,
  initiatePayment,
  topupDoctorWallet,
} from "../api/walletService";
import type { Transaction, WalletData } from "../types/wallet";

export type WalletRole = "patient" | "doctor";

/** دریافت موجودی کیف پول بر اساس نقش */
export function useWallet(role?: WalletRole) {
  return useQuery<WalletData, Error>({
    queryKey: ["wallet-balance", role],
    queryFn: () => {
      if (role === "doctor") {
        return getDoctorWalletBalance();
      }
      return getWalletBalance();
    },
    enabled: Boolean(role),
    staleTime: 5000, // زمان بیات شدن داده به ۵ ثانیه کاهش یافت تا حساسیت تغییرات بیشتر شود
  });
}

/** دریافت تراکنش‌های بیمار - فقط وقتی نقش بیمار باشد */
export function usePatientWalletTransactions(enabled: boolean = true) {
  return useQuery<Transaction[], Error>({
    queryKey: ["wallet-transactions", "patient"],
    queryFn: getWalletTransactions,
    enabled,
    staleTime: 5000,
  });
}

/** برای سازگاری با کدهای قدیمی */
export const useWalletTransactions = usePatientWalletTransactions;

/** شروع پرداخت بیمار و ابطال خودکار کش به محض موفقیت */
export function useDepositWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      return initiatePayment(amount);
    },
    onSuccess: (data) => {
      console.log("Deposit mutation succeeded, invalidating queries...", data);
      // تصحیح و اطمینان از پاک شدن کش هر دو بخش
      queryClient.invalidateQueries({ queryKey: ["wallet-balance", "patient"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions", "patient"] });
    },
  });
}

/** شارژ مستقیم کیف پول پزشک و ابطال خودکار کش */
export function useTopupDoctorWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      amount,
      referenceId,
      description,
    }: {
      amount: number;
      referenceId: string;
      description: string;
    }) => topupDoctorWallet(amount, referenceId, description),
    onSuccess: (data) => {
      console.log("Doctor topup succeeded, invalidating queries...", data);
      queryClient.invalidateQueries({ queryKey: ["wallet-balance", "doctor"] });
    },
  });
}
