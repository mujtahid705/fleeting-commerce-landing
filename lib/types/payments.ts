// Payment Types

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED";

export interface PaymentSubscription {
  id: string;
  plan: {
    id: string;
    name: string;
    price: number;
  };
}

export interface Payment {
  id: string;
  tenantId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  provider: string;
  transactionId: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt?: string;
  subscription?: PaymentSubscription;
}

export interface PaymentsState {
  payments: Payment[];
  selectedPayment: Payment | null;
  isLoading: boolean;
  error: string | null;
}

export interface PaymentInitData {
  paymentId: string;
  transactionId: string;
  amount: number;
  currency: string;
  planName: string;
  gatewayUrl?: string;
  sessionData?: Record<string, unknown>;
}
