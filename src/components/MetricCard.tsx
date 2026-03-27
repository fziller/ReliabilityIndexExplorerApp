import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface MetricCardProps {
  label: string;
  value: string;
  supporting?: string;
}

export function MetricCard({ label, value, supporting }: MetricCardProps) {
  return (
    <Card mode="contained" style={styles.card}>
      <Card.Content>
        <Text variant="labelMedium" style={styles.label}>
          {label}
        </Text>
        <View style={styles.valueRow}>
          <Text variant="headlineSmall">{value}</Text>
        </View>
        {supporting ? (
          <Text variant="bodySmall" style={styles.supporting}>
            {supporting}
          </Text>
        ) : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  label: {
    marginBottom: 6,
  },
  valueRow: {
    minHeight: 36,
    justifyContent: 'center',
  },
  supporting: {
    marginTop: 8,
  },
});
