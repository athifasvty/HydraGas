import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ganti dengan IP address laptop/server kamu
// Cek IP: ipconfig (Windows) atau ifconfig (Mac/Linux)
const API_URL = 'http://192.168.117.206/api_gas_galon'; // 👈 GANTI INI

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
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
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Return data langsung kalau success
    return response.data;
  },
  async (error) => {
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
      // Clear token dan redirect ke login
      await AsyncStorage.multiRemove(['token', 'user']);
      // NavigationService bisa dipanggil di sini kalau sudah setup
      return Promise.reject({
        success: false,
        message: 'Sesi Anda telah berakhir. Silakan login kembali.',
      });
    }

    // Handle 403 Forbidden
    if (status === 403) {
      return Promise.reject({
        success: false,
        message: 'Akses ditolak. Anda tidak memiliki izin.',
      });
    }

    // Handle 500 Server Error
    if (status === 500) {
      return Promise.reject({
        success: false,
        message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
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