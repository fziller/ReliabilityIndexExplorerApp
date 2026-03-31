import { apiClient } from "./client";
import { ReliabilityResponse } from "./types";

export async function fetchReliability(userId: string, from: string) {
  const response = await apiClient.get<ReliabilityResponse>(
    `/api/users/${userId}/reliability`,
    {
      params: { from },
    },
  );

  return response.data;
}
