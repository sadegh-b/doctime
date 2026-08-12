// Path: frontend/src/api/walletService.ts

import api from "../services/api";
import type { WalletData, Transaction } from "../types/wallet";

/** پاسخ تایید تراکنش */
export interface PaymentVerifyResponse {
  success: boolean;
  message: string;
  amount: number;
  tracking_code: string;
}

/** پاسخ اولیه پرداخت/شارژ */
export interface PaymentInitResponse {
  success?: boolean;
  payment_url?: string;
  url?: string;
  paymentLink?: string;
  authority?: string;
  message?: string;
  balance?: string | number;
  new_balance?: string | number;
  data?: {
    payment_url?: string;
    url?: string;
    paymentLink?: string;
    authority?: string;
    message?: string;
  };
}

/** پاسخ شارژ یا واریز */
export interface DepositResponse {
  success: boolean;
  balance?: string | number;
  new_balance?: string | number;
  message?: string;
}

/* ==========================================================================
   Patient Wallet APIs
   ========================================================================== */

export async function getWalletBalance(): Promise<WalletData> {
  const response = await api.get<WalletData>("/wallet/me");
  return response.data;
}

export async function getWalletTransactions(): Promise<Transaction[]> {
  const response = await api.get<Transaction[]>("/wallet/transactions");
  return response.data;
}

export async function initiatePayment(amount: number): Promise<PaymentInitResponse> {
  const response = await api.post<PaymentInitResponse>("/wallet/deposit", {
    amount,
    description: "شارژ کیف پول داک‌تایم",
  });
  return response.data;
}

export async function verifyPayment(
  authority: string,
  status: string
): Promise<PaymentVerifyResponse> {
  const response = await api.get<PaymentVerifyResponse>("/wallet/verify", {
    params: {
      authority,
      Status: status,
    },
  });
  return response.data;
}

/** alias برای سازگاری با نسخه‌های قدیمی */
export async function depositWallet(amount: number): Promise<PaymentInitResponse> {
  return initiatePayment(amount);
}

/* ==========================================================================
   Doctor Wallet APIs
   ========================================================================== */

export async function getDoctorWalletBalance(): Promise<WalletData> {
  const response = await api.get<WalletData>("/doctor-wallet/balance");
  return response.data;
}

export async function topupDoctorWallet(
  amount: number,
  referenceId: string,
  description: string
): Promise<DepositResponse> {
  const response = await api.post<DepositResponse>("/doctor-wallet/topup", {
    amount,
    reference_id: referenceId,
    description,
  });
  return response.data;
}
