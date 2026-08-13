// Path: frontend/src/hooks/useWallet.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDoctorWalletBalance,
  getWalletBalance,
  getWalletTransactions,
  initiatePayment,
  topupDoctorWallet,
  verifyPayment,
} from "../api/walletService";
import type { Transaction, WalletData } from "../types/wallet";

export type WalletRole = "patient" | "doctor";

/** دریافت موجودی کیف پول بر اساس نقش */
export function useWallet(role?: WalletRole) {
  return useQuery<WalletData, Error>({
    queryKey: ["wallet-balance", role],
    queryFn: () =>
      role === "doctor" ? getDoctorWalletBalance() : getWalletBalance(),
    enabled: Boolean(role),
    staleTime: 5000,
  });
}

/** تراکنش‌های بیمار */
export function usePatientWalletTransactions(enabled: boolean = true) {
  return useQuery<Transaction[], Error>({
    queryKey: ["wallet-transactions", "patient"],
    queryFn: getWalletTransactions,
    enabled,
    staleTime: 5000,
  });
}

/** سازگاری با کدهای قدیمی */
export const useWalletTransactions = usePatientWalletTransactions;

/**
 * شروع پرداخت (فقط init) — اینجا کش را نباید ابطال کرد،
 * چون هنوز شارژ واقعی انجام نشده است.
 */
export function useDepositWallet() {
  return useMutation({
    mutationFn: (amount: number) => initiatePayment(amount),
  });
}

/**
 * تایید پرداخت بعد از بازگشت از درگاه.
 * درست اینجاست که کش کیف پول و تراکنش‌ها ابطال می‌شود.
 */
export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ authority, status }: { authority: string; status: string }) =>
      verifyPayment(authority, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance", "patient"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions", "patient"] });
    },
  });
}

/** شارژ مستقیم کیف پول پزشک */
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance", "doctor"] });
    },
  });
}
