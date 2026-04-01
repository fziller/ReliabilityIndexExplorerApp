import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import EventSource from "react-native-sse";
import { Transaction, TransactionEvent } from "../../api/types";
import { API_BASE_URL } from "../../config/api";
import { useExplorerParams } from "../../context/ExplorerParamsContext";
import { reliabilityQueryKey } from "../../hooks/useReliabilityQuery";
import { transactionsQueryKey } from "../../hooks/useTransactionQuery";
import { sortTransactions } from "../../utils/transactions";

function isWithinWindow(date: string, from: string, to: string) {
  return date >= from && date <= to;
}

export function applyTransactionEvent(
  currentTransactions: Transaction[] | undefined,
  transactionEvent: TransactionEvent,
  transactionFrom: string,
  transactionTo: string,
) {
  const existingTransactions = currentTransactions ?? [];

  switch (transactionEvent.type) {
    case "TRANSACTION_ADDED": {
      if (
        !isWithinWindow(
          transactionEvent.transaction.date,
          transactionFrom,
          transactionTo,
        )
      ) {
        return existingTransactions;
      }

      const withoutExisting = existingTransactions.filter(
        (transaction) => transaction.id !== transactionEvent.transaction.id,
      );

      return sortTransactions([
        ...withoutExisting,
        transactionEvent.transaction,
      ]);
    }
    case "TRANSACTION_UPDATED": {
      const updatedTransactions = existingTransactions
        .map((transaction) =>
          transaction.id === transactionEvent.transaction_id
            ? {
                ...transaction,
                ...transactionEvent,
                id: transaction.id,
              }
            : transaction,
        )
        .filter((transaction) =>
          isWithinWindow(transaction.date, transactionFrom, transactionTo),
        );

      return sortTransactions(updatedTransactions);
    }
    case "TRANSACTION_DELETED":
      return existingTransactions.filter(
        (transaction) => transaction.id !== transactionEvent.transaction_id,
      );
    default:
      return existingTransactions;
  }
}

export function LiveTransactionSync() {
  const queryClient = useQueryClient();
  const { userId, scoreFrom, transactionFrom, transactionTo } =
    useExplorerParams();
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", setAppState);

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    // Stop here, if app is active or we do not have the necessary data set.
    if (
      appState !== "active" ||
      !userId ||
      !transactionFrom ||
      !transactionTo
    ) {
      return;
    }

    // Backend sends connected and transaction event. We only care about transaction events for now.
    const eventSource = new EventSource<"connected" | "transaction">(
      `${API_BASE_URL}/api/users/${userId}/transaction-events`,
      {
        headers: {
          Accept: "text/event-stream",
        },
        timeout: 0,
        pollingInterval: 5_000,
      },
    );

    const onTransactionEvent = (event: { data: string | null }) => {
      if (!event.data) {
        return;
      }

      try {
        const parsed = JSON.parse(event.data) as TransactionEvent;

        queryClient.setQueryData<Transaction[]>(
          transactionsQueryKey(userId, transactionFrom, transactionTo),
          (current) =>
            applyTransactionEvent(
              current,
              parsed,
              transactionFrom,
              transactionTo,
            ),
        );

        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
        }

        // Make sure that we get the latest data from the server also for the other endpoints, if an event is received successfully.
        reconnectTimerRef.current = setTimeout(() => {
          void queryClient.invalidateQueries({
            queryKey: transactionsQueryKey(
              userId,
              transactionFrom,
              transactionTo,
            ),
          });

          void queryClient.invalidateQueries({
            queryKey: reliabilityQueryKey(userId, scoreFrom),
          });
        }, 300);
      } catch {
        // Ignore malformed payloads but keep the stream alive.
      }
    };

    eventSource.addEventListener("transaction", onTransactionEvent);

    return () => {
      eventSource.removeAllEventListeners();
      eventSource.close();

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, [
    appState,
    queryClient,
    scoreFrom,
    transactionFrom,
    transactionTo,
    userId,
  ]);

  // render nothing
  return null;
}
