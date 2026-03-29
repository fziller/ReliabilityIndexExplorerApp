import { View } from "react-native";
import { Card, Text } from "react-native-paper";
import { semanticColors } from "../theme/theme";

interface MetricCardProps {
  label: string;
  value: string;
  supporting?: string;
}

export function MetricCard({ label, value, supporting }: MetricCardProps) {
  return (
    <Card
      mode="contained"
      style={{
        flexBasis: "48%",
        flexGrow: 1,
        backgroundColor: semanticColors.cardBackground,
      }}
    >
      <Card.Content>
        <Text variant="labelMedium" style={{ marginBottom: 6 }}>
          {label}
        </Text>
        <View style={{ minHeight: 36, justifyContent: "center" }}>
          <Text variant="headlineSmall">{value}</Text>
        </View>
        {supporting ? (
          <Text
            variant="bodySmall"
            style={{ marginTop: 8, color: semanticColors.mutedText }}
          >
            {supporting}
          </Text>
        ) : null}
      </Card.Content>
    </Card>
  );
}
