import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Chip, HelperText, Text, TextInput } from 'react-native-paper';

import { useExplorerParams } from '../context/ExplorerParamsContext';
import { semanticColors } from '../theme/theme';
import { deriveAnalysisWindow, isIsoDate } from '../utils/date';

export function QueryControlsCard() {
  const { userId, scoreFrom, setParams, transactionFrom, transactionTo } = useExplorerParams();
  const [draftUserId, setDraftUserId] = useState(userId);
  const [draftScoreFrom, setDraftScoreFrom] = useState(scoreFrom);
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
      setError('User ID is required.');
      return;
    }

    if (!isIsoDate(draftScoreFrom)) {
      setError('Use YYYY-MM-DD for the scoring anchor date.');
      return;
    }

    setError(null);
    setParams({
      userId: draftUserId.trim(),
      scoreFrom: draftScoreFrom,
    });
  };

  return (
    <Card
      mode="contained"
      style={{ marginBottom: 16, backgroundColor: semanticColors.cardBackground }}
    >
      <Card.Content>
        <Text variant="titleMedium">Analyst Query Context</Text>
        <Text
          variant="bodyMedium"
          style={{ marginTop: 6, marginBottom: 12, color: semanticColors.mutedText }}
        >
          One score anchor date drives the six-month cashflow and transaction window.
        </Text>
        <View style={{ gap: 12, marginBottom: 12 }}>
          <TextInput
            mode="outlined"
            label="User ID"
            value={draftUserId}
            onChangeText={setDraftUserId}
            autoCapitalize="none"
            style={{ backgroundColor: 'transparent' }}
          />
          <TextInput
            mode="outlined"
            label="Score anchor (YYYY-MM-DD)"
            value={draftScoreFrom}
            onChangeText={setDraftScoreFrom}
            autoCapitalize="none"
            style={{ backgroundColor: 'transparent' }}
          />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          <Chip compact icon="calendar-range">
            Transactions: {derivedWindow?.transactionFrom ?? transactionFrom} to{' '}
            {derivedWindow?.transactionTo ?? transactionTo}
          </Chip>
          <Chip compact icon="database-sync">
            SSE sync on transaction deltas
          </Chip>
        </View>
        <HelperText type="error" visible={Boolean(error)}>
          {error}
        </HelperText>
        <Button mode="contained" onPress={handleApply}>
          Apply Window
        </Button>
      </Card.Content>
    </Card>
  );
}
