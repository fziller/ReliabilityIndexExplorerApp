import { View } from "react-native";
import { Card, ProgressBar, Text } from "react-native-paper";
import { semanticColors } from "../theme/theme";

interface ScoreBreakdownItem {
  label: string;
  value: number;
  display: string;
}

interface ScoreBreakdownCardProps {
  items: ScoreBreakdownItem[];
}

export function ScoreBreakdownCard({ items }: ScoreBreakdownCardProps) {
  return (
    <Card
      mode="contained"
      style={{
        marginBottom: 16,
        backgroundColor: semanticColors.cardBackground,
      }}
    >
      <Card.Content>
        <Text variant="titleMedium">Score Breakdown</Text>
        <Text
          variant="bodyMedium"
          style={{
            marginTop: 6,
            marginBottom: 16,
            color: semanticColors.mutedText,
          }}
        >
          These four signals explain how the index is constructed and where the
          score gets its shape.
        </Text>
        <View style={{ gap: 14 }}>
          {items.map((item) => (
            <View key={item.label} style={{ gap: 6 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <Text variant="labelLarge">{item.label}</Text>
                <Text variant="labelLarge">{item.display}</Text>
              </View>
              <ProgressBar
                progress={item.value}
                style={{
                  height: 10,
                  borderRadius: 999,
                  backgroundColor: semanticColors.chartGrid,
                }}
                color={semanticColors.accent}
              />
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
}
