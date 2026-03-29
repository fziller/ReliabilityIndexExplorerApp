import { View } from "react-native";
import { Card, Divider, Text } from "react-native-paper";
import { semanticColors } from "../theme/theme";
import { BulletRow } from "./molecules/BulletRow";

interface ExplanationCardProps {
  positives: string[];
  risks: string[];
}

export function ExplanationCard({ positives, risks }: ExplanationCardProps) {
  return (
    <Card
      mode="contained"
      style={{
        marginBottom: 16,
        backgroundColor: semanticColors.cardBackground,
      }}
    >
      <Card.Content>
        <Text variant="titleMedium">Score Explanation</Text>
        <Text
          variant="bodyMedium"
          style={{
            marginTop: 6,
            marginBottom: 16,
            color: semanticColors.mutedText,
          }}
        >
          Positive signals come from the backend drivers. Risk signals are
          derived from the metrics so the explanation does not hide the ugly
          bits.
        </Text>
        <Text variant="labelLarge" style={{ marginBottom: 10 }}>
          Positive Signals
        </Text>
        <View style={{ gap: 10 }}>
          {positives.map((signal) => (
            <BulletRow key={signal} prefix="+" text={signal} tone="good" />
          ))}
        </View>
        <Divider style={{ marginVertical: 16 }} />
        <Text variant="labelLarge" style={{ marginBottom: 10 }}>
          Risk Signals
        </Text>
        <View style={{ gap: 10 }}>
          {risks.length ? (
            risks.map((signal) => (
              <BulletRow key={signal} prefix="-" text={signal} tone="risk" />
            ))
          ) : (
            <Text variant="bodyMedium">
              No active risk flags in the current window.
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}
