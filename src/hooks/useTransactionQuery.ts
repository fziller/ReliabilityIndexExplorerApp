import { useQuery } from "@tanstack/react-query";
import { fetchTransactions } from "../api/transactions";

export const transactionsQueryKey = (
  userId: string,
  from: string,
  to: string,
) => ["transactions", userId, from, to] as const;

export function useTransactionsQuery(userId: string, from: string, to: string) {
  return useQuery({
    queryKey: transactionsQueryKey(userId, from, to),
    queryFn: () => fetchTransactions(userId, from, to),
    enabled: Boolean(userId && from && to),
    placeholderData: (previousData) => previousData,
  });
}
