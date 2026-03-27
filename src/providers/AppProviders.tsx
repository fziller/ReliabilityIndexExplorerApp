import { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';

import { ExplorerParamsProvider } from '../context/ExplorerParamsContext';
import { queryClient } from '../lib/queryClient';
import { LiveTransactionSync } from '../features/transactions/LiveTransactionSync';
import { appTheme } from '../theme/theme';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={appTheme}>
          <ExplorerParamsProvider>
            <LiveTransactionSync />
            {children}
          </ExplorerParamsProvider>
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
