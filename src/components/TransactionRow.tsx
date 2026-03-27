import { StyleSheet, View } from 'react-native';
import { Card, Chip, Text } from 'react-native-paper';

import { Transaction } from '../api/types';
import { semanticColors } from '../theme/theme';
import { formatDisplayDate } from '../utils/date';
import { formatCurrency } from '../utils/format';

interface TransactionRowProps {
  item: Transaction;
  currency: string;
}

export function TransactionRow({ item, currency }: TransactionRowProps) {
  const amountColor = item.amount >= 0 ? semanticColors.income : semanticColors.expenses;

  return (
    <Card mode="contained" style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.meta}>
            <Text variant="titleMedium">{item.merchant}</Text>
            <Text variant="bodySmall">
              {formatDisplayDate(item.date)} • {item.account}
            </Text>
          </View>
          <View style={styles.amounts}>
            <Text variant="titleMedium" style={{ color: amountColor }}>
              {formatCurrency(item.amount, currency)}
            </Text>
            <Text variant="bodySmall">Balance {formatCurrency(item.balance, currency)}</Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Chip compact>{item.category}</Chip>
          <Text variant="bodySmall">ID: {item.id}</Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  amounts: {
    alignItems: 'flex-end',
    gap: 2,
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
});
