export interface Transaction {
  id: string;
  orderId: string;
  orderNumber?: string;
  reference: string;
  amount: number;
  status: TransactionStatus;
  method?: string;
  gatewayResponse?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type TransactionStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "ABANDONED"
  | "REVERSED";
