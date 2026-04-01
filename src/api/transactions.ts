import { sortTransactions } from "../utils/transactions";
import { apiClient } from "./client";
import { Transaction } from "./types";

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
