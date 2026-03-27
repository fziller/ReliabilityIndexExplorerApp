import { useQuery } from '@tanstack/react-query';

import { apiClient } from './client';
import { CashflowResponse } from './types';

export const cashflowQueryKey = (userId: string, from: string, to: string) =>
  ['cashflow', userId, from, to] as const;

export async function fetchCashflow(userId: string, from: string, to: string) {
  const response = await apiClient.get<CashflowResponse>(`/api/users/${userId}/cashflow`, {
    params: { from, to },
  });

  return response.data;
}

export function useCashflowQuery(userId: string, from: string, to: string) {
  return useQuery({
    queryKey: cashflowQueryKey(userId, from, to),
    queryFn: () => fetchCashflow(userId, from, to),
    enabled: Boolean(userId && from && to),
    placeholderData: (previousData) => previousData,
  });
}
