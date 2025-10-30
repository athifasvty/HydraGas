import React, { createContext, useState, useEffect, useContext } from 'react';
import { saveToken, saveUser, getToken, getUser, clearStorage } from '../utils/storage';
import { login as loginAPI, register as registerAPI, logout as logoutAPI } from '../api/auth';

// Create Context
const AuthContext = createContext();

// Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in (saat app pertama kali dibuka)
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check authentication status
   */
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const storedToken = await getToken();
      const storedUser = await getUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login function
   */
  const login = async (username, password) => {
    try {
      const response = await loginAPI(username, password);

      if (response.success) {
        const { token: newToken, user: newUser } = response.data;

        // Save to state
        setToken(newToken);
        setUser(newUser);
        setIsAuthenticated(true);

        // Save to AsyncStorage
        await saveToken(newToken);
        await saveUser(newUser);

        return { success: true, user: newUser };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login gagal. Silakan coba lagi.',
      };
    }
  };

  /**
   * Register function (Customer only)
   */
  const register = async (data) => {
    try {
      const response = await registerAPI(data);

      if (response.success) {
        const { token: newToken, user: newUser } = response.data;

        // Save to state
        setToken(newToken);
        setUser(newUser);
        setIsAuthenticated(true);

        // Save to AsyncStorage
        await saveToken(newToken);
        await saveUser(newUser);

        return { success: true, user: newUser };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registrasi gagal. Silakan coba lagi.',
      };
    }
  };

  /**
   * Logout function
   */
  const logout = async () => {
    try {
      // Call logout API (optional, karena backend ga ada endpoint logout)
      await logoutAPI();

      // Clear state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);

      // Clear AsyncStorage
      await clearStorage();

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Logout gagal' };
    }
  };

  /**
   * Update user data (misal setelah update profile)
   */
  const updateUser = async (updatedUser) => {
    try {
      setUser(updatedUser);
      await saveUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false };
    }
  };

  // Context value
  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook untuk pakai AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;