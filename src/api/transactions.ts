import { apiClient } from "./client";
import { Transaction } from "./types";

export function sortTransactions(items: Transaction[]) {
  return [...items].sort((left, right) => {
    if (left.date === right.date) {
      return right.id.localeCompare(left.id);
    }

    return right.date.localeCompare(left.date);
  });
}

export async function fetchTransactions(
  userId: string,
  from: string,
  to: string,
) {
  const response = await apiClient.get<Transaction[]>(
    `/api/users/${userId}/transactions`,
    {
      params: { from, to },
    },
  );

  return sortTransactions(response.data);
}
