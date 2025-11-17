import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { createPesanan } from '../../api/customer';
import { formatCurrency } from '../../utils/formatters';
import { COLORS, SIZES, PAYMENT_METHODS, PAYMENT_LABELS, ONGKIR_FLAT } from '../../utils/constants';

const CheckoutScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { cartItems, getTotalPrice, getCartItemsForAPI, clearCart } = useCart();

  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS.CASH);
  const [loading, setLoading] = useState(false);

  // Calculate prices
  const subtotal = getTotalPrice();
  const ongkir = ONGKIR_FLAT;
  const total = subtotal + ongkir;

  // Check auth on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Check if user is authenticated
  const checkAuthentication = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      console.log('🔐 Auth Check:');
      console.log('- Token:', token ? 'EXISTS ✅' : 'MISSING ❌');
      console.log('- User:', userData ? 'EXISTS ✅' : 'MISSING ❌');
      
      if (!token || !userData) {
        Alert.alert(
          'Sesi Berakhir',
          'Silakan login kembali untuk melanjutkan',
          [
            {
              text: 'OK',
              onPress: () => {
                logout();
                // Navigation will be handled by AuthContext
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
    }
  };

  // Validate before checkout
  const validateCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Keranjang Kosong', 'Tambahkan produk terlebih dahulu');
      return false;
    }

    if (!selectedPayment) {
      Alert.alert('Pilih Metode Pembayaran', 'Silakan pilih metode pembayaran terlebih dahulu');
      return false;
    }

    if (!user || !user.name || !user.phone || !user.address) {
      Alert.alert('Data Tidak Lengkap', 'Lengkapi profile Anda terlebih dahulu');
      return false;
    }

    return true;
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (!validateCheckout()) return;

    Alert.alert(
      'Konfirmasi Pesanan',
      `Subtotal: ${formatCurrency(subtotal)}\nOngkir: ${formatCurrency(ongkir)}\nTotal: ${formatCurrency(total)}\nMetode: ${PAYMENT_LABELS[selectedPayment]}\n\nLanjutkan pesanan?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Pesan',
          onPress: () => submitOrder(),
        },
      ]
    );
  };

  // Submit order to API
  const submitOrder = async () => {
    try {
      setLoading(true);

      // Final auth check
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw {
          success: false,
          message: 'Token tidak ditemukan. Silakan login kembali.',
          needsLogin: true,
        };
      }

      console.log('=== SUBMIT ORDER ===');
      console.log('🛒 Cart Items:', cartItems.length, 'items');
      console.log('💳 Payment Method:', selectedPayment);
      console.log('🚚 Ongkir:', ongkir);

      const orderData = {
        items: getCartItemsForAPI(),
        metode_bayar: selectedPayment,
        ongkir: ongkir, // Kirim ongkir ke backend
      };

      console.log('📤 Order Data:', JSON.stringify(orderData, null, 2));

      const response = await createPesanan(orderData);

      console.log('✅ Order Response:', response);

      if (response.success) {
        // Clear cart
        clearCart();

        // Show success
        Alert.alert(
          'Pesanan Berhasil! 🎉',
          `Nomor Pesanan: #${response.data.id_pesanan}\nSubtotal: ${formatCurrency(response.data.subtotal)}\nOngkir: ${formatCurrency(response.data.ongkir)}\nTotal: ${formatCurrency(response.data.total_harga)}\n\nPesanan Anda sedang diproses.`,
          [
            {
              text: 'Lihat Pesanan',
              onPress: () => {
                // Reset navigation to home, then go to orders
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'CustomerHome' }],
                });
                
                // Delay navigation to orders tab
                setTimeout(() => {
                  navigation.getParent()?.navigate('CustomerOrders');
                }, 100);
              },
            },
          ]
        );
      } else {
        throw {
          success: false,
          message: response.message || 'Gagal membuat pesanan',
        };
      }
    } catch (error) {
      console.error('❌ Submit Order Error:', error);

      // Handle token/login errors
      if (error.needsLogin) {
        Alert.alert(
          'Sesi Berakhir',
          'Silakan login kembali',
          [
            {
              text: 'OK',
              onPress: async () => {
                await logout();
              }
            }
          ]
        );
        return;
      }

      // Show error message
      Alert.alert(
        'Gagal Membuat Pesanan',
        error.message || 'Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.',
        [
          { text: 'OK' },
          {
            text: 'Coba Lagi',
            onPress: () => submitOrder(),
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Render order item
  const renderOrderItem = (item) => (
    <View key={item.id} style={styles.orderItem}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.nama_produk}</Text>
        <Text style={styles.itemQuantity}>x{item.quantity}</Text>
      </View>
      <Text style={styles.itemPrice}>
        {formatCurrency(item.harga * item.quantity)}
      </Text>
    </View>
  );

  // Render payment method
  const renderPaymentMethod = (method, label, icon) => {
    const isSelected = selectedPayment === method;

    return (
      <TouchableOpacity
        key={method}
        style={[
          styles.paymentMethod,
          isSelected && styles.paymentMethodActive,
        ]}
        onPress={() => setSelectedPayment(method)}
      >
        <Icon
          name={icon}
          size={24}
          color={isSelected ? COLORS.primary : COLORS.gray}
        />
        <Text
          style={[
            styles.paymentLabel,
            isSelected && styles.paymentLabelActive,
          ]}
        >
          {label}
        </Text>
        {isSelected && (
          <Icon
            name="checkmark-circle"
            size={24}
            color={COLORS.primary}
            style={styles.checkIcon}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="location" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Alamat Pengiriman</Text>
          </View>
          <View style={styles.deliveryInfo}>
            <Text style={styles.userName}>{user?.name || '-'}</Text>
            <Text style={styles.userPhone}>{user?.phone || '-'}</Text>
            <Text style={styles.userAddress}>{user?.address || '-'}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="cart" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Pesanan</Text>
          </View>
          <View style={styles.orderList}>
            {cartItems.map(renderOrderItem)}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="wallet" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
          </View>
          <View style={styles.paymentMethods}>
            {renderPaymentMethod(
              PAYMENT_METHODS.CASH,
              PAYMENT_LABELS.cash,
              'cash'
            )}
            {renderPaymentMethod(
              PAYMENT_METHODS.TRANSFER,
              PAYMENT_LABELS.transfer,
              'card'
            )}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="receipt" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Ringkasan Pesanan</Text>
          </View>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Subtotal ({cartItems.length} item)
              </Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(subtotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.ongkirContainer}>
                <Icon name="car-outline" size={18} color={COLORS.textLight} />
                <Text style={styles.summaryLabel}>Ongkos Kirim</Text>
              </View>
              <Text style={styles.summaryValue}>{formatCurrency(ongkir)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Pembayaran</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(total)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer - Place Order Button */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Total Pembayaran</Text>
          <Text style={styles.footerAmount}>
            {formatCurrency(total)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.orderButton, loading && styles.orderButtonDisabled]}
          onPress={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.orderButtonText}>Buat Pesanan</Text>
              <Icon name="checkmark-circle" size={24} color={COLORS.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    marginBottom: SIZES.sm,
    padding: SIZES.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
    gap: SIZES.sm,
  },
  sectionTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  deliveryInfo: {
    paddingLeft: SIZES.lg,
  },
  userName: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  userAddress: {
    fontSize: SIZES.fontSm,
    color: COLORS.text,
  },
  orderList: {
    paddingLeft: SIZES.lg,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  itemName: {
    fontSize: SIZES.fontMd,
    color: COLORS.text,
  },
  itemQuantity: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
  },
  itemPrice: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  paymentMethods: {
    paddingLeft: SIZES.lg,
    gap: SIZES.sm,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: SIZES.md,
  },
  paymentMethodActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#E3F2FD',
  },
  paymentLabel: {
    flex: 1,
    fontSize: SIZES.fontMd,
    color: COLORS.text,
  },
  paymentLabelActive: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  summary: {
    paddingLeft: SIZES.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
  },
  ongkirContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryLabel: {
    fontSize: SIZES.fontMd,
    color: COLORS.textLight,
  },
  summaryValue: {
    fontSize: SIZES.fontMd,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.sm,
  },
  totalLabel: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  footer: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  footerLabel: {
    fontSize: SIZES.fontMd,
    color: COLORS.textLight,
  },
  footerAmount: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  orderButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  orderButtonDisabled: {
    opacity: 0.6,
  },
  orderButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;