import apiClient from './client';

/**
 * Get List Pesanan Kurir
 * @param {Object} params - {status: 'diproses'|'dikirim'|'selesai', id: 123}
 * @returns {Promise}
 */
export const getPesananKurir = async (params = {}) => {
  try {
    console.log('📤 getPesananKurir called with params:', params);
    console.log('🔗 Full URL:', apiClient.defaults.baseURL + '/kurir/pesanan.php');
    
    const response = await apiClient.get('/kurir/pesanan.php', { params });
    
    console.log('📥 getPesananKurir response:', response);
    
    return response;
  } catch (error) {
    console.error('❌ getPesananKurir error:', error);
    console.error('❌ Error response:', error.response?.data);
    throw error;
  }
};

/**
 * Get Detail Pesanan Kurir
 * @param {number} id - ID pesanan
 * @returns {Promise}
 */
export const getDetailPesananKurir = async (id) => {
  try {
    const response = await apiClient.get('/kurir/pesanan.php', {
      params: { id }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Update Status Pesanan
 * @param {number} id_pesanan 
 * @param {string} status - 'dikirim' | 'selesai'
 * @returns {Promise}
 */
export const updateStatusPesanan = async (id_pesanan, status) => {
  try {
    const response = await apiClient.put('/kurir/update_status.php', {
      id_pesanan,
      status,
    });
    return response;
  } catch (error) {
    throw error;
  }
};