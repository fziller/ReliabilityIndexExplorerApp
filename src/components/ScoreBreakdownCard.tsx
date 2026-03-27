import { StyleSheet, View } from 'react-native';
import { Card, ProgressBar, Text } from 'react-native-paper';

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
    <Card mode="contained" style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium">Score Breakdown</Text>
        <Text variant="bodyMedium" style={styles.copy}>
          These four signals explain how the index is constructed and where the score
          gets its shape.
        </Text>
        <View style={styles.rows}>
          {items.map((item) => (
            <View key={item.label} style={styles.row}>
              <View style={styles.header}>
                <Text variant="labelLarge">{item.label}</Text>
                <Text variant="labelLarge">{item.display}</Text>
              </View>
              <ProgressBar progress={item.value} style={styles.progressBar} />
            </View>
          ))}
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
  rows: {
    gap: 14,
  },
  row: {
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  progressBar: {
    height: 10,
    borderRadius: 999,
  },
});
