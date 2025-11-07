import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL API
const API_URL = 'http://10.79.187.206/api_gas_galon/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000, // Increase timeout ke 15 detik
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - attach token ke setiap request
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (token) {
        // Format: "Bearer TOKEN"
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token attached to request');
      } else {
        console.log('⚠️ No token found in storage');
      }
    } catch (error) {
      console.error('❌ Error getting token:', error);
    }
    
    console.log('📤 Request:', config.method.toUpperCase(), config.url);
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.config.url);
    // Return data langsung kalau success
    return response.data;
  },
  async (error) => {
    console.error('❌ Response error:', error.response?.status, error.message);
    
    // Handle network error
    if (!error.response) {
      return Promise.reject({
        success: false,
        message: 'Tidak ada koneksi internet. Periksa jaringan Anda.',
      });
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized (token expired/invalid)
    if (status === 401) {
      console.log('🚨 Unauthorized - Clearing token');
      // Clear token dan redirect ke login
      await AsyncStorage.multiRemove(['token', 'user']);
      
      return Promise.reject({
        success: false,
        message: data?.message || 'Sesi Anda telah berakhir. Silakan login kembali.',
        needsLogin: true, // Flag untuk handle di UI
      });
    }

    // Handle 403 Forbidden
    if (status === 403) {
      return Promise.reject({
        success: false,
        message: data?.message || 'Akses ditolak. Anda tidak memiliki izin.',
      });
    }

    // Handle 404 Not Found
    if (status === 404) {
      return Promise.reject({
        success: false,
        message: 'Endpoint tidak ditemukan. Periksa konfigurasi API.',
      });
    }

    // Handle 500 Server Error
    if (status === 500) {
      return Promise.reject({
        success: false,
        message: data?.message || 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
      });
    }

    // Return error message dari server
    return Promise.reject(data || {
      success: false,
      message: 'Terjadi kesalahan. Silakan coba lagi.',
    });
  }
);

export default apiClient;
export { API_URL };