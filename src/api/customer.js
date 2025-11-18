import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../utils/constants';
import apiClient from './client';

/**
 * Get Katalog Produk
 * @param {Object} params - {jenis: 'elpiji'|'galon', stok_tersedia: true|false}
 * @returns {Promise}
 */
export const getProduk = async (params = {}) => {
  try {
    console.log('📦 Fetching products with params:', params);
    const response = await apiClient.get('/customer/produk.php', { params });
    console.log('✅ Products fetched:', response.data?.length || 0, 'items');
    return response;
  } catch (error) {
    console.error('❌ Get produk error:', error.message);
    throw error;
  }
};

/**
 * Create Pesanan Baru
 * @param {Object} data - {items: [{id_produk, jumlah}], metode_bayar: 'cash'|'qris', bukti_pembayaran: 'filename.jpg'}
 * @returns {Promise}
 */
export const createPesanan = async (data) => {
  try {
    console.log('=== CREATE PESANAN ===');
    console.log('📤 Sending order data:', JSON.stringify(data, null, 2));
    
    const response = await apiClient.post('/customer/pesanan.php', data);
    
    console.log('✅ Order created successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Create pesanan error:', error);
    console.error('❌ Error message:', error.message);
    
    // Throw error dengan message yang jelas
    throw {
      success: false,
      message: error.message || 'Gagal membuat pesanan',
      needsLogin: error.needsLogin || false,
    };
  }
};

/**
 * Get Pesanan Aktif (menunggu, diproses, dikirim)
 * @returns {Promise}
 */
export const getPesananAktif = async () => {
  try {
    console.log('📋 Fetching active orders...');
    const response = await apiClient.get('/customer/pesanan.php');
    console.log('✅ Active orders fetched:', response.data?.length || 0, 'orders');
    return response;
  } catch (error) {
    console.error('❌ Get pesanan aktif error:', error.message);
    throw error;
  }
};

/**
 * Get Riwayat Pesanan (selesai, dibatalkan)
 * @param {Object} params - {status: 'selesai'|'dibatalkan', limit: 50}
 * @returns {Promise}
 */
export const getRiwayat = async (params = {}) => {
  try {
    console.log('📜 Fetching order history with params:', params);
    const response = await apiClient.get('/customer/riwayat.php', { params });
    console.log('✅ History fetched:', response.data?.riwayat?.length || 0, 'orders');
    return response;
  } catch (error) {
    console.error('❌ Get riwayat error:', error.message);
    throw error;
  }
};

/**
 * Upload bukti pembayaran QRIS
 * @param {string} imageUri - URI gambar dari image picker
 * @param {string} idPesanan - ID pesanan (opsional, default 'temp')
 * @returns {Promise}
 */
export const uploadBuktiBayar = async (imageUri, idPesanan = 'temp') => {
  try {
    console.log('📤 Uploading bukti pembayaran...');
    console.log('- Image URI:', imageUri);
    console.log('- ID Pesanan:', idPesanan);
    
    const formData = new FormData();
    
    // Ambil filename dari URI
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('bukti', {
      uri: imageUri,
      name: filename,
      type: type,
    });
    
    formData.append('id_pesanan', idPesanan);
    
    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login kembali.');
    }
    
    console.log('🔑 Token found, uploading...');
    
    // Upload menggunakan fetch (karena FormData)
    const response = await fetch(`${API_CONFIG.BASE_URL}/customer/upload-bukti.php`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // JANGAN tambahkan Content-Type, biar browser yang set otomatis untuk multipart/form-data
      },
      body: formData,
    });
    
    const data = await response.json();
    
    console.log('✅ Upload response:', data);
    
    if (!data.success) {
      throw new Error(data.message || 'Gagal upload bukti pembayaran');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Upload Bukti Error:', error);
    throw error;
  }
};