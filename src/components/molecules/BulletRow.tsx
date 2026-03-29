import { View } from "react-native";
import { Text } from "react-native-paper";
import { semanticColors } from "../../theme/theme";

export function BulletRow({
  prefix,
  text,
  tone,
}: {
  prefix: string;
  text: string;
  tone: "good" | "risk";
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
      <Text
        variant="titleMedium"
        style={{
          color:
            tone === "good" ? semanticColors.positive : semanticColors.risk,
        }}
      >
        {prefix}
      </Text>
      <Text variant="bodyMedium" style={{ flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}
