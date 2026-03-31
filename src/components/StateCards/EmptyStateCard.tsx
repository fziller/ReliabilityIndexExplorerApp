import { memo } from "react";
import { Card, Text } from "react-native-paper";
import { semanticColors } from "../../theme/theme";

interface StateCardProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

function EmptyStateCard({ title, message }: StateCardProps) {
  return (
    <Card
      mode="contained"
      style={{
        marginBottom: 16,
        backgroundColor: semanticColors.cardBackground,
      }}
    >
      <Card.Content style={{ gap: 8 }}>
        <Text variant="titleMedium">{title}</Text>
        {message ? (
          <Text
            variant="bodyMedium"
            style={{ color: semanticColors.mutedText }}
          >
            {message}
          </Text>
        ) : null}
      </Card.Content>
    </Card>
  );
}

export default memo(EmptyStateCard);
