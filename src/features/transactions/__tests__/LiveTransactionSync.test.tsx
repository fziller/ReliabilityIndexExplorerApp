import { act, render } from "@testing-library/react-native";
import React from "react";
import { AppState } from "react-native";
import {
  LiveTransactionSync,
  applyTransactionEvent,
} from "../LiveTransactionSync";

const mockUseExplorerParams = jest.fn();
const mockUseQueryClient = jest.fn();
const mockEventSourceInstances: Array<{
  url: string;
  options: Record<string, unknown>;
  listeners: Map<string, (event: { data: string | null }) => void>;
  removeAllEventListeners: jest.Mock;
  close: jest.Mock;
  emit: (eventName: string, event: { data: string | null }) => void;
}> = [];
const mockReliabilityQueryKey = (userId: string, from: string) =>
  ["reliability", userId, from] as const;
const mockTransactionsQueryKey = (userId: string, from: string, to: string) =>
  ["transactions", userId, from, to] as const;

jest.mock("react-native-sse", () => {
  return class MockEventSource {
    url;
    options;
    listeners = new Map();
    removeAllEventListeners = jest.fn();
    close = jest.fn();

    constructor(url: any, options: any) {
      this.url = url;
      this.options = options;
      mockEventSourceInstances.push(this);
    }

    addEventListener(eventName: any, listener: any) {
      this.listeners.set(eventName, listener);
    }

    emit(eventName: any, event: any) {
      const listener = this.listeners.get(eventName);

      if (listener) {
        listener(event);
      }
    }
  };
});

jest.mock("../../../hooks/useReliabilityQuery", () => ({
  reliabilityQueryKey: (userId: string, from: string) =>
    mockReliabilityQueryKey(userId, from),
}));

jest.mock("../../../hooks/useTransactionQuery", () => ({
  transactionsQueryKey: (userId: string, from: string, to: string) =>
    mockTransactionsQueryKey(userId, from, to),
}));

jest.mock("../../../context/ExplorerParamsContext", () => ({
  useExplorerParams: () => mockUseExplorerParams(),
}));

jest.mock("@tanstack/react-query", () => {
  const actual = jest.requireActual("@tanstack/react-query");

  return {
    ...actual,
    useQueryClient: () => mockUseQueryClient(),
  };
});

const baseTransactions = [
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
];

describe("applyTransactionEvent", () => {
  it("adds transactions inside the window and keeps them sorted", () => {
    const result = applyTransactionEvent(
      baseTransactions,
      {
        type: "TRANSACTION_ADDED",
        transaction: {
          id: "txn_102",
          date: "2026-03-06",
          amount: -80,
          merchant: "Power Grid",
          category: "Bills",
          account: "Main",
          balance: 3395,
        },
      },
      "2026-03-01",
      "2026-03-31",
    );

    expect(result.map((transaction) => transaction.id)).toEqual([
      "txn_102",
      "txn_101",
      "txn_100",
    ]);
  });

  it("ignores added transactions outside the current window", () => {
    const result = applyTransactionEvent(
      baseTransactions,
      {
        type: "TRANSACTION_ADDED",
        transaction: {
          id: "txn_102",
          date: "2026-04-01",
          amount: -80,
          merchant: "Power Grid",
          category: "Bills",
          account: "Main",
          balance: 3395,
        },
      },
      "2026-03-01",
      "2026-03-31",
    );

    expect(result).toEqual(baseTransactions);
  });

  it("replaces an existing transaction with the same id instead of duplicating it", () => {
    const result = applyTransactionEvent(
      baseTransactions,
      {
        type: "TRANSACTION_ADDED",
        transaction: {
          id: "txn_101",
          date: "2026-03-06",
          amount: 2600,
          merchant: "Acme Payroll Updated",
          category: "Income",
          account: "Main",
          balance: 3575,
        },
      },
      "2026-03-01",
      "2026-03-31",
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(
      expect.objectContaining({
        id: "txn_101",
        merchant: "Acme Payroll Updated",
        amount: 2600,
      }),
    );
  });

  it("merges transaction updates and keeps the original id", () => {
    const result = applyTransactionEvent(
      baseTransactions,
      {
        type: "TRANSACTION_UPDATED",
        transaction_id: "txn_100",
        merchant: "Coffee Deluxe",
        amount: -30,
      },
      "2026-03-01",
      "2026-03-31",
    );

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "txn_100",
          merchant: "Coffee Deluxe",
          amount: -30,
        }),
      ]),
    );
  });

  it("removes updated transactions that move outside the current window", () => {
    const result = applyTransactionEvent(
      baseTransactions,
      {
        type: "TRANSACTION_UPDATED",
        transaction_id: "txn_100",
        date: "2026-04-01",
      },
      "2026-03-01",
      "2026-03-31",
    );

    expect(result.map((transaction) => transaction.id)).toEqual(["txn_101"]);
  });

  it("removes deleted transactions", () => {
    const result = applyTransactionEvent(
      baseTransactions,
      {
        type: "TRANSACTION_DELETED",
        transaction_id: "txn_100",
      },
      "2026-03-01",
      "2026-03-31",
    );

    expect(result.map((transaction) => transaction.id)).toEqual(["txn_101"]);
  });
});

describe("LiveTransactionSync", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockEventSourceInstances.length = 0;
    mockUseExplorerParams.mockReset();
    mockUseQueryClient.mockReset();
    Object.defineProperty(AppState, "currentState", {
      configurable: true,
      value: "active",
    });
    jest
      .spyOn(AppState, "addEventListener")
      .mockImplementation((_type, _listener) => ({
        remove: jest.fn(),
      }));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("starts the SSE stream only when the app is active and params are present", () => {
    const queryClient = {
      setQueryData: jest.fn(),
      invalidateQueries: jest.fn(),
    };
    mockUseQueryClient.mockReturnValue(queryClient);
    mockUseExplorerParams.mockReturnValue({
      userId: "user_123",
      scoreFrom: "2026-02-20",
      transactionFrom: "2026-02-20",
      transactionTo: "2027-02-19",
    });

    const { unmount } = render(<LiveTransactionSync />);

    expect(mockEventSourceInstances).toHaveLength(1);
    expect(mockEventSourceInstances[0].url).toBe(
      "http://127.0.0.1:3004/api/users/user_123/transaction-events",
    );
    expect(mockEventSourceInstances[0].options).toEqual({
      headers: { Accept: "text/event-stream" },
      timeout: 0,
      pollingInterval: 5000,
    });

    unmount();
  });

  it("does not start the SSE stream when required params are missing", () => {
    mockUseQueryClient.mockReturnValue({
      setQueryData: jest.fn(),
      invalidateQueries: jest.fn(),
    });
    mockUseExplorerParams.mockReturnValue({
      userId: "",
      scoreFrom: "2026-02-20",
      transactionFrom: "2026-02-20",
      transactionTo: "2027-02-19",
    });

    render(<LiveTransactionSync />);

    expect(mockEventSourceInstances).toHaveLength(0);
  });

  it("applies incoming transaction events to the query cache and invalidates related queries", () => {
    let currentTransactions = baseTransactions;
    const queryClient = {
      setQueryData: jest.fn(
        (
          _queryKey: readonly unknown[],
          updater: (
            current: typeof baseTransactions | undefined,
          ) => typeof baseTransactions,
        ) => {
          currentTransactions = updater(currentTransactions);
        },
      ),
      invalidateQueries: jest.fn(),
    };

    mockUseQueryClient.mockReturnValue(queryClient);
    mockUseExplorerParams.mockReturnValue({
      userId: "user_123",
      scoreFrom: "2026-02-20",
      transactionFrom: "2026-03-01",
      transactionTo: "2026-03-31",
    });

    render(<LiveTransactionSync />);

    act(() => {
      mockEventSourceInstances[0].emit("transaction", {
        data: JSON.stringify({
          type: "TRANSACTION_ADDED",
          transaction: {
            id: "txn_102",
            date: "2026-03-06",
            amount: -80,
            merchant: "Power Grid",
            category: "Bills",
            account: "Main",
            balance: 3395,
          },
        }),
      });
    });

    expect(queryClient.setQueryData).toHaveBeenCalledWith(
      mockTransactionsQueryKey("user_123", "2026-03-01", "2026-03-31"),
      expect.any(Function),
    );
    expect(currentTransactions.map((transaction) => transaction.id)).toEqual([
      "txn_102",
      "txn_101",
      "txn_100",
    ]);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: mockTransactionsQueryKey(
        "user_123",
        "2026-03-01",
        "2026-03-31",
      ),
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: mockReliabilityQueryKey("user_123", "2026-02-20"),
    });
  });

  it("ignores malformed event payloads without mutating the cache", () => {
    const queryClient = {
      setQueryData: jest.fn(),
      invalidateQueries: jest.fn(),
    };

    mockUseQueryClient.mockReturnValue(queryClient);
    mockUseExplorerParams.mockReturnValue({
      userId: "user_123",
      scoreFrom: "2026-02-20",
      transactionFrom: "2026-03-01",
      transactionTo: "2026-03-31",
    });

    render(<LiveTransactionSync />);

    act(() => {
      mockEventSourceInstances[0].emit("transaction", {
        data: "{bad json",
      });
    });

    expect(queryClient.setQueryData).not.toHaveBeenCalled();
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
  });

  it("cleans up app state subscription, timers, and event source on unmount", () => {
    const remove = jest.fn();
    jest
      .spyOn(AppState, "addEventListener")
      .mockReturnValue({ remove } as never);
    const queryClient = {
      setQueryData: jest.fn(),
      invalidateQueries: jest.fn(),
    };

    mockUseQueryClient.mockReturnValue(queryClient);
    mockUseExplorerParams.mockReturnValue({
      userId: "user_123",
      scoreFrom: "2026-02-20",
      transactionFrom: "2026-03-01",
      transactionTo: "2026-03-31",
    });

    const { unmount } = render(<LiveTransactionSync />);

    act(() => {
      mockEventSourceInstances[0].emit("transaction", {
        data: JSON.stringify({
          type: "TRANSACTION_DELETED",
          transaction_id: "txn_100",
        }),
      });
    });

    unmount();

    expect(remove).toHaveBeenCalledTimes(1);
    expect(
      mockEventSourceInstances[0].removeAllEventListeners,
    ).toHaveBeenCalledTimes(1);
    expect(mockEventSourceInstances[0].close).toHaveBeenCalledTimes(1);
  });
});
