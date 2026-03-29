import { FlashList } from "@shopify/flash-list";
import { useDeferredValue, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { getErrorMessage } from "../api/client";
import { useTransactionsQuery } from "../api/transactions";
import { QueryControlsCard } from "../components/QueryControlsCard";
import {
  EmptyStateCard,
  ErrorStateCard,
  LoadingStateCard,
} from "../components/StateCards";
import { TransactionFiltersCard } from "../components/TransactionFiltersCard";
import { TransactionRow } from "../components/TransactionRow";
import { useExplorerParams } from "../context/ExplorerParamsContext";
import {
  defaultTransactionFilters,
  filterAndSortTransactions,
  getCategories,
  TransactionFilters,
} from "../features/transactions/filters";
import { semanticColors } from "../theme/theme";

export function TransactionsScreen() {
  const { userId, transactionFrom, transactionTo } = useExplorerParams();
  const transactionsQuery = useTransactionsQuery(
    userId,
    transactionFrom,
    transactionTo,
  );
  const [filters, setFilters] = useState<TransactionFilters>(
    defaultTransactionFilters,
  );
  const deferredSearch = useDeferredValue(filters.merchantSearch);

  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      merchantSearch: deferredSearch,
    }),
    [deferredSearch, filters],
  );

  const categories = useMemo(
    () => getCategories(transactionsQuery.data ?? []),
    [transactionsQuery.data],
  );

  const visibleTransactions = useMemo(
    () =>
      filterAndSortTransactions(transactionsQuery.data ?? [], effectiveFilters),
    [effectiveFilters, transactionsQuery.data],
  );

  const currency = "EUR";

  if (transactionsQuery.isLoading && !transactionsQuery.data) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: semanticColors.screenBackground }}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
      >
        <QueryControlsCard />
        <LoadingStateCard
          title="Loading transactions"
          message="Fetching and sorting the raw ledger for the current analysis window."
        />
      </ScrollView>
    );
  }

  if (transactionsQuery.isError) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: semanticColors.screenBackground }}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
      >
        <QueryControlsCard />
        <ErrorStateCard
          title="Could not load transactions"
          message={getErrorMessage(transactionsQuery.error)}
          actionLabel="Retry"
          onAction={() => {
            void transactionsQuery.refetch();
          }}
        />
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: semanticColors.screenBackground }}>
      <FlashList
        data={visibleTransactions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={{ padding: 16, paddingBottom: 8 }}>
            <QueryControlsCard />
            <TransactionFiltersCard
              filters={filters}
              categories={categories}
              resultCount={visibleTransactions.length}
              onFiltersChange={setFilters}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <Text variant="bodyMedium">
                Window: {transactionFrom} to {transactionTo}
              </Text>
              <Button
                mode="contained-tonal"
                onPress={() => {
                  void transactionsQuery.refetch();
                }}
              >
                Refresh
              </Button>
            </View>
            {!transactionsQuery.data?.length ? (
              <EmptyStateCard
                title="No transactions"
                message="There are no transactions in the current analysis window."
              />
            ) : null}
            {transactionsQuery.data?.length &&
            visibleTransactions.length === 0 ? (
              <EmptyStateCard
                title="Filters removed everything"
                message="Try a different category, search term or direction."
              />
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <TransactionRow item={item} currency={currency} />
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}
