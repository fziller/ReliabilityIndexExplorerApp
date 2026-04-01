import { Transaction } from "../api/types";

export function sortTransactions(items: Transaction[]) {
  return [...items].sort((left, right) => {
    if (left.date === right.date) {
      return right.id.localeCompare(left.id);
    }

    return right.date.localeCompare(left.date);
  });
}
