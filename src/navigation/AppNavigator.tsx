import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { OverviewScreen } from '../screens/OverviewScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { appTheme } from '../theme/theme';

type RootTabParamList = {
  Overview: undefined;
  Transactions: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: appTheme.colors.background,
    card: appTheme.colors.surface,
    primary: appTheme.colors.primary,
    text: appTheme.colors.onSurface,
    border: appTheme.colors.outline,
  },
};

export function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: {
            backgroundColor: appTheme.colors.surface,
          },
          headerTintColor: appTheme.colors.onSurface,
          tabBarStyle: {
            backgroundColor: appTheme.colors.surface,
            borderTopColor: appTheme.colors.outline,
          },
          tabBarActiveTintColor: appTheme.colors.primary,
          tabBarInactiveTintColor: appTheme.colors.onSurfaceVariant,
          sceneStyle: {
            backgroundColor: appTheme.colors.background,
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
