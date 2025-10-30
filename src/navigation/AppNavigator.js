import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { navigationRef } from './NavigationService';

// Navigators
import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import KurirNavigator from './KurirNavigator';

import { COLORS, ROLES } from '../utils/constants';

const AppNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Determine which navigator to show based on auth status and role
  const getNavigator = () => {
    // Not authenticated -> Show Auth screens
    if (!isAuthenticated || !user) {
      return <AuthNavigator />;
    }

    // Authenticated -> Show navigator based on role
    switch (user.role) {
      case ROLES.CUSTOMER:
        return <CustomerNavigator />;
      case ROLES.KURIR:
        return <KurirNavigator />;
      case ROLES.ADMIN:
        // Admin tidak ada akses mobile, redirect ke login
        return <AuthNavigator />;
      default:
        return <AuthNavigator />;
    }
  };

  return (
    <NavigationContainer ref={navigationRef}>
      {getNavigator()}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});

export default AppNavigator;