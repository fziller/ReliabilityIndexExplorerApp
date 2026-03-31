import { View } from "react-native";
import { Card, Text } from "react-native-paper";
import { semanticColors } from "../theme/theme";
import { formatScoreBand } from "../utils/format";

interface ReliabilityScoreCardProps {
  reliabilityIndex: number;
  scoreTone: string;
  scoreBand: string;
}

function ReliabilityScoreCard({
  reliabilityIndex,
  scoreTone,
  scoreBand,
}: ReliabilityScoreCardProps) {
  return (
    <Card
      mode="contained"
      style={{
        marginBottom: 16,
        backgroundColor: semanticColors.cardBackground,
      }}
    >
      <Card.Content>
        <Text variant="labelLarge">Reliability Overview</Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 16,
            marginTop: 12,
          }}
        >
          <View>
            <Text variant="displaySmall" style={{ color: scoreTone }}>
              {reliabilityIndex}
            </Text>
            <Text variant="titleMedium">
              {formatScoreBand(scoreBand)} confidence band
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

export default ReliabilityScoreCard;
