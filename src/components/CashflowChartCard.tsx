import { useMemo } from "react";
import { Dimensions, View } from "react-native";
import { BarChart, barDataItem } from "react-native-gifted-charts";
import { Card, Chip, Icon, Text } from "react-native-paper";
import { semanticColors } from "../theme/theme";
import { formatMonthLabel } from "../utils/date";
import { formatCurrency } from "../utils/format";

export interface MonthlyTransactionSummary {
  month: string;
  income: number;
  expenses: number;
}

interface CashflowChartCardProps {
  months: MonthlyTransactionSummary[];
  currency: string;
}

export function CashflowChartCard({
  months,
  currency,
}: CashflowChartCardProps) {
  // memos
  const chartData = useMemo<barDataItem[]>(() => {
    return months.flatMap((month, index) => [
      {
        value: month.income,
        label: formatMonthLabel(month.month),
        frontColor: semanticColors.income,
        spacing: 6,
      },
      {
        value: month.expenses,
        frontColor: semanticColors.expenses,
        spacing: index === months.length - 1 ? 12 : 24,
      },
    ]);
  }, [months]);

  const summary = useMemo(() => {
    const monthsWithIncome = months.filter((month) => month.income > 0).length;
    const weakestMonth = months.reduce((current, next) => {
      const currentSurplus = current.income - current.expenses;
      const nextSurplus = next.income - next.expenses;
      return nextSurplus < currentSurplus ? next : current;
    }, months[0]);

    return {
      monthsWithIncome,
      weakestMonth,
    };
  }, [months]);

  return (
    <Card
      mode="contained"
      style={{
        marginBottom: 16,
        backgroundColor: semanticColors.cardBackground,
      }}
    >
      <Card.Content>
        <Text variant="titleMedium">Cashflow Timeline</Text>
        <Text
          variant="bodyMedium"
          style={{
            marginTop: 6,
            marginBottom: 12,
            color: semanticColors.mutedText,
          }}
        >
          Monthly income versus expenses, derived from transaction activity in
          the current analysis window.
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <Chip
            compact
            style={{ alignSelf: "center" }}
            textStyle={{ marginVertical: 0, lineHeight: 16 }}
            icon={({ size }) => (
              <Icon
                source="square-rounded"
                color={semanticColors.income}
                size={size}
              />
            )}
          >
            Income
          </Chip>
          <Chip
            compact
            style={{ alignSelf: "center" }}
            textStyle={{ marginVertical: 0, lineHeight: 16 }}
            icon={({ size }) => (
              <Icon
                source="square-rounded"
                color={semanticColors.expenses}
                size={size}
              />
            )}
          >
            Expenses
          </Chip>
        </View>
        <View style={{ overflow: "hidden" }}>
          <BarChart
            data={chartData}
            width={Math.max(Dimensions.get("window").width - 88, 320)}
            barWidth={18}
            initialSpacing={12}
            endSpacing={0}
            spacing={6}
            roundedTop
            roundedBottom
            hideRules={false}
            rulesColor={semanticColors.chartGrid}
            yAxisColor={semanticColors.chartAxis}
            xAxisColor={semanticColors.chartAxis}
            yAxisTextStyle={{ color: semanticColors.mutedText, fontSize: 11 }}
            xAxisLabelTextStyle={{
              color: semanticColors.mutedText,
              fontSize: 11,
            }}
            noOfSections={4}
            formatYLabel={(label) => formatCurrency(Number(label), currency)}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 12,
          }}
        >
          <Chip compact icon="bank-check">
            Income in {summary.monthsWithIncome}/{months.length} months
          </Chip>
          <Chip compact icon="alert-circle-outline">
            Weakest month: {formatMonthLabel(summary.weakestMonth.month)}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );
}
