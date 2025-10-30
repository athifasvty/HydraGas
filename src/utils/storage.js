import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Keys
 */
const KEYS = {
  TOKEN: 'token',
  USER: 'user',
};

/**
 * Save Token
 */
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem(KEYS.TOKEN, token);
    return true;
  } catch (error) {
    console.error('Error saving token:', error);
    return false;
  }
};

/**
 * Get Token
 */
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem(KEYS.TOKEN);
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Remove Token
 */
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.TOKEN);
    return true;
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
};

/**
 * Save User Data
 */
export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
};

/**
 * Get User Data
 */
export const getUser = async () => {
  try {
    const userString = await AsyncStorage.getItem(KEYS.USER);
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

/**
 * Remove User Data
 */
export const removeUser = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.USER);
    return true;
  } catch (error) {
    console.error('Error removing user:', error);
    return false;
  }
};

/**
 * Clear All Data (Logout)
 */
export const clearStorage = async () => {
  try {
    await AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER]);
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

/**
 * Check if user is logged in
 */
export const isLoggedIn = async () => {
  try {
    const token = await getToken();
    const user = await getUser();
    return !!(token && user);
  } catch (error) {
    return false;
  }
};