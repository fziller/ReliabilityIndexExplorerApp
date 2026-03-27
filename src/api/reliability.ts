import { useQuery } from '@tanstack/react-query';

import { apiClient } from './client';
import { ReliabilityResponse } from './types';

export const reliabilityQueryKey = (userId: string, from: string) =>
  ['reliability', userId, from] as const;

export async function fetchReliability(userId: string, from: string) {
  const response = await apiClient.get<ReliabilityResponse>(
    `/api/users/${userId}/reliability`,
    {
      params: { from },
    },
  );

  return response.data;
}

export function useReliabilityQuery(userId: string, from: string) {
  return useQuery({
    queryKey: reliabilityQueryKey(userId, from),
    queryFn: () => fetchReliability(userId, from),
    enabled: Boolean(userId && from),
    placeholderData: (previousData) => previousData,
  });
}
