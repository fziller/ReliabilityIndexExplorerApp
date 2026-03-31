import { useMemo } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { Card, Text } from "react-native-paper";
import { getErrorMessage } from "../api/client";
import { CashflowChartCard } from "../components/CashflowChartCard";
import { ExplanationCard } from "../components/ExplanationCard";
import { MetricCard } from "../components/MetricCard";
import { QueryControlsCard } from "../components/QueryControlsCard";
import { ScoreBreakdownCard } from "../components/ScoreBreakdownCard";
import {
  EmptyStateCard,
  ErrorStateCard,
  LoadingStateCard,
} from "../components/StateCards";
import { useExplorerParams } from "../context/ExplorerParamsContext";
import { semanticColors } from "../theme/theme";
import {
  formatCurrency,
  formatPercent,
  formatRatio,
  formatScoreBand,
  normalizeCoverageRatio,
  pluralize,
} from "../utils/format";
import { buildMonthlyChartData } from "../utils/screenHelper";
import { useReliabilityQuery } from "../hooks/useReliabilityQuery";
import { useTransactionsQuery } from "../hooks/useTransactionQuery";

export function OverviewScreen() {
  const { userId, scoreFrom, transactionFrom, transactionTo } =
    useExplorerParams();

  // queries
  const reliabilityQuery = useReliabilityQuery(userId, scoreFrom);
  const transactionsQuery = useTransactionsQuery(
    userId,
    transactionFrom,
    transactionTo,
  );

  // memos
  const monthlyChartData = useMemo(
    () => buildMonthlyChartData(transactionsQuery.data),
    [transactionsQuery.data],
  );

  const riskSignals = useMemo(() => {
    const metrics = reliabilityQuery.data?.metrics;

    if (!metrics) {
      return [];
    }

    const risks: string[] = [];

    if (metrics.negative_balance_days > 0) {
      risks.push(
        pluralize(metrics.negative_balance_days, "negative balance day"),
      );
    }

    if (metrics.late_fee_events > 0) {
      risks.push(pluralize(metrics.late_fee_events, "late fee event"));
    }

    if (metrics.good_months < 6) {
      risks.push(`Only ${metrics.good_months}/6 stable months`);
    }

    if (metrics.income_coverage_ratio < 1) {
      risks.push("Income coverage ratio below 1.0");
    }

    return risks;
  }, [reliabilityQuery.data?.metrics]);

  const refresh = async () => {
    await Promise.all([
      reliabilityQuery.refetch(),
      transactionsQuery.refetch(),
    ]);
  };

  const scoreTone =
    reliabilityQuery.data?.score_band === "HIGH"
      ? semanticColors.scoreHigh
      : reliabilityQuery.data?.score_band === "LOW"
        ? semanticColors.scoreLow
        : semanticColors.scoreMedium;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: semanticColors.screenBackground }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl
          refreshing={
            reliabilityQuery.isRefetching || transactionsQuery.isRefetching
          }
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
                    {reliabilityQuery.data.reliability_index}
                  </Text>
                  <Text variant="titleMedium">
                    {formatScoreBand(reliabilityQuery.data.score_band)}{" "}
                    confidence band
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
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

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <MetricCard
              label="Income regularity"
              value={formatPercent(
                reliabilityQuery.data.metrics.income_regularity,
              )}
              supporting="Consistency of recurring income."
            />
            <MetricCard
              label="Coverage ratio"
              value={formatRatio(
                reliabilityQuery.data.metrics.income_coverage_ratio,
              )}
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
              supporting="Healthy months in the scoring window."
            />
            <MetricCard
              label="Negative balance days"
              value={String(
                reliabilityQuery.data.metrics.negative_balance_days,
              )}
            />
            <MetricCard
              label="Late fee events"
              value={String(reliabilityQuery.data.metrics.late_fee_events)}
            />
          </View>

          <ScoreBreakdownCard
            items={[
              {
                label: "Income Regularity",
                value: reliabilityQuery.data.metrics.income_regularity,
                display: formatPercent(
                  reliabilityQuery.data.metrics.income_regularity,
                ),
              },
              {
                label: "Income Coverage Ratio",
                value: normalizeCoverageRatio(
                  reliabilityQuery.data.metrics.income_coverage_ratio,
                ),
                display: formatRatio(
                  reliabilityQuery.data.metrics.income_coverage_ratio,
                ),
              },
              {
                label: "Essential Payment Consistency",
                value:
                  reliabilityQuery.data.metrics.essential_payments_consistency,
                display: formatPercent(
                  reliabilityQuery.data.metrics.essential_payments_consistency,
                ),
              },
              {
                label: "Resilience / Outcome",
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

      {transactionsQuery.isLoading && !transactionsQuery.data ? (
        <LoadingStateCard
          title="Loading monthly activity"
          message="Monthly income and expense totals are being derived from transactions."
        />
      ) : transactionsQuery.isError ? (
        <ErrorStateCard
          title="Could not load monthly activity"
          message={getErrorMessage(transactionsQuery.error)}
          actionLabel="Retry"
          onAction={() => {
            void transactionsQuery.refetch();
          }}
        />
      ) : monthlyChartData.length ? (
        <CashflowChartCard
          months={monthlyChartData}
          currency={reliabilityQuery.data?.currency ?? "EUR"}
        />
      ) : (
        <EmptyStateCard
          title="No monthly activity"
          message="This user has no transactions in the current analysis window."
        />
      )}

      {reliabilityQuery.data ? (
        <Card
          mode="contained"
          style={{ backgroundColor: semanticColors.cardBackground }}
        >
          <Card.Content>
            <Text variant="titleMedium">Reading the score</Text>
            <Text
              variant="bodyMedium"
              style={{ marginTop: 8, color: semanticColors.mutedText }}
            >
              Reliability is the top-line decision. Metrics quantify stability.
              Drivers translate those metrics into human language. Monthly
              transaction activity explains the rhythm underneath the score.
            </Text>
            <Text variant="bodyMedium">
              The score uses {reliabilityQuery.data.currency} amounts, so all
              balances and charts stay in the same unit.
            </Text>
            <Text
              variant="bodyMedium"
              style={{ marginTop: 8, color: semanticColors.mutedText }}
            >
              Example monthly expense anchor:{" "}
              {formatCurrency(900, reliabilityQuery.data.currency)}
            </Text>
          </Card.Content>
        </Card>
      ) : null}
    </ScrollView>
  );
}
