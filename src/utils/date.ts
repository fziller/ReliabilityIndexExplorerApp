import {
  endOfMonth,
  format,
  isValid,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";

export interface AnalysisWindow {
  transactionFrom: string;
  transactionTo: string;
}

export function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return isValid(parseISO(value));
}

export function deriveAnalysisWindow(scoreFrom: string): AnalysisWindow {
  const parsed = parseISO(scoreFrom);

  if (!isValid(parsed)) {
    return {
      transactionFrom: "",
      transactionTo: "",
    };
  }

  return {
    transactionFrom: format(startOfMonth(subMonths(parsed, 5)), "yyyy-MM-dd"),
    transactionTo: format(endOfMonth(parsed), "yyyy-MM-dd"),
  };
}

export function formatMonthLabel(month: string) {
  const parsed = parseISO(`${month}-01`);

  if (!isValid(parsed)) {
    return month;
  }

  return format(parsed, "MMM");
}

export function formatDisplayDate(value: string) {
  const parsed = parseISO(value);

  if (!isValid(parsed)) {
    return value;
  }

  return format(parsed, "dd MMM yyyy");
}
