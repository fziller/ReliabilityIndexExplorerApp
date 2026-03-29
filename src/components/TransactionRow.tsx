import { View } from "react-native";
import { Card, Chip, Text } from "react-native-paper";
import { Transaction } from "../api/types";
import { semanticColors } from "../theme/theme";
import { formatDisplayDate } from "../utils/date";
import { formatCurrency } from "../utils/format";

interface TransactionRowProps {
  item: Transaction;
  currency: string;
}

export function TransactionRow({ item, currency }: TransactionRowProps) {
  const amountColor =
    item.amount >= 0 ? semanticColors.income : semanticColors.expenses;

  return (
    <Card
      mode="contained"
      style={{
        marginBottom: 10,
        backgroundColor: semanticColors.cardBackground,
      }}
    >
      <Card.Content>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="titleMedium">{item.merchant}</Text>
            <Text
              variant="bodySmall"
              style={{ color: semanticColors.mutedText }}
            >
              {formatDisplayDate(item.date)} • {item.account}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 2 }}>
            <Text variant="titleMedium" style={{ color: amountColor }}>
              {formatCurrency(item.amount, currency)}
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: semanticColors.mutedText }}
            >
              Balance {formatCurrency(item.balance, currency)}
            </Text>
          </View>
        </View>
        <View
          style={{
            marginTop: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Chip compact>{item.category}</Chip>
          <Text variant="bodySmall" style={{ color: semanticColors.mutedText }}>
            ID: {item.id}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}
