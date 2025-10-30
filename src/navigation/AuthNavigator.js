import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { SCREENS, COLORS } from '../utils/constants';

const Stack = createStackNavigator();

const AuthNavigator = () => {
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
        name={SCREENS.LOGIN}
        component={LoginScreen}
        options={{
          title: 'Login',
          headerShown: false, // Hide header untuk login screen
        }}
      />
      <Stack.Screen
        name={SCREENS.REGISTER}
        component={RegisterScreen}
        options={{
          title: 'Daftar Akun',
          headerShown: false, // Hide header untuk register screen
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;