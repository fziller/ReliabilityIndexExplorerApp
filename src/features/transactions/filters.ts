import { Transaction } from '../../api/types';
import { sortTransactions } from '../../api/transactions';

export type TransactionDirection = 'ALL' | 'POSITIVE' | 'NEGATIVE';
export type TransactionSort = 'DATE_DESC' | 'DATE_ASC' | 'AMOUNT_DESC' | 'AMOUNT_ASC';

export interface TransactionFilters {
  category: string;
  direction: TransactionDirection;
  merchantSearch: string;
  sort: TransactionSort;
}

export const defaultTransactionFilters: TransactionFilters = {
  category: 'ALL',
  direction: 'ALL',
  merchantSearch: '',
  sort: 'DATE_DESC',
};

export function getCategories(transactions: Transaction[]) {
  return ['ALL', ...new Set(transactions.map((transaction) => transaction.category).sort())];
}

export function filterAndSortTransactions(
  transactions: Transaction[],
  filters: TransactionFilters,
) {
  const search = filters.merchantSearch.trim().toLowerCase();

  let next = transactions.filter((transaction) => {
    const categoryMatch =
      filters.category === 'ALL' || transaction.category === filters.category;
    const directionMatch =
      filters.direction === 'ALL' ||
      (filters.direction === 'POSITIVE'
        ? transaction.amount >= 0
        : transaction.amount < 0);
    const searchMatch =
      search.length === 0 || transaction.merchant.toLowerCase().includes(search);

    return categoryMatch && directionMatch && searchMatch;
  });

  switch (filters.sort) {
    case 'DATE_ASC':
      next = [...sortTransactions(next)].reverse();
      break;
    case 'AMOUNT_DESC':
      next = [...next].sort((left, right) => right.amount - left.amount);
      break;
    case 'AMOUNT_ASC':
      next = [...next].sort((left, right) => left.amount - right.amount);
      break;
    case 'DATE_DESC':
    default:
      next = sortTransactions(next);
  }

  return next;
}
