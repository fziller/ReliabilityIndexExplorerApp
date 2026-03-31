export function buildMonthlyChartData(
  transactions: { date: string; amount: number }[] | undefined,
) {
  const monthlyMap = new Map<
    string,
    { month: string; income: number; expenses: number }
  >();

  for (const transaction of transactions ?? []) {
    const month = transaction.date.slice(0, 7);
    const existing = monthlyMap.get(month) ?? { month, income: 0, expenses: 0 };

    if (transaction.amount >= 0) {
      existing.income += transaction.amount;
    } else {
      existing.expenses += Math.abs(transaction.amount);
    }

    monthlyMap.set(month, existing);
  }

  return [...monthlyMap.values()].sort((left, right) =>
    left.month.localeCompare(right.month),
  );
}
