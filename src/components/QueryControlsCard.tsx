import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Chip, HelperText, Text, TextInput } from 'react-native-paper';

import { useExplorerParams } from '../context/ExplorerParamsContext';
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
    <Card mode="contained" style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium">Analyst Query Context</Text>
        <Text variant="bodyMedium" style={styles.copy}>
          One score anchor date drives the six-month cashflow and transaction window.
        </Text>
        <View style={styles.inputs}>
          <TextInput
            mode="outlined"
            label="User ID"
            value={draftUserId}
            onChangeText={setDraftUserId}
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="Score anchor (YYYY-MM-DD)"
            value={draftScoreFrom}
            onChangeText={setDraftScoreFrom}
            autoCapitalize="none"
            style={styles.input}
          />
        </View>
        <View style={styles.chips}>
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

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  copy: {
    marginTop: 6,
    marginBottom: 12,
  },
  inputs: {
    gap: 12,
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'transparent',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
});
