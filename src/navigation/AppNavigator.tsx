import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { OverviewScreen } from '../screens/OverviewScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { appTheme, semanticColors } from '../theme/theme';

type RootTabParamList = {
  Overview: undefined;
  Transactions: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: semanticColors.screenBackground,
    card: semanticColors.cardBackground,
    primary: semanticColors.accent,
    text: semanticColors.ink,
    border: semanticColors.cardBorder,
  },
};

export function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: {
            backgroundColor: semanticColors.cardBackground,
          },
          headerTintColor: semanticColors.ink,
          tabBarStyle: {
            backgroundColor: semanticColors.cardBackground,
            borderTopColor: semanticColors.cardBorder,
          },
          tabBarActiveTintColor: semanticColors.accent,
          tabBarInactiveTintColor: appTheme.colors.onSurfaceVariant,
          sceneStyle: {
            backgroundColor: semanticColors.screenBackground,
          },
          tabBarIcon: ({ color, size }) => {
            const iconName =
              route.name === 'Overview' ? 'chart-donut-variant' : 'format-list-bulleted';

            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="Overview"
          component={OverviewScreen}
          options={{
            title: 'Reliability Explorer',
          }}
        />
        <Tab.Screen
          name="Transactions"
          component={TransactionsScreen}
          options={{
            title: 'Transactions',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
