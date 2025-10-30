import apiClient from './client';

/**
 * Get Katalog Produk
 * @param {Object} params - {jenis: 'elpiji'|'galon', stok_tersedia: true|false}
 * @returns {Promise}
 */
export const getProduk = async (params = {}) => {
  try {
    const response = await apiClient.get('/customer/produk.php', { params });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Create Pesanan Baru
 * @param {Object} data - {items: [{id_produk, jumlah}], metode_bayar: 'cash'|'transfer'}
 * @returns {Promise}
 */
export const createPesanan = async (data) => {
  try {
    const response = await apiClient.post('/customer/pesanan.php', data);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get Pesanan Aktif (menunggu, diproses, dikirim)
 * @returns {Promise}
 */
export const getPesananAktif = async () => {
  try {
    const response = await apiClient.get('/customer/pesanan.php');
    return response;
  } catch (error) {
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
    const response = await apiClient.get('/customer/riwayat.php', { params });
    return response;
  } catch (error) {
    throw error;
  }
};