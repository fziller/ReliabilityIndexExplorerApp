import { useMemo } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { useCashflowQuery } from '../api/cashflow';
import { getErrorMessage } from '../api/client';
import { useReliabilityQuery } from '../api/reliability';
import { QueryControlsCard } from '../components/QueryControlsCard';
import { CashflowChartCard } from '../components/CashflowChartCard';
import { ExplanationCard } from '../components/ExplanationCard';
import { MetricCard } from '../components/MetricCard';
import { ScoreBreakdownCard } from '../components/ScoreBreakdownCard';
import { EmptyStateCard, ErrorStateCard, LoadingStateCard } from '../components/StateCards';
import { useExplorerParams } from '../context/ExplorerParamsContext';
import { semanticColors } from '../theme/theme';
import { formatCurrency, formatPercent, formatRatio, formatScoreBand, pluralize } from '../utils/format';

function normalizeCoverageRatio(value: number) {
  return Math.max(0, Math.min(value / 2, 1));
}

export function OverviewScreen() {
  const { userId, scoreFrom, transactionFrom, transactionTo } = useExplorerParams();

  const reliabilityQuery = useReliabilityQuery(userId, scoreFrom);
  const cashflowQuery = useCashflowQuery(userId, transactionFrom, transactionTo);

  const refresh = async () => {
    await Promise.all([reliabilityQuery.refetch(), cashflowQuery.refetch()]);
  };

  const riskSignals = useMemo(() => {
    const metrics = reliabilityQuery.data?.metrics;

    if (!metrics) {
      return [];
    }

    const risks: string[] = [];

    if (metrics.negative_balance_days > 0) {
      risks.push(pluralize(metrics.negative_balance_days, 'negative balance day'));
    }

    if (metrics.late_fee_events > 0) {
      risks.push(pluralize(metrics.late_fee_events, 'late fee event'));
    }

    if (metrics.good_months < 6) {
      risks.push(`Only ${metrics.good_months}/6 good cashflow months`);
    }

    if (metrics.income_coverage_ratio < 1) {
      risks.push('Income coverage ratio below 1.0');
    }

    return risks;
  }, [reliabilityQuery.data?.metrics]);

  const scoreTone = reliabilityQuery.data?.score_band === 'HIGH'
    ? semanticColors.scoreHigh
    : reliabilityQuery.data?.score_band === 'LOW'
      ? semanticColors.scoreLow
      : semanticColors.scoreMedium;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: semanticColors.screenBackground }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl
          refreshing={reliabilityQuery.isRefetching || cashflowQuery.isRefetching}
          onRefresh={() => {
            void refresh();
          }}
        />
      }
    >
      <QueryControlsCard />

      {reliabilityQuery.isLoading && !reliabilityQuery.data ? (
        <LoadingStateCard
          title="Loading reliability snapshot"
          message="Pulling score, metrics and drivers from the mock API."
        />
      ) : reliabilityQuery.isError ? (
        <ErrorStateCard
          title="Could not load reliability"
          message={getErrorMessage(reliabilityQuery.error)}
          actionLabel="Retry"
          onAction={() => {
            void reliabilityQuery.refetch();
          }}
        />
      ) : reliabilityQuery.data ? (
        <>
          <Card
            mode="contained"
            style={{ marginBottom: 16, backgroundColor: semanticColors.cardBackground }}
          >
            <Card.Content>
              <Text variant="labelLarge">Reliability Overview</Text>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginTop: 12 }}
              >
                <View>
                  <Text variant="displaySmall" style={{ color: scoreTone }}>
                    {reliabilityQuery.data.reliability_index}
                  </Text>
                  <Text variant="titleMedium">
                    {formatScoreBand(reliabilityQuery.data.score_band)} confidence band
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text variant="labelMedium">Score anchor</Text>
                  <Text variant="bodyMedium">{reliabilityQuery.data.from}</Text>
                  <Text variant="labelMedium">Analysis window</Text>
                  <Text variant="bodyMedium">
                    {transactionFrom} to {transactionTo}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <MetricCard
              label="Income regularity"
              value={formatPercent(reliabilityQuery.data.metrics.income_regularity)}
              supporting="Consistency of recurring income."
            />
            <MetricCard
              label="Coverage ratio"
              value={formatRatio(reliabilityQuery.data.metrics.income_coverage_ratio)}
              supporting="Income versus essentials."
            />
            <MetricCard
              label="Essential consistency"
              value={formatPercent(
                reliabilityQuery.data.metrics.essential_payments_consistency,
              )}
              supporting="Detected essential payments."
            />
            <MetricCard
              label="Good months"
              value={`${reliabilityQuery.data.metrics.good_months}/6`}
              supporting="Healthy cashflow months."
            />
            <MetricCard
              label="Negative balance days"
              value={String(reliabilityQuery.data.metrics.negative_balance_days)}
            />
            <MetricCard
              label="Late fee events"
              value={String(reliabilityQuery.data.metrics.late_fee_events)}
            />
          </View>

          <ScoreBreakdownCard
            items={[
              {
                label: 'Income Regularity',
                value: reliabilityQuery.data.metrics.income_regularity,
                display: formatPercent(reliabilityQuery.data.metrics.income_regularity),
              },
              {
                label: 'Income Coverage Ratio',
                value: normalizeCoverageRatio(reliabilityQuery.data.metrics.income_coverage_ratio),
                display: formatRatio(reliabilityQuery.data.metrics.income_coverage_ratio),
              },
              {
                label: 'Essential Payment Consistency',
                value: reliabilityQuery.data.metrics.essential_payments_consistency,
                display: formatPercent(
                  reliabilityQuery.data.metrics.essential_payments_consistency,
                ),
              },
              {
                label: 'Resilience / Outcome',
                value: reliabilityQuery.data.reliability_index / 100,
                display: `${reliabilityQuery.data.reliability_index}/100`,
              },
            ]}
          />

          <ExplanationCard
            positives={reliabilityQuery.data.drivers}
            risks={riskSignals}
          />
        </>
      ) : (
        <EmptyStateCard
          title="No reliability data"
          message="Try a different user ID or anchor date."
        />
      )}

      {cashflowQuery.isLoading && !cashflowQuery.data ? (
        <LoadingStateCard
          title="Loading cashflow timeline"
          message="Monthly income and essential expenses are being pulled now."
        />
      ) : cashflowQuery.isError ? (
        <ErrorStateCard
          title="Could not load cashflow"
          message={getErrorMessage(cashflowQuery.error)}
          actionLabel="Retry"
          onAction={() => {
            void cashflowQuery.refetch();
          }}
        />
      ) : cashflowQuery.data?.months.length ? (
        <CashflowChartCard months={cashflowQuery.data.months} />
      ) : (
        <EmptyStateCard
          title="No cashflow data"
          message="This user has no monthly cashflow records for the current window."
        />
      )}

      {reliabilityQuery.data ? (
        <Card mode="contained" style={{ backgroundColor: semanticColors.cardBackground }}>
          <Card.Content>
            <Text variant="titleMedium">Reading the score</Text>
            <Text variant="bodyMedium" style={{ marginTop: 8, color: semanticColors.mutedText }}>
              Reliability is the top-line decision. Metrics quantify stability. Drivers
              translate those metrics into human language. Cashflow explains the monthly
              rhythm underneath the score.
            </Text>
            <Text variant="bodyMedium">
              The score uses {reliabilityQuery.data.currency} amounts, so all balances and
              charts stay in the same unit.
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 8, color: semanticColors.mutedText }}>
              Example monthly expense anchor: {formatCurrency(900, reliabilityQuery.data.currency)}
            </Text>
          </Card.Content>
        </Card>
      ) : null}
    </ScrollView>
  );
}
