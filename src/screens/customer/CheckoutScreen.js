import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { createPesanan, uploadBuktiBayar } from '../../api/customer';
import { formatCurrency } from '../../utils/formatters';
import { COLORS, SIZES, PAYMENT_METHODS, PAYMENT_LABELS, ONGKIR_FLAT } from '../../utils/constants';

const { width } = Dimensions.get('window');

const CheckoutScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { cartItems, getTotalPrice, getCartItemsForAPI, clearCart } = useCart();

  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS.CASH);
  const [loading, setLoading] = useState(false);
  const [buktiPembayaran, setBuktiPembayaran] = useState(null);
  const [uploadingBukti, setUploadingBukti] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

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
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
    }
  };

  // Handle pick image from gallery
  const handlePickImage = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Gagal memilih gambar');
      } else if (response.assets && response.assets[0]) {
        setBuktiPembayaran(response.assets[0]);
      }
    });
  };

  // Handle take photo from camera
  const handleTakePhoto = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
      saveToPhotos: false,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Gagal mengambil foto');
      } else if (response.assets && response.assets[0]) {
        setBuktiPembayaran(response.assets[0]);
      }
    });
  };

  // Show image picker options
  const showImagePickerOptions = () => {
    Alert.alert(
      'Upload Bukti Pembayaran',
      'Pilih sumber gambar',
      [
        {
          text: 'Ambil Foto',
          onPress: () => handleTakePhoto(),
        },
        {
          text: 'Pilih dari Galeri',
          onPress: () => handlePickImage(),
        },
        {
          text: 'Batal',
          style: 'cancel',
        },
      ]
    );
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

    // Validasi bukti pembayaran untuk QRIS
    if (selectedPayment === PAYMENT_METHODS.QRIS && !buktiPembayaran) {
      Alert.alert('Bukti Pembayaran Diperlukan', 'Silakan upload bukti pembayaran QRIS terlebih dahulu');
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

      let buktiFilename = null;

      // Upload bukti jika QRIS
      if (selectedPayment === PAYMENT_METHODS.QRIS && buktiPembayaran) {
        console.log('📤 Uploading bukti pembayaran...');
        setUploadingBukti(true);
        
        try {
          const uploadResponse = await uploadBuktiBayar(buktiPembayaran.uri, 'temp');
          
          if (uploadResponse.success) {
            buktiFilename = uploadResponse.data.filename;
            console.log('✅ Bukti uploaded:', buktiFilename);
          } else {
            throw new Error(uploadResponse.message || 'Gagal upload bukti');
          }
        } catch (uploadError) {
          console.error('❌ Upload Error:', uploadError);
          throw {
            success: false,
            message: 'Gagal upload bukti pembayaran. ' + uploadError.message,
          };
        } finally {
          setUploadingBukti(false);
        }
      }

      // Prepare order data
      const orderData = {
        items: getCartItemsForAPI(),
        metode_bayar: selectedPayment,
        ongkir: ongkir,
        bukti_pembayaran: buktiFilename,
      };

      console.log('📤 Order Data:', JSON.stringify(orderData, null, 2));

      const response = await createPesanan(orderData);

      console.log('✅ Order Response:', response);

      if (response.success) {
        // Clear cart and bukti
        clearCart();
        setBuktiPembayaran(null);

        // Show success
        Alert.alert(
          'Pesanan Berhasil! 🎉',
          `Nomor Pesanan: #${response.data.id_pesanan}\nSubtotal: ${formatCurrency(response.data.subtotal)}\nOngkir: ${formatCurrency(response.data.ongkir)}\nTotal: ${formatCurrency(response.data.total_harga)}\n\nPesanan Anda sedang diproses.`,
          [
            {
              text: 'Lihat Pesanan',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'CustomerHome' }],
                });
                
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
        onPress={() => {
          setSelectedPayment(method);
          // Reset bukti jika ganti ke CASH
          if (method === PAYMENT_METHODS.CASH) {
            setBuktiPembayaran(null);
          }
        }}
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
              PAYMENT_METHODS.QRIS,
              PAYMENT_LABELS.qris,
              'qr-code'
            )}
          </View>
        </View>

        {/* QRIS Section - Only show when QRIS is selected */}
        {selectedPayment === PAYMENT_METHODS.QRIS && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="qr-code" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Pembayaran QRIS</Text>
            </View>
            
            {/* QR Code Display */}
            <View style={styles.qrisContainer}>
              <TouchableOpacity 
                style={styles.qrCodeWrapper}
                onPress={() => setShowQRModal(true)}
              >
                <Image
                  source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=DUMMY-QRIS-GAS-GALON-PEMBAYARAN' }}
                  style={styles.qrCodeImage}
                  resizeMode="contain"
                />
                <View style={styles.qrOverlay}>
                  <Icon name="expand" size={24} color={COLORS.white} />
                  <Text style={styles.qrOverlayText}>Tap untuk perbesar</Text>
                </View>
              </TouchableOpacity>

              {/* Instructions */}
              <View style={styles.qrisInstructions}>
                <Text style={styles.instructionTitle}>
                  <Icon name="information-circle" size={16} color={COLORS.primary} />
                  {' '}Cara Bayar:
                </Text>
                <Text style={styles.instructionText}>
                  1. Buka aplikasi e-wallet Anda (DANA, OVO, GoPay, dll)
                </Text>
                <Text style={styles.instructionText}>
                  2. Scan QR Code di atas
                </Text>
                <Text style={styles.instructionText}>
                  3. Masukkan nominal: <Text style={styles.instructionAmount}>{formatCurrency(total)}</Text>
                </Text>
                <Text style={styles.instructionText}>
                  4. Selesaikan pembayaran
                </Text>
                <Text style={styles.instructionText}>
                  5. Screenshot bukti dan upload di bawah
                </Text>
              </View>

              {/* Upload Bukti Section */}
              <View style={styles.uploadSection}>
                <Text style={styles.uploadLabel}>
                  Upload Bukti Pembayaran <Text style={styles.required}>*</Text>
                </Text>
                
                {buktiPembayaran ? (
                  <View style={styles.buktiPreview}>
                    <Image
                      source={{ uri: buktiPembayaran.uri }}
                      style={styles.buktiImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeBuktiBtn}
                      onPress={() => setBuktiPembayaran(null)}
                    >
                      <Icon name="close-circle" size={24} color={COLORS.danger} />
                    </TouchableOpacity>
                    <View style={styles.buktiInfo}>
                      <Icon name="checkmark-circle" size={20} color={COLORS.success} />
                      <Text style={styles.buktiInfoText}>Bukti berhasil dipilih</Text>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={showImagePickerOptions}
                  >
                    <Icon name="cloud-upload" size={32} color={COLORS.primary} />
                    <Text style={styles.uploadButtonText}>Upload Bukti Transfer</Text>
                    <Text style={styles.uploadButtonHint}>JPG, PNG (Max 5MB)</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

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
          style={[styles.orderButton, (loading || uploadingBukti) && styles.orderButtonDisabled]}
          onPress={handleCheckout}
          disabled={loading || uploadingBukti}
        >
          {loading || uploadingBukti ? (
            <>
              <ActivityIndicator color={COLORS.white} />
              <Text style={styles.orderButtonText}>
                {uploadingBukti ? 'Upload Bukti...' : 'Memproses...'}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.orderButtonText}>Buat Pesanan</Text>
              <Icon name="checkmark-circle" size={24} color={COLORS.white} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* QR Code Modal - Fullscreen */}
      <Modal
        visible={showQRModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setShowQRModal(false)}
            >
              <Icon name="close" size={32} color={COLORS.white} />
            </TouchableOpacity>
            <Image
              source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=DUMMY-QRIS-GAS-GALON-PEMBAYARAN' }}
              style={styles.qrCodeImageLarge}
              resizeMode="contain"
            />
            <Text style={styles.modalTitle}>Scan QR Code untuk Bayar</Text>
            <Text style={styles.modalAmount}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </Modal>
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
  // QRIS Styles
  qrisContainer: {
    paddingLeft: SIZES.lg,
    paddingRight: SIZES.lg,
  },
  qrCodeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: SIZES.md,
    position: 'relative',
  },
  qrCodeImage: {
    width: width * 0.6,
    height: width * 0.6,
    maxWidth: 250,
    maxHeight: 250,
  },
  qrOverlay: {
    position: 'absolute',
    bottom: SIZES.md,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusSm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  qrOverlayText: {
    color: COLORS.white,
    fontSize: SIZES.fontSm,
  },
  qrisInstructions: {
    backgroundColor: '#E3F2FD',
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.md,
  },
  instructionTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.sm,
  },
  instructionText: {
    fontSize: SIZES.fontSm,
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  instructionAmount: {
    fontWeight: 'bold',
    color: COLORS.success,
  },
  uploadSection: {
    marginTop: SIZES.sm,
  },
  uploadLabel: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  required: {
    color: COLORS.danger,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F9FF',
  },
  uploadButtonText: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: SIZES.sm,
  },
  uploadButtonHint: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
    marginTop: 4,
  },
  buktiPreview: {
    position: 'relative',
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  buktiImage: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.light,
  },
  removeBuktiBtn: {
    position: 'absolute',
    top: SIZES.sm,
    right: SIZES.sm,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusFull,
  },
  buktiInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    padding: SIZES.sm,
    gap: SIZES.sm,
  },
  buktiInfoText: {
    color: COLORS.white,
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    alignItems: 'center',
    padding: SIZES.xl,
  },
  closeModalBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  qrCodeImageLarge: {
    width: width * 0.8,
    height: width * 0.8,
    maxWidth: 350,
    maxHeight: 350,
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    marginTop: SIZES.lg,
  },
  modalAmount: {
    color: COLORS.success,
    fontSize: SIZES.fontXxl,
    fontWeight: 'bold',
    marginTop: SIZES.sm,
  },
});

export default CheckoutScreen;