import { StyleSheet, View } from 'react-native';
import { Card, Divider, Text } from 'react-native-paper';

interface ExplanationCardProps {
  positives: string[];
  risks: string[];
}

function BulletRow({ prefix, text, tone }: { prefix: string; text: string; tone: 'good' | 'risk' }) {
  return (
    <View style={styles.bulletRow}>
      <Text
        variant="titleMedium"
        style={tone === 'good' ? styles.goodPrefix : styles.riskPrefix}
      >
        {prefix}
      </Text>
      <Text variant="bodyMedium" style={styles.bulletText}>
        {text}
      </Text>
    </View>
  );
}

export function ExplanationCard({ positives, risks }: ExplanationCardProps) {
  return (
    <Card mode="contained" style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium">Score Explanation</Text>
        <Text variant="bodyMedium" style={styles.copy}>
          Positive signals come from the backend drivers. Risk signals are derived from
          the metrics so the explanation does not hide the ugly bits.
        </Text>
        <Text variant="labelLarge" style={styles.sectionTitle}>
          Positive Signals
        </Text>
        <View style={styles.group}>
          {positives.map((signal) => (
            <BulletRow key={signal} prefix="+" text={signal} tone="good" />
          ))}
        </View>
        <Divider style={styles.divider} />
        <Text variant="labelLarge" style={styles.sectionTitle}>
          Risk Signals
        </Text>
        <View style={styles.group}>
          {risks.length ? (
            risks.map((signal) => (
              <BulletRow key={signal} prefix="-" text={signal} tone="risk" />
            ))
          ) : (
            <Text variant="bodyMedium">No active risk flags in the current window.</Text>
          )}
        </View>
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
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  group: {
    gap: 10,
  },
  divider: {
    marginVertical: 16,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletText: {
    flex: 1,
  },
  goodPrefix: {
    color: '#2F7A5A',
  },
  riskPrefix: {
    color: '#B33D2E',
  },
});
