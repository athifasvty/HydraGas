/**
 * API Configuration
 * Ganti IP_ADDRESS dengan IP laptop kamu
 */
export const API_CONFIG = {
  BASE_URL: 'http://192.168.18.16/api_gas_galon/api', 
  TIMEOUT: 10000,
};

/**
 * User Roles
 */
export const ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  KURIR: 'kurir',
};

/**
 * Status Pesanan
 */
export const ORDER_STATUS = {
  MENUNGGU: 'menunggu',
  DIPROSES: 'diproses',
  DIKIRIM: 'dikirim',
  SELESAI: 'selesai',
  DIBATALKAN: 'dibatalkan',
};

/**
 * Status Labels (untuk display)
 */
export const STATUS_LABELS = {
  menunggu: 'Menunggu Konfirmasi',
  diproses: 'Sedang Diproses',
  dikirim: 'Sedang Dikirim',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
};

/**
 * Status Colors
 */
export const STATUS_COLORS = {
  menunggu: '#FF9800', // Orange
  diproses: '#2196F3', // Blue
  dikirim: '#9C27B0', // Purple
  selesai: '#4CAF50', // Green
  dibatalkan: '#F44336', // Red
};

/**
 * Metode Pembayaran
 */
export const PAYMENT_METHODS = {
  CASH: 'cash',
  QRIS: 'qris', // ✅ Changed from TRANSFER to QRIS
};

/**
 * Payment Method Labels
 */
export const PAYMENT_LABELS = {
  cash: 'Bayar di Tempat (COD)',
  qris: 'QRIS (Scan & Bayar)', // ✅ Updated label
};

/**
 * Jenis Produk
 */
export const PRODUCT_TYPES = {
  ELPIJI: 'elpiji',
  GALON: 'galon',
};

/**
 * Product Type Labels
 */
export const PRODUCT_TYPE_LABELS = {
  elpiji: 'Gas Elpiji',
  galon: 'Galon Air',
};

/**
 * Ongkir Configuration
 */
export const ONGKIR_FLAT = 10000; // Rp 10.000 - Sesuaikan dengan kebutuhan

/**
 * App Colors
 */
export const COLORS = {
  primary: '#1E88E5',
  secondary: '#FFC107',
  success: '#4CAF50',
  danger: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  light: '#F5F5F5',
  dark: '#212121',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#9E9E9E',
  border: '#E0E0E0',
  background: '#FAFAFA',
  text: '#333333',
  textLight: '#757575',
};

/**
 * App Sizes
 */
export const SIZES = {
  // Padding & Margin
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  
  // Font Sizes
  fontXs: 12,
  fontSm: 14,
  fontMd: 16,
  fontLg: 18,
  fontXl: 20,
  fontXxl: 24,
  
  // Border Radius
  radiusSm: 4,
  radiusMd: 8,
  radiusLg: 12,
  radiusXl: 16,
  radiusFull: 999,
};

/**
 * Screen Names (untuk navigation)
 */
export const SCREENS = {
  // Auth
  LOGIN: 'Login',
  REGISTER: 'Register',
  
  // Customer
  CUSTOMER_HOME: 'CustomerHome',
  CUSTOMER_CART: 'CustomerCart',
  CUSTOMER_CHECKOUT: 'CustomerCheckout',
  CUSTOMER_ORDERS: 'CustomerOrders',
  CUSTOMER_ORDER_DETAIL: 'CustomerOrderDetail',
  CUSTOMER_HISTORY: 'CustomerHistory',
  CUSTOMER_PROFILE: 'CustomerProfile',
  
  // Kurir
  KURIR_HOME: 'KurirHome',
  KURIR_ORDERS: 'KurirOrders',
  KURIR_ORDER_DETAIL: 'KurirOrderDetail',
  KURIR_HISTORY: 'KurirHistory',
  KURIR_PROFILE: 'KurirProfile',
};