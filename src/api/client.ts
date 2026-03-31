import axios from "axios";
import { API_BASE_URL } from "../config/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
});

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const maybeMessage =
      typeof error.response?.data?.error === "string"
        ? error.response.data.error
        : error.message;

    return maybeMessage || "Request failed";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}
