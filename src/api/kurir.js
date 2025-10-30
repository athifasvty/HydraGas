import apiClient from './client';

/**
 * Get List Pesanan Kurir
 * @param {Object} params - {status: 'diproses'|'dikirim', id: 123}
 * @returns {Promise}
 */
export const getPesananKurir = async (params = {}) => {
  try {
    const response = await apiClient.get('/kurir/pesanan.php', { params });
    return response;
  } catch (error) {
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