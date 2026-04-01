import { act, fireEvent, screen } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { renderWithProviders } from "../../test/render";
import { TransactionsScreen } from "../TransactionsScreen";

const mockUseTransactionsQuery = jest.fn();
const mockQueryControlsCard = jest.fn(() => null);
const mockTransactionRow = jest.fn(
  ({ item }: { item: { id: string; merchant: string } }) =>
    React.createElement(Text, null, `Row ${item.id} ${item.merchant}`),
);
const mockLoadingStateCard = jest.fn(({ title }: { title: string }) =>
  React.createElement(Text, null, title),
);
const mockEmptyStateCard = jest.fn(({ title }: { title: string }) =>
  React.createElement(Text, null, title),
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
      React.createElement(Text, null, title),
      React.createElement(Text, null, message),
      actionLabel
        ? React.createElement(Text, { onPress: onAction }, actionLabel)
        : null,
    ),
);
const mockTransactionFiltersCard = jest.fn(() => null);

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

jest.mock("../../components/TransactionRow", () => ({
  TransactionRow: (props: unknown, context: unknown) =>
    (mockTransactionRow as jest.Mock)(props, context),
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

jest.mock("../../components/TransactionFiltersCard", () => ({
  TransactionFiltersCard: (props: unknown, context: unknown) =>
    (mockTransactionFiltersCard as jest.Mock)(props, context),
}));

jest.mock("@shopify/flash-list", () => ({
  FlashList: ({
    data,
    ListHeaderComponent,
    renderItem,
  }: {
    data: Array<{ id: string }>;
    ListHeaderComponent: React.ReactNode;
    renderItem: ({ item }: { item: any }) => React.ReactNode;
  }) => {
    const React = require("react");
    const { View } = require("react-native");

    return React.createElement(
      View,
      null,
      ListHeaderComponent,
      ...data.map((item) =>
        React.createElement(View, { key: item.id }, renderItem({ item })),
      ),
    );
  },
}));

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

const transactions = [
  {
    id: "txn_100",
    date: "2026-03-04",
    amount: -25,
    merchant: "Coffee Club",
    category: "Food",
    account: "Main",
    balance: 975,
  },
  {
    id: "txn_101",
    date: "2026-03-05",
    amount: 2500,
    merchant: "Acme Payroll",
    category: "Income",
    account: "Main",
    balance: 3475,
  },
  {
    id: "txn_102",
    date: "2026-03-05",
    amount: -80,
    merchant: "Power Grid",
    category: "Bills",
    account: "Main",
    balance: 3395,
  },
];

interface TransactionFiltersCardMockProps {
  filters: {
    category: string;
    direction: string;
    merchantSearch: string;
    sort: string;
  };
  categories: string[];
  resultCount: number;
  onFiltersChange: (next: {
    category: string;
    direction: string;
    merchantSearch: string;
    sort: string;
  }) => void;
}

function getLatestFilterProps(): TransactionFiltersCardMockProps {
  const lastCall = (mockTransactionFiltersCard as jest.Mock).mock.calls.at(-1);

  if (!lastCall) {
    throw new Error("TransactionFiltersCard was not called");
  }

  return lastCall[0] as TransactionFiltersCardMockProps;
}

describe("TransactionsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows the loading state while transactions are still loading", () => {
    mockUseTransactionsQuery.mockReturnValue(
      createTransactionsQuery({ isLoading: true }),
    );

    renderWithProviders(<TransactionsScreen />);

    expect(mockLoadingStateCard).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Loading transactions",
        message:
          "Fetching and sorting the raw ledger for the current analysis window.",
      }),
      undefined,
    );
  });

  it("renders transaction errors and retries the query", () => {
    const refetch = jest.fn();
    mockUseTransactionsQuery.mockReturnValue(
      createTransactionsQuery({
        isError: true,
        error: new Error("Transactions API down"),
        refetch,
      }),
    );

    renderWithProviders(<TransactionsScreen />);

    expect(mockErrorStateCard).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Could not load transactions",
        message: "Transactions API down",
        actionLabel: "Retry",
      }),
      undefined,
    );

    fireEvent.press(screen.getByText("Retry"));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders the default success state and the current transaction window", () => {
    mockUseTransactionsQuery.mockReturnValue(
      createTransactionsQuery({ data: transactions }),
    );

    renderWithProviders(<TransactionsScreen />);

    expect(
      screen.getByText("Transaction window: 2026-02-20 to 2027-02-19"),
    ).toBeOnTheScreen();
    expect(mockTransactionFiltersCard).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: {
          category: "ALL",
          direction: "ALL",
          merchantSearch: "",
          sort: "DATE_DESC",
        },
        categories: ["ALL", "Bills", "Food", "Income"],
        resultCount: 3,
      }),
      undefined,
    );
    expect(screen.getByText("Row txn_102 Power Grid")).toBeOnTheScreen();
    expect(screen.getByText("Row txn_101 Acme Payroll")).toBeOnTheScreen();
    expect(screen.getByText("Row txn_100 Coffee Club")).toBeOnTheScreen();
  });

  it("shows an empty state when there are no transactions", () => {
    mockUseTransactionsQuery.mockReturnValue(
      createTransactionsQuery({ data: [] }),
    );

    renderWithProviders(<TransactionsScreen />);

    expect(mockEmptyStateCard).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "No transactions",
        message: "There are no transactions in the current analysis window.",
      }),
      undefined,
    );
  });

  it("updates visible rows when merchant, direction, and category filters change", () => {
    mockUseTransactionsQuery.mockReturnValue(
      createTransactionsQuery({ data: transactions }),
    );

    renderWithProviders(<TransactionsScreen />);

    const initialProps = getLatestFilterProps();
    act(() => {
      initialProps.onFiltersChange({
        ...initialProps.filters,
        merchantSearch: "power",
      });
    });
    expect(
      screen.queryByText("Row txn_101 Acme Payroll"),
    ).not.toBeOnTheScreen();
    expect(screen.queryByText("Row txn_100 Coffee Club")).not.toBeOnTheScreen();
    expect(screen.getByText("Row txn_102 Power Grid")).toBeOnTheScreen();

    const merchantProps = getLatestFilterProps();
    expect(merchantProps.resultCount).toBe(1);
    act(() => {
      merchantProps.onFiltersChange({
        ...merchantProps.filters,
        direction: "NEGATIVE",
      });
    });

    const negativeProps = getLatestFilterProps();
    act(() => {
      negativeProps.onFiltersChange({
        ...negativeProps.filters,
        category: "Income",
      });
    });
    expect(mockEmptyStateCard).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Filters removed everything",
        message: "Try a different category, search term or direction.",
      }),
      undefined,
    );
  });

  it("shows the filtered empty state when filters remove all visible transactions", () => {
    mockUseTransactionsQuery.mockReturnValue(
      createTransactionsQuery({ data: transactions }),
    );

    renderWithProviders(<TransactionsScreen />);

    const initialProps = getLatestFilterProps();
    act(() => {
      initialProps.onFiltersChange({
        ...initialProps.filters,
        merchantSearch: "zzz-no-match",
      });
    });

    expect(mockEmptyStateCard).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Filters removed everything",
        message: "Try a different category, search term or direction.",
      }),
      undefined,
    );
  });

  it("updates the visible row order when the sort changes", () => {
    mockUseTransactionsQuery.mockReturnValue(
      createTransactionsQuery({ data: transactions }),
    );

    renderWithProviders(<TransactionsScreen />);

    const initialProps = getLatestFilterProps();
    act(() => {
      initialProps.onFiltersChange({
        ...initialProps.filters,
        sort: "AMOUNT_ASC",
      });
    });

    const rows = screen.getAllByText(/Row txn_/);
    expect(rows[0]).toHaveTextContent("Row txn_102 Power Grid");
    expect(rows[1]).toHaveTextContent("Row txn_100 Coffee Club");
    expect(rows[2]).toHaveTextContent("Row txn_101 Acme Payroll");
  });

  it("refreshes the query from the refresh button", () => {
    const refetch = jest.fn();
    mockUseTransactionsQuery.mockReturnValue(
      createTransactionsQuery({ data: transactions, refetch }),
    );

    renderWithProviders(<TransactionsScreen />);

    fireEvent.press(screen.getByText("Refresh"));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
