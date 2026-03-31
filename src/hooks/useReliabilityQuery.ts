import { useQuery } from "@tanstack/react-query";
import { fetchReliability } from "../api/reliability";

export const reliabilityQueryKey = (userId: string, from: string) =>
  ["reliability", userId, from] as const;

export function useReliabilityQuery(userId: string, from: string) {
  return useQuery({
    queryKey: reliabilityQueryKey(userId, from),
    queryFn: () => fetchReliability(userId, from),
    enabled: Boolean(userId && from),
    placeholderData: (previousData) => previousData,
  });
}
