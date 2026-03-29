import { useMemo } from "react";
import { Dimensions, View } from "react-native";
import { BarChart, barDataItem } from "react-native-gifted-charts";
import { Card, Chip, Text } from "react-native-paper";
import { CashflowMonth } from "../api/types";
import { semanticColors } from "../theme/theme";
import { formatMonthLabel } from "../utils/date";

interface CashflowChartCardProps {
  months: CashflowMonth[];
}

export function CashflowChartCard({ months }: CashflowChartCardProps) {
  const chartData = useMemo<barDataItem[]>(() => {
    return months.flatMap((month, index) => [
      {
        value: month.income,
        label: formatMonthLabel(month.month),
        frontColor: semanticColors.income,
        spacing: 6,
      },
      {
        value: month.essential_expenses,
        frontColor: semanticColors.expenses,
        spacing: index === months.length - 1 ? 12 : 24,
      },
    ]);
  }, [months]);

  const summary = useMemo(() => {
    const monthsWithIncome = months.filter((month) => month.income > 0).length;
    const weakestMonth = months.reduce((current, next) => {
      const currentSurplus = current.income - current.essential_expenses;
      const nextSurplus = next.income - next.essential_expenses;
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
          Monthly income versus essential expenses, sourced from the dedicated
          cashflow endpoint.
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
            icon="square-rounded"
            selectedColor={semanticColors.income}
          >
            Income
          </Chip>
          <Chip
            compact
            icon="square-rounded"
            selectedColor={semanticColors.expenses}
          >
            Essential expenses
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
            formatYLabel={(label) => `€${label}`}
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
