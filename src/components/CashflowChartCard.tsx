import { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { BarChart, barDataItem } from 'react-native-gifted-charts';
import { Card, Chip, Text } from 'react-native-paper';

import { CashflowMonth } from '../api/types';
import { semanticColors } from '../theme/theme';
import { formatMonthLabel } from '../utils/date';

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
    <Card mode="contained" style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium">Cashflow Timeline</Text>
        <Text variant="bodyMedium" style={styles.copy}>
          Monthly income versus essential expenses, sourced from the dedicated
          cashflow endpoint.
        </Text>
        <View style={styles.legend}>
          <Chip compact icon="square-rounded" selectedColor={semanticColors.income}>
            Income
          </Chip>
          <Chip compact icon="square-rounded" selectedColor={semanticColors.expenses}>
            Essential expenses
          </Chip>
        </View>
        <View style={styles.chartWrap}>
          <BarChart
            data={chartData}
            width={Math.max(Dimensions.get('window').width - 88, 320)}
            barWidth={18}
            initialSpacing={12}
            endSpacing={0}
            spacing={6}
            roundedTop
            roundedBottom
            hideRules={false}
            rulesColor="#D9D0C2"
            yAxisColor="#8F8578"
            xAxisColor="#8F8578"
            yAxisTextStyle={styles.axisText}
            xAxisLabelTextStyle={styles.axisText}
            noOfSections={4}
            formatYLabel={(label) => `€${label}`}
          />
        </View>
        <View style={styles.summary}>
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

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  copy: {
    marginTop: 6,
    marginBottom: 12,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chartWrap: {
    overflow: 'hidden',
  },
  summary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  axisText: {
    color: '#6D6457',
    fontSize: 11,
  },
});
