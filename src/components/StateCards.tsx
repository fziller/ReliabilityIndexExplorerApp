import { StyleSheet } from 'react-native';
import { ActivityIndicator, Button, Card, Text } from 'react-native-paper';

interface StateCardProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function LoadingStateCard({ title, message }: StateCardProps) {
  return (
    <Card mode="contained" style={styles.card}>
      <Card.Content style={styles.content}>
        <ActivityIndicator />
        <Text variant="titleMedium">{title}</Text>
        {message ? <Text variant="bodyMedium">{message}</Text> : null}
      </Card.Content>
    </Card>
  );
}

export function ErrorStateCard({ title, message, actionLabel, onAction }: StateCardProps) {
  return (
    <Card mode="contained" style={styles.card}>
      <Card.Content style={styles.content}>
        <Text variant="titleMedium">{title}</Text>
        {message ? <Text variant="bodyMedium">{message}</Text> : null}
        {actionLabel && onAction ? (
          <Button mode="contained-tonal" onPress={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </Card.Content>
    </Card>
  );
}

export function EmptyStateCard({ title, message }: StateCardProps) {
  return (
    <Card mode="contained" style={styles.card}>
      <Card.Content style={styles.content}>
        <Text variant="titleMedium">{title}</Text>
        {message ? <Text variant="bodyMedium">{message}</Text> : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  content: {
    gap: 8,
  },
});
