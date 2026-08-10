export type TransactionType = "deposit" | "withdrawal" | "transfer" | "refund";

export interface Transaction {
  id: number;
  amount: number;
  transaction_type: TransactionType | string;
  description: string | null;
  created_at: string;
}

export interface WalletData {
  balance: number;
  user_id: number;
}
