export interface ReliabilityMetrics {
  income_regularity: number;
  income_coverage_ratio: number;
  essential_payments_consistency: number;
  good_months: number;
  negative_balance_days: number;
  late_fee_events: number;
}

export interface ReliabilityResponse {
  user_id: string;
  from: string;
  currency: string;
  reliability_index: number;
  score_band: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  metrics: ReliabilityMetrics;
  drivers: string[];
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  merchant: string;
  category: string;
  account: string;
  balance: number;
}

export interface CashflowMonth {
  month: string;
  income: number;
  essential_expenses: number;
}

export interface CashflowResponse {
  user_id: string;
  from: string;
  to: string;
  months: CashflowMonth[];
}

export type TransactionAddedEvent = {
  type: 'TRANSACTION_ADDED';
  transaction: Transaction;
};

export type TransactionUpdatedEvent = {
  type: 'TRANSACTION_UPDATED';
  transaction_id: string;
  date?: string;
  amount?: number;
  merchant?: string;
  category?: string;
  account?: string;
  balance?: number;
};

export type TransactionDeletedEvent = {
  type: 'TRANSACTION_DELETED';
  transaction_id: string;
};

export type TransactionEvent =
  | TransactionAddedEvent
  | TransactionUpdatedEvent
  | TransactionDeletedEvent;
