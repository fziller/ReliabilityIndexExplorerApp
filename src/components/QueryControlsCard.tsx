import { useEffect, useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { format, parseISO } from "date-fns";
import { DatePickerModal } from "react-native-paper-dates";
import {
  Button,
  Card,
  Chip,
  HelperText,
  Text,
  TextInput,
} from "react-native-paper";
import { useExplorerParams } from "../context/ExplorerParamsContext";
import { semanticColors } from "../theme/theme";
import { deriveAnalysisWindow, isIsoDate } from "../utils/date";

export function QueryControlsCard() {
  const { userId, scoreFrom, setParams, transactionFrom, transactionTo } =
    useExplorerParams();
  const [draftUserId, setDraftUserId] = useState(userId);
  const [draftScoreFrom, setDraftScoreFrom] = useState(scoreFrom);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraftUserId(userId);
    setDraftScoreFrom(scoreFrom);
  }, [scoreFrom, userId]);

  const derivedWindow = useMemo(() => {
    if (!isIsoDate(draftScoreFrom)) {
      return null;
    }

    return deriveAnalysisWindow(draftScoreFrom);
  }, [draftScoreFrom]);

  const handleApply = () => {
    if (!draftUserId.trim()) {
      setError("User ID is required.");
      return;
    }

    if (!isIsoDate(draftScoreFrom)) {
      setError("Use YYYY-MM-DD for the scoring anchor date.");
      return;
    }

    setError(null);
    setParams({
      userId: draftUserId.trim(),
      scoreFrom: draftScoreFrom,
    });
  };

  const handlePickerConfirm = ({ date }: { date: Date | undefined }) => {
    setPickerVisible(false);

    if (!date) {
      return;
    }

    setDraftScoreFrom(format(date, "yyyy-MM-dd"));
  };

  const pickerDate = isIsoDate(draftScoreFrom)
    ? parseISO(draftScoreFrom)
    : undefined;

  return (
    <Card
      mode="contained"
      style={{
        marginBottom: 16,
        backgroundColor: semanticColors.cardBackground,
      }}
    >
      <Card.Content>
        <Text variant="titleMedium">Analyst Query Context</Text>
        <Text
          variant="bodyMedium"
          style={{
            marginTop: 6,
            marginBottom: 12,
            color: semanticColors.mutedText,
          }}
        >
          Edit the draft values here, then commit both with Apply Selection. The
          score anchor only updates live screens after apply.
        </Text>
        <View style={{ gap: 12, marginBottom: 12 }}>
          <TextInput
            mode="outlined"
            label="User ID"
            value={draftUserId}
            onChangeText={setDraftUserId}
            autoCapitalize="none"
            style={{ backgroundColor: "transparent" }}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setPickerVisible(true)}
          >
            <View pointerEvents="none">
              <TextInput
                mode="outlined"
                label="Score anchor draft (picker only)"
                value={draftScoreFrom}
                editable={false}
                right={<TextInput.Icon icon="calendar-month" />}
                style={{ backgroundColor: "transparent" }}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignContent: "center",
            alignSelf: "center",
            gap: 8,
          }}
        >
          <Chip compact icon="calendar-range">
            Draft window: {derivedWindow?.transactionFrom ?? transactionFrom} to{" "}
            {derivedWindow?.transactionTo ?? transactionTo}
          </Chip>
        </View>
        <Text
          variant="bodySmall"
          style={{
            marginTop: 8,
            color: semanticColors.mutedText,
            alignSelf: "center",
          }}
        >
          Current live window: {transactionFrom} to {transactionTo}
        </Text>
        <HelperText type="error" visible={Boolean(error)}>
          {error}
        </HelperText>
        <Button mode="contained" onPress={handleApply}>
          Apply selection
        </Button>
        <DatePickerModal
          locale="de"
          mode="single"
          visible={pickerVisible}
          date={pickerDate}
          onDismiss={() => setPickerVisible(false)}
          onConfirm={handlePickerConfirm}
          saveLabel="Select"
          label="Select anchor date"
          inputEnabled={false}
          animationType="fade"
        />
      </Card.Content>
    </Card>
  );
}
