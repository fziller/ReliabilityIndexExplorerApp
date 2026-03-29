import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ExplorerParamsProvider } from "../context/ExplorerParamsContext";
import { LiveTransactionSync } from "../features/transactions/LiveTransactionSync";
import { queryClient } from "../lib/queryClient";
import { appTheme } from "../theme/theme";

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
