import api from "../services/api";
import type { WalletData, Transaction } from "../types/wallet";

/**
 * دریافت موجودی و اطلاعات کیف پول کاربر فعلی
 * Endpoint: GET /api/v1/wallet/me
 */
export async function getWalletBalance(): Promise<WalletData> {
  const response = await api.get<WalletData>("/wallet/me");
  return response.data;
}

/**
 * دریافت لیست تراکنش‌های کیف پول
 * Endpoint: GET /api/v1/wallet/transactions
 */
export async function getWalletTransactions(): Promise<Transaction[]> {
  const response = await api.get<Transaction[]>("/wallet/transactions");
  return response.data;
}

/**
 * شارژ کیف پول
 * Endpoint: POST /api/v1/wallet/deposit
 */
export async function depositWallet(
  amount: number
): Promise<{ success: boolean; balance: string | number }> {
  const response = await api.post("/wallet/deposit", { amount });
  return response.data;
}
