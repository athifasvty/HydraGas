import apiClient from './client';

/**
 * Login
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise}
 */
export const login = async (username, password) => {
  try {
    console.log('=== LOGIN DEBUG ===');
    console.log('Base URL:', apiClient.defaults.baseURL);
    console.log('Full URL:', apiClient.defaults.baseURL + '/auth/login.php');
    console.log('Data:', { username, password });
    
    const response = await apiClient.post('/auth/login.php', {
      username,
      password,
    });
    
    console.log('✅ Login Response:', response);
    return response;
  } catch (error) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error:', error);
    throw error;
  }
};

/**
 * Register (Customer only)
 * @param {Object} data - {name, username, password, phone, address}
 * @returns {Promise}
 */
export const register = async (data) => {
  try {
    console.log('=== REGISTER DEBUG ===');
    console.log('Base URL:', apiClient.defaults.baseURL);
    console.log('Full URL:', apiClient.defaults.baseURL + '/auth/register.php');
    console.log('Data:', data);
    
    const response = await apiClient.post('/auth/register.php', data);
    
    console.log('✅ Register Response:', response);
    return response;
  } catch (error) {
    console.error('=== REGISTER ERROR ===');
    console.error('Error:', error);
    throw error;
  }
};

/**
 * Logout (client-side only - hapus token)
 */
export const logout = async () => {
  // Backend kamu ga ada endpoint logout, jadi cukup clear token di client
  return { success: true, message: 'Logout berhasil' };
};