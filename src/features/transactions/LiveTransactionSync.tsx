import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import EventSource from 'react-native-sse';

import { cashflowQueryKey } from '../../api/cashflow';
import { reliabilityQueryKey } from '../../api/reliability';
import { sortTransactions, transactionsQueryKey } from '../../api/transactions';
import { Transaction, TransactionEvent } from '../../api/types';
import { API_BASE_URL } from '../../config/api';
import { useExplorerParams } from '../../context/ExplorerParamsContext';

function applyTransactionEvent(
  currentTransactions: Transaction[] | undefined,
  transactionEvent: TransactionEvent,
) {
  const existingTransactions = currentTransactions ?? [];

  switch (transactionEvent.type) {
    case 'TRANSACTION_ADDED': {
      const withoutExisting = existingTransactions.filter(
        (transaction) => transaction.id !== transactionEvent.transaction.id,
      );

      return sortTransactions([...withoutExisting, transactionEvent.transaction]);
    }
    case 'TRANSACTION_UPDATED': {
      return sortTransactions(
        existingTransactions.map((transaction) =>
          transaction.id === transactionEvent.transaction_id
            ? {
                ...transaction,
                ...transactionEvent,
                id: transaction.id,
              }
            : transaction,
        ),
      );
    }
    case 'TRANSACTION_DELETED':
      return existingTransactions.filter(
        (transaction) => transaction.id !== transactionEvent.transaction_id,
      );
    default:
      return existingTransactions;
  }
}

export function LiveTransactionSync() {
  const queryClient = useQueryClient();
  const { userId, scoreFrom, transactionFrom, transactionTo } = useExplorerParams();
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (appState !== 'active' || !userId || !transactionFrom || !transactionTo) {
      return;
    }

    const eventSource = new EventSource<'connected' | 'transaction'>(
      `${API_BASE_URL}/api/users/${userId}/transaction-events`,
      {
        headers: {
          Accept: 'text/event-stream',
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
          (current) => applyTransactionEvent(current, parsed),
        );

        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
        }

        reconnectTimerRef.current = setTimeout(() => {
          void queryClient.invalidateQueries({
            queryKey: reliabilityQueryKey(userId, scoreFrom),
          });

          void queryClient.invalidateQueries({
            queryKey: cashflowQueryKey(userId, transactionFrom, transactionTo),
          });
        }, 300);
      } catch {
        // Ignore malformed payloads but keep the stream alive.
      }
    };

    eventSource.addEventListener('transaction', onTransactionEvent);

    return () => {
      eventSource.removeAllEventListeners();
      eventSource.close();

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, [appState, queryClient, scoreFrom, transactionFrom, transactionTo, userId]);

  return null;
}
