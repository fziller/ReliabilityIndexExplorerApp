import {
  formatPercent,
  formatRatio,
  formatScoreBand,
  normalizeCoverageRatio,
  pluralize,
} from "../format";

describe("formatPercent", () => {
  it("rounds values to whole percentages", () => {
    expect(formatPercent(0.456)).toBe("46%");
  });
});

describe("formatRatio", () => {
  it("formats ratios with two decimal places", () => {
    expect(formatRatio(1.234)).toBe("1.23x");
  });
});

describe("formatScoreBand", () => {
  it("normalizes score band casing", () => {
    expect(formatScoreBand("HIGH")).toBe("High");
    expect(formatScoreBand("mEdIuM")).toBe("Medium");
  });
});

describe("pluralize", () => {
  it("uses the singular form for one item", () => {
    expect(pluralize(1, "event")).toBe("1 event");
  });

  it("uses the default plural form for multiple items", () => {
    expect(pluralize(2, "event")).toBe("2 events");
  });

  it("supports a custom plural form", () => {
    expect(pluralize(2, "analysis", "analyses")).toBe("2 analyses");
  });
});

describe("normalizeCoverageRatio", () => {
  it("clamps ratios below zero to zero", () => {
    expect(normalizeCoverageRatio(-1)).toBe(0);
  });

  it("maps values into the 0 to 1 range", () => {
    expect(normalizeCoverageRatio(1)).toBe(0.5);
  });

  it("clamps ratios above the max to one", () => {
    expect(normalizeCoverageRatio(5)).toBe(1);
  });
});
