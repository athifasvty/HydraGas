import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

// Screens
import HomeScreen from '../screens/customer/HomeScreen';
import CartScreen from '../screens/customer/CartScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import OrderScreen from '../screens/customer/OrderScreen';
import OrderDetailScreen from '../screens/customer/OrderDetailScreen';
import HistoryScreen from '../screens/customer/HistoryScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';

import { SCREENS, COLORS } from '../utils/constants';
import { useCart } from '../context/CartContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack untuk Home (bisa navigate ke Cart, Checkout)
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
        options={{ title: 'Katalog Produk' }}
      />
      <Stack.Screen
        name={SCREENS.CUSTOMER_CART}
        component={CartScreen}
        options={{ title: 'Keranjang Belanja' }}
      />
      <Stack.Screen
        name={SCREENS.CUSTOMER_CHECKOUT}
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />
    </Stack.Navigator>
  );
};

// Stack untuk Orders (bisa navigate ke OrderDetail)
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
        component={OrderScreen}
        options={{ title: 'Pesanan Aktif' }}
      />
      <Stack.Screen
        name={SCREENS.CUSTOMER_ORDER_DETAIL}
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
        options={{ title: 'Riwayat Pesanan' }}
      />
      <Stack.Screen
        name={SCREENS.CUSTOMER_ORDER_DETAIL}
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

const CustomerNavigator = () => {
  const { getTotalItems } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === SCREENS.CUSTOMER_HOME) {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === SCREENS.CUSTOMER_ORDERS) {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === SCREENS.CUSTOMER_HISTORY) {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === SCREENS.CUSTOMER_PROFILE) {
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
        name={SCREENS.CUSTOMER_HOME}
        component={HomeStack}
        options={{ 
          title: 'Home',
          tabBarBadge: getTotalItems() > 0 ? getTotalItems() : null,
        }}
      />
      <Tab.Screen
        name={SCREENS.CUSTOMER_ORDERS}
        component={OrderStack}
        options={{ title: 'Pesanan' }}
      />
      <Tab.Screen
        name={SCREENS.CUSTOMER_HISTORY}
        component={HistoryStack}
        options={{ title: 'Riwayat' }}
      />
      <Tab.Screen
        name={SCREENS.CUSTOMER_PROFILE}
        component={ProfileStack}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default CustomerNavigator;