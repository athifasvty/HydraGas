import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

// Screens
import HomeScreen from '../screens/kurir/HomeScreen';
import OrderListScreen from '../screens/kurir/OrderListScreen';
import OrderDetailScreen from '../screens/kurir/OrderDetailScreen';
import HistoryScreen from '../screens/kurir/HistoryScreen';
import ProfileScreen from '../screens/kurir/ProfileScreen';

import { SCREENS, COLORS } from '../utils/constants';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack untuk Home
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: 'Dashboard Kurir' }}
      />
    </Stack.Navigator>
  );
};

// Stack untuk Orders
const OrderStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="OrdersMain"
        component={OrderListScreen}
        options={{ title: 'Pesanan Saya' }}
      />
      <Stack.Screen
        name={SCREENS.KURIR_ORDER_DETAIL}
        component={OrderDetailScreen}
        options={{ title: 'Detail Pesanan' }}
      />
    </Stack.Navigator>
  );
};

// Stack untuk History
const HistoryStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="HistoryMain"
        component={HistoryScreen}
        options={{ title: 'Riwayat Pengiriman' }}
      />
      <Stack.Screen
        name={SCREENS.KURIR_ORDER_DETAIL}
        component={OrderDetailScreen}
        options={{ title: 'Detail Pesanan' }}
      />
    </Stack.Navigator>
  );
};

// Stack untuk Profile
const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
};

const KurirNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === SCREENS.KURIR_HOME) {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === SCREENS.KURIR_ORDERS) {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === SCREENS.KURIR_HISTORY) {
            iconName = focused ? 'checkmark-done' : 'checkmark-done-outline';
          } else if (route.name === SCREENS.KURIR_PROFILE) {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        headerShown: false,
      })}
    >
      <Tab.Screen
        name={SCREENS.KURIR_HOME}
        component={HomeStack}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name={SCREENS.KURIR_ORDERS}
        component={OrderStack}
        options={{ title: 'Pesanan' }}
      />
      <Tab.Screen
        name={SCREENS.KURIR_HISTORY}
        component={HistoryStack}
        options={{ title: 'Riwayat' }}
      />
      <Tab.Screen
        name={SCREENS.KURIR_PROFILE}
        component={ProfileStack}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default KurirNavigator;