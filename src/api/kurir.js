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

/**
 * Upload Bukti Pengiriman
 * @param {number} id_pesanan - ID pesanan
 * @param {Object} foto - Image object dari react-native-image-picker
 * @param {string} catatan - Catatan opsional (misal: "Diterima oleh Ibu Siti")
 * @returns {Promise}
 */
export const uploadBuktiPengiriman = async (id_pesanan, foto, catatan = '') => {
  try {
    console.log('📤 uploadBuktiPengiriman called');
    console.log('- ID Pesanan:', id_pesanan);
    console.log('- Foto:', foto);
    
    // Create FormData untuk multipart/form-data
    const formData = new FormData();
    formData.append('id_pesanan', id_pesanan);
    
    // Append foto
    formData.append('foto', {
      uri: foto.uri,
      type: foto.type || 'image/jpeg',
      name: foto.fileName || `photo_${Date.now()}.jpg`,
    });
    
    // Append catatan jika ada
    if (catatan) {
      formData.append('catatan', catatan);
    }
    
    console.log('📤 FormData prepared');
    
    // Upload dengan header multipart/form-data
    const response = await apiClient.post('/kurir/upload-bukti.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('✅ Upload response:', response);
    
    return response;
  } catch (error) {
    console.error('❌ uploadBuktiPengiriman error:', error);
    console.error('❌ Error response:', error.response?.data);
    throw error;
  }
};