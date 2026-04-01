import { buildMonthlyChartData } from "../reliability";

describe("buildMonthlyChartData", () => {
  it("returns an empty array for undefined input", () => {
    expect(buildMonthlyChartData(undefined)).toEqual([]);
  });

  it("returns an empty array for an empty transaction list", () => {
    expect(buildMonthlyChartData([])).toEqual([]);
  });

  it("groups transactions by month and sorts months ascending", () => {
    expect(
      buildMonthlyChartData([
        { date: "2026-03-15", amount: -20 },
        { date: "2026-01-05", amount: 1000 },
        { date: "2026-02-02", amount: -50 },
        { date: "2026-01-20", amount: -100 },
      ]),
    ).toEqual([
      { month: "2026-01", income: 1000, expenses: 100 },
      { month: "2026-02", income: 0, expenses: 50 },
      { month: "2026-03", income: 0, expenses: 20 },
    ]);
  });

  it("adds positive amounts to income and negative amounts to absolute expenses", () => {
    expect(
      buildMonthlyChartData([
        { date: "2026-04-01", amount: 2500 },
        { date: "2026-04-10", amount: -250 },
        { date: "2026-04-11", amount: -10.5 },
        { date: "2026-04-12", amount: 0 },
      ]),
    ).toEqual([{ month: "2026-04", income: 2500, expenses: 260.5 }]);
  });
});
