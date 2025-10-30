import { createNavigationContainerRef } from '@react-navigation/native';

// Create navigation reference
export const navigationRef = createNavigationContainerRef();

/**
 * Navigate to screen
 * @param {string} name - Screen name
 * @param {Object} params - Navigation params
 */
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

/**
 * Go back
 */
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

/**
 * Reset navigation
 * @param {string} routeName - Screen name to reset to
 */
export function reset(routeName) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: routeName }],
    });
  }
}

/**
 * Get current route name
 */
export function getCurrentRoute() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute();
  }
  return null;
}

// Export default object
export default {
  navigate,
  goBack,
  reset,
  getCurrentRoute,
};