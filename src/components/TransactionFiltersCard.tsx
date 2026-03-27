import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Menu, Searchbar, SegmentedButtons, Text } from 'react-native-paper';

import { TransactionDirection, TransactionFilters, TransactionSort } from '../features/transactions/filters';

interface TransactionFiltersCardProps {
  filters: TransactionFilters;
  categories: string[];
  resultCount: number;
  onFiltersChange: (next: TransactionFilters) => void;
}

const SORT_OPTIONS: { label: string; value: TransactionSort }[] = [
  { label: 'Newest first', value: 'DATE_DESC' },
  { label: 'Oldest first', value: 'DATE_ASC' },
  { label: 'Highest amount', value: 'AMOUNT_DESC' },
  { label: 'Lowest amount', value: 'AMOUNT_ASC' },
];

export function TransactionFiltersCard({
  filters,
  categories,
  resultCount,
  onFiltersChange,
}: TransactionFiltersCardProps) {
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  return (
    <Card mode="contained" style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium">Transaction Explorer</Text>
        <Text variant="bodyMedium" style={styles.copy}>
          10k+ rows stay readable by virtualizing the list and keeping filtering local.
        </Text>
        <Searchbar
          placeholder="Search merchant"
          value={filters.merchantSearch}
          onChangeText={(merchantSearch) =>
            onFiltersChange({
              ...filters,
              merchantSearch,
            })
          }
          style={styles.searchbar}
        />
        <SegmentedButtons
          value={filters.direction}
          onValueChange={(direction) =>
            onFiltersChange({
              ...filters,
              direction: direction as TransactionDirection,
            })
          }
          buttons={[
            { value: 'ALL', label: 'All' },
            { value: 'POSITIVE', label: 'Positive' },
            { value: 'NEGATIVE', label: 'Negative' },
          ]}
        />
        <View style={styles.menus}>
          <Menu
            visible={categoryMenuVisible}
            onDismiss={() => setCategoryMenuVisible(false)}
            anchor={
              <Button mode="contained-tonal" onPress={() => setCategoryMenuVisible(true)}>
                Category: {filters.category}
              </Button>
            }
          >
            {categories.map((category) => (
              <Menu.Item
                key={category}
                title={category}
                onPress={() => {
                  setCategoryMenuVisible(false);
                  onFiltersChange({
                    ...filters,
                    category,
                  });
                }}
              />
            ))}
          </Menu>
          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <Button mode="contained-tonal" onPress={() => setSortMenuVisible(true)}>
                Sort
              </Button>
            }
          >
            {SORT_OPTIONS.map((option) => (
              <Menu.Item
                key={option.value}
                title={option.label}
                onPress={() => {
                  setSortMenuVisible(false);
                  onFiltersChange({
                    ...filters,
                    sort: option.value,
                  });
                }}
              />
            ))}
          </Menu>
        </View>
        <Text variant="labelLarge" style={styles.resultCount}>
          {resultCount.toLocaleString('de-DE')} visible transactions
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  copy: {
    marginTop: 6,
    marginBottom: 12,
  },
  searchbar: {
    marginBottom: 12,
  },
  menus: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  resultCount: {
    marginTop: 12,
  },
});
