import { PageQuery } from './api';

export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'PARTIALLY_REFUNDED' | 'REFUNDED';

export interface Payment {
  id: number;
  subscriptionId: number;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  refundedAmount: number;
  createdAt: string;
}

export interface CreatePaymentRequest {
  subscriptionId: number;
  amount: string;
  currency: string;
  method: PaymentMethod;
  idempotencyKey: string;
}

export interface PaymentQuery extends PageQuery {}