import {
  deriveAnalysisWindow,
  formatDisplayDate,
  formatMonthLabel,
  isIsoDate,
} from "../date";

describe("isIsoDate", () => {
  it("accepts valid ISO dates", () => {
    expect(isIsoDate("2026-02-20")).toBe(true);
    expect(isIsoDate("2024-02-29")).toBe(true);
  });

  it("rejects invalid or non-ISO-like dates", () => {
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2026-2-20")).toBe(false);
    expect(isIsoDate("20-02-2026")).toBe(false);
    expect(isIsoDate("not-a-date")).toBe(false);
  });
});

describe("deriveAnalysisWindow", () => {
  it("returns the anchor date as from and one year minus one day as to", () => {
    expect(deriveAnalysisWindow("2026-02-20")).toEqual({
      transactionFrom: "2026-02-20",
      transactionTo: "2027-02-19",
    });
  });

  it("handles leap year anchors correctly", () => {
    expect(deriveAnalysisWindow("2024-02-29")).toEqual({
      transactionFrom: "2024-02-29",
      transactionTo: "2025-02-27",
    });
  });

  it("returns empty bounds for invalid dates", () => {
    expect(deriveAnalysisWindow("invalid-date")).toEqual({
      transactionFrom: "",
      transactionTo: "",
    });
  });
});

describe("formatMonthLabel", () => {
  it("formats valid month values to abbreviated month names", () => {
    expect(formatMonthLabel("2026-03")).toBe("Mar");
  });

  it("returns the original value for invalid month inputs", () => {
    expect(formatMonthLabel("invalid-month")).toBe("invalid-month");
  });
});

describe("formatDisplayDate", () => {
  it("formats valid dates for display", () => {
    expect(formatDisplayDate("2026-03-15")).toBe("15 Mar 2026");
  });

  it("returns the original value for invalid dates", () => {
    expect(formatDisplayDate("not-a-date")).toBe("not-a-date");
  });
});
