export function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function formatRatio(value: number) {
  return `${value.toFixed(2)}x`;
}

export function formatScoreBand(scoreBand: string) {
  return scoreBand.charAt(0).toUpperCase() + scoreBand.slice(1).toLowerCase();
}

export function pluralize(
  value: number,
  singular: string,
  plural = `${singular}s`,
) {
  return `${value} ${value === 1 ? singular : plural}`;
}

export function normalizeCoverageRatio(value: number) {
  return Math.max(0, Math.min(value / 2, 1));
}
