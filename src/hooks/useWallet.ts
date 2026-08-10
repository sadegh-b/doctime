import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWalletBalance, getWalletTransactions, depositWallet } from "../api/walletService";
import type { WalletData, Transaction } from "../types/wallet";

export function useWallet() {
  return useQuery<WalletData, Error>({
    queryKey: ["wallet-balance"],
    queryFn: getWalletBalance,
    staleTime: 10 * 1000, // ۱۰ ثانیه معتبر بودن داده جهت جلوگیری از درخواست‌های مکرر
  });
}

export function useWalletTransactions() {
  return useQuery<Transaction[], Error>({
    queryKey: ["wallet-transactions"],
    queryFn: getWalletTransactions,
    staleTime: 30 * 1000,
  });
}

export function useDepositWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amount: number) => depositWallet(amount),
    onSuccess: () => {
      // بعد از شارژ موفق، اطلاعات موجودی و تراکنش‌ها بروزرسانی شوند
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
    },
  });
}
