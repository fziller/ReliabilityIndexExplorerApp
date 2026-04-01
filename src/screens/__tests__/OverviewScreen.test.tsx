import React from "react";
import { fireEvent, screen } from "@testing-library/react-native";
import { renderWithProviders } from "../../test/render";
import { OverviewScreen } from "../OverviewScreen";

const mockUseReliabilityQuery = jest.fn();
const mockUseTransactionsQuery = jest.fn();

const mockQueryControlsCard = jest.fn(() => null);
const mockCashflowChartCard = jest.fn(() => null);
const mockExplanationCard = jest.fn(() => null);
const mockMetricCard = jest.fn(() => null);
const mockReliabilityScoreCard = jest.fn(() => null);
const mockScoreBreakdownCard = jest.fn(() => null);
const mockLoadingStateCard = jest.fn(({ title }: { title: string }) =>
  React.createElement("Text", null, title),
);
const mockEmptyStateCard = jest.fn(({ title }: { title: string }) =>
  React.createElement("Text", null, title),
);
const mockErrorStateCard = jest.fn(
  ({
    title,
    message,
    actionLabel,
    onAction,
  }: {
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  }) =>
    React.createElement(
      React.Fragment,
      null,
      React.createElement("Text", null, title),
      React.createElement("Text", null, message),
      actionLabel
        ? React.createElement("Text", { onPress: onAction }, actionLabel)
        : null,
    ),
);

jest.mock("../../hooks/useReliabilityQuery", () => ({
  useReliabilityQuery: (...args: unknown[]) => mockUseReliabilityQuery(...args),
}));

jest.mock("../../hooks/useTransactionQuery", () => ({
  useTransactionsQuery: (...args: unknown[]) =>
    mockUseTransactionsQuery(...args),
}));

jest.mock("../../api/client", () => ({
  getErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : "Something went wrong",
}));

jest.mock("../../components/QueryControlsCard", () => ({
  QueryControlsCard: (props: unknown, context: unknown) =>
    (mockQueryControlsCard as jest.Mock)(props, context),
}));

jest.mock("../../components/CashflowChartCard", () => ({
  CashflowChartCard: (props: unknown, context: unknown) =>
    (mockCashflowChartCard as jest.Mock)(props, context),
}));

jest.mock("../../components/ExplanationCard", () => ({
  ExplanationCard: (props: unknown, context: unknown) =>
    (mockExplanationCard as jest.Mock)(props, context),
}));

jest.mock("../../components/MetricCard", () => ({
  MetricCard: (props: unknown, context: unknown) =>
    (mockMetricCard as jest.Mock)(props, context),
}));

jest.mock("../../components/ReliabilityScoreCard", () => ({
  __esModule: true,
  default: (props: unknown, context: unknown) =>
    (mockReliabilityScoreCard as jest.Mock)(props, context),
}));

jest.mock("../../components/ScoreBreakdownCard", () => ({
  ScoreBreakdownCard: (props: unknown, context: unknown) =>
    (mockScoreBreakdownCard as jest.Mock)(props, context),
}));

jest.mock("../../components/StateCards/LoadingStateCard", () => ({
  __esModule: true,
  default: (props: unknown, context: unknown) =>
    (mockLoadingStateCard as jest.Mock)(props, context),
}));

jest.mock("../../components/StateCards/EmptyStateCard", () => ({
  __esModule: true,
  default: (props: unknown, context: unknown) =>
    (mockEmptyStateCard as jest.Mock)(props, context),
}));

jest.mock("../../components/StateCards/ErrorStateCard", () => ({
  __esModule: true,
  default: (props: unknown, context: unknown) =>
    (mockErrorStateCard as jest.Mock)(props, context),
}));

function createReliabilityQuery(overrides: Record<string, unknown> = {}) {
  return {
    data: undefined,
    error: null,
    isError: false,
    isLoading: false,
    refetch: jest.fn(),
    ...overrides,
  };
}

function createTransactionsQuery(overrides: Record<string, unknown> = {}) {
  return {
    data: undefined,
    error: null,
    isError: false,
    isLoading: false,
    refetch: jest.fn(),
    ...overrides,
  };
}

describe("OverviewScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // mockUseReliabilityQuery.mockReset();
    // mockUseTransactionsQuery.mockReset();
    // mockQueryControlsCard.mockClear();
    // mockCashflowChartCard.mockClear();
    // mockExplanationCard.mockClear();
    // mockMetricCard.mockClear();
    // mockReliabilityScoreCard.mockClear();
    // mockScoreBreakdownCard.mockClear();
    // mockLoadingStateCard.mockClear();
    // mockEmptyStateCard.mockClear();
    // mockErrorStateCard.mockClear();
  });

  it("shows both loading states when reliability and monthly activity are loading", () => {
    mockUseReliabilityQuery.mockReturnValue(
      createReliabilityQuery({ isLoading: true }),
    );
    mockUseTransactionsQuery.mockReturnValue(
      createTransactionsQuery({ isLoading: true }),
    );

    renderWithProviders(<OverviewScreen />);

    expect(mockLoadingStateCard).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        title: "Loading reliability snapshot",
        message: "Pulling score, metrics and drivers from the mock API.",
      }),
      undefined,
    );
    expect(mockLoadingStateCard).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        title: "Loading monthly activity",
        message:
          "Monthly income and expense totals are being derived from transactions.",
      }),
      undefined,
    );
  });

  it("renders reliability errors and retries the reliability query", () => {
    const refetch = jest.fn();

    mockUseReliabilityQuery.mockReturnValue(
      createReliabilityQuery({
        isError: true,
        error: new Error("Reliability API down"),
        refetch,
      }),
    );
    mockUseTransactionsQuery.mockReturnValue(
      createTransactionsQuery({ data: [] }),
    );

    renderWithProviders(<OverviewScreen />);

    expect(mockErrorStateCard).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Could not load reliability",
        message: "Reliability API down",
        actionLabel: "Retry",
      }),
      undefined,
    );

    fireEvent.press(screen.getByText("Retry"));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders the success path with derived props for score, metrics, risks, and chart", () => {
    mockUseReliabilityQuery.mockReturnValue(
      createReliabilityQuery({
        data: {
          reliability_index: 72,
          score_band: "HIGH",
          currency: "EUR",
          metrics: {
            income_regularity: 0.92,
            income_coverage_ratio: 0.8,
            essential_payments_consistency: 0.75,
            good_months: 4,
            negative_balance_days: 2,
            late_fee_events: 1,
          },
          drivers: ["Salary came on time", "Stable rent payments"],
        },
      }),
    );
    mockUseTransactionsQuery.mockReturnValue(
      createTransactionsQuery({
        data: [
          { id: "txn_1", date: "2026-01-01", amount: 1000 },
          { id: "txn_2", date: "2026-01-04", amount: -300 },
          { id: "txn_3", date: "2026-02-01", amount: 900 },
        ],
      }),
    );

    renderWithProviders(<OverviewScreen />);

    expect(mockReliabilityScoreCard).toHaveBeenCalledWith(
      expect.objectContaining({
        reliabilityIndex: 72,
        scoreBand: "HIGH",
      }),
      undefined,
    );

    expect(mockMetricCard).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "Income regularity",
        value: "92%",
        supporting: "Consistency of recurring income.",
      }),
      undefined,
    );
    expect(mockMetricCard).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "Coverage ratio",
        value: "0.80x",
        supporting: "Income versus essentials.",
      }),
      undefined,
    );
    expect(mockMetricCard).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "Good months",
        value: "4/6",
        supporting: "Healthy months in the scoring window.",
      }),
      undefined,
    );

    expect(mockScoreBreakdownCard).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [
          {
            label: "Income Regularity",
            value: 0.92,
            display: "92%",
          },
          {
            label: "Income Coverage Ratio",
            value: 0.4,
            display: "0.80x",
          },
          {
            label: "Essential Payment Consistency",
            value: 0.75,
            display: "75%",
          },
          {
            label: "Resilience / Outcome",
            value: 0.72,
            display: "72/100",
          },
        ],
      }),
      undefined,
    );

    expect(mockExplanationCard).toHaveBeenCalledWith(
      expect.objectContaining({
        positives: ["Salary came on time", "Stable rent payments"],
        risks: [
          "2 negative balance days",
          "1 late fee event",
          "Only 4/6 stable months",
          "Income coverage ratio below 1.0",
        ],
      }),
      undefined,
    );

    expect(mockCashflowChartCard).toHaveBeenCalledWith(
      expect.objectContaining({
        currency: "EUR",
        months: [
          { month: "2026-01", income: 1000, expenses: 300 },
          { month: "2026-02", income: 900, expenses: 0 },
        ],
      }),
      undefined,
    );
  });

  it("shows no monthly activity when the transaction query has no chartable data", () => {
    mockUseReliabilityQuery.mockReturnValue(
      createReliabilityQuery({
        data: {
          reliability_index: 55,
          score_band: "MEDIUM",
          currency: "EUR",
          metrics: {
            income_regularity: 0.7,
            income_coverage_ratio: 1.4,
            essential_payments_consistency: 0.8,
            good_months: 6,
            negative_balance_days: 0,
            late_fee_events: 0,
          },
          drivers: ["Stable essentials"],
        },
      }),
    );
    mockUseTransactionsQuery.mockReturnValue(
      createTransactionsQuery({ data: [] }),
    );

    renderWithProviders(<OverviewScreen />);

    expect(mockEmptyStateCard).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "No monthly activity",
        message:
          "This user has no transactions in the current analysis window.",
      }),
      undefined,
    );
  });

  it("pull-to-refresh refetches both queries", () => {
    const reliabilityRefetch = jest.fn();
    const transactionsRefetch = jest.fn();

    mockUseReliabilityQuery.mockReturnValue(
      createReliabilityQuery({
        data: {
          reliability_index: 60,
          score_band: "MEDIUM",
          currency: "EUR",
          metrics: {
            income_regularity: 0.8,
            income_coverage_ratio: 1.1,
            essential_payments_consistency: 0.85,
            good_months: 6,
            negative_balance_days: 0,
            late_fee_events: 0,
          },
          drivers: ["Steady paychecks"],
        },
        refetch: reliabilityRefetch,
      }),
    );
    mockUseTransactionsQuery.mockReturnValue(
      createTransactionsQuery({
        data: [{ id: "txn_1", date: "2026-01-01", amount: 1000 }],
        refetch: transactionsRefetch,
      }),
    );

    renderWithProviders(<OverviewScreen />);
    const scrollView = screen.getByTestId("overview-scroll-view");
    const refreshControl = scrollView.props.refreshControl;

    refreshControl.props.onRefresh();

    expect(reliabilityRefetch).toHaveBeenCalledTimes(1);
    expect(transactionsRefetch).toHaveBeenCalledTimes(1);
  });
});
