import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getDetailPesananKurir, updateStatusPesanan } from '../../api/kurir';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  COLORS,
  SIZES,
  STATUS_LABELS,
  STATUS_COLORS,
  PAYMENT_LABELS,
} from '../../utils/constants';

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Fetch order detail
  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📋 Fetching order detail:', orderId);

      const response = await getDetailPesananKurir(orderId);

      console.log('✅ Response:', response);

      if (response.success) {
        setOrder(response.data);
      } else {
        setError(response.message || 'Pesanan tidak ditemukan');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  // Handle update status
  const handleUpdateStatus = async (newStatus) => {
    const statusLabels = {
      dikirim: 'Mulai Antar',
      selesai: 'Selesaikan',
    };

    const confirmMessages = {
      dikirim: 'Mulai mengantarkan pesanan ini?',
      selesai: 'Tandai pesanan ini sebagai selesai?',
    };

    Alert.alert(
      statusLabels[newStatus],
      confirmMessages[newStatus],
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Lanjutkan',
          onPress: () => updateStatus(newStatus),
        },
      ]
    );
  };

  // Update status to API
  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);

      console.log('🔄 Updating status to:', newStatus);

      const response = await updateStatusPesanan(orderId, newStatus);

      console.log('✅ Update response:', response);

      if (response.success) {
        Alert.alert(
          'Berhasil!',
          `Status pesanan berhasil diubah menjadi "${STATUS_LABELS[newStatus]}"`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Refresh data
                fetchOrderDetail();
              },
            },
          ]
        );
      } else {
        Alert.alert('Gagal', response.message || 'Gagal mengubah status');
      }
    } catch (error) {
      console.error('❌ Update error:', error);
      Alert.alert('Error', error.message || 'Terjadi kesalahan');
    } finally {
      setUpdating(false);
    }
  };

  // Handle call customer
  const handleCallCustomer = () => {
    if (!order?.phone_customer) {
      Alert.alert('Error', 'Nomor telepon customer tidak tersedia');
      return;
    }

    const phoneNumber = `tel:${order.phone_customer}`;

    Alert.alert(
      'Hubungi Customer',
      `Telepon ${order.nama_customer}?\n${order.phone_customer}`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Telepon',
          onPress: () => {
            Linking.openURL(phoneNumber).catch(() => {
              Alert.alert('Error', 'Tidak dapat membuka aplikasi telepon');
            });
          },
        },
      ]
    );
  };

  // Get status badge style
  const getStatusBadgeStyle = (status) => {
    return {
      backgroundColor: STATUS_COLORS[status] || COLORS.gray,
    };
  };

  // Render timeline step
  const renderTimelineStep = (status, label, isActive, isCompleted) => {
    return (
      <View style={styles.timelineStep} key={status}>
        <View style={styles.timelineIconContainer}>
          <View
            style={[
              styles.timelineIcon,
              isCompleted && styles.timelineIconCompleted,
              isActive && styles.timelineIconActive,
            ]}
          >
            {isCompleted ? (
              <Icon name="checkmark" size={16} color={COLORS.white} />
            ) : (
              <View style={styles.timelineDot} />
            )}
          </View>
          {status !== 'selesai' && <View style={styles.timelineLine} />}
        </View>
        <View style={styles.timelineContent}>
          <Text
            style={[
              styles.timelineLabel,
              (isActive || isCompleted) && styles.timelineLabelActive,
            ]}
          >
            {label}
          </Text>
        </View>
      </View>
    );
  };

  // Get timeline steps
  const getTimelineSteps = () => {
    if (!order) return [];

    const currentStatus = order.status;
    const steps = [
      { status: 'menunggu', label: 'Menunggu Konfirmasi' },
      { status: 'diproses', label: 'Sedang Diproses' },
      { status: 'dikirim', label: 'Sedang Dikirim' },
      { status: 'selesai', label: 'Selesai' },
    ];

    const currentIndex = steps.findIndex((s) => s.status === currentStatus);

    return steps.map((step, index) => ({
      ...step,
      isCompleted: index < currentIndex,
      isActive: index === currentIndex,
    }));
  };

  // Render action buttons
  const renderActionButtons = () => {
    if (!order) return null;

    if (order.status === 'diproses') {
      return (
        <TouchableOpacity
          style={[styles.actionButton, styles.startButton]}
          onPress={() => handleUpdateStatus('dikirim')}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Icon name="bicycle" size={24} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Mulai Antar</Text>
            </>
          )}
        </TouchableOpacity>
      );
    }

    if (order.status === 'dikirim') {
      return (
        <TouchableOpacity
          style={[styles.actionButton, styles.completeButton]}
          onPress={() => handleUpdateStatus('selesai')}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Icon name="checkmark-circle" size={24} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Pesanan Selesai</Text>
            </>
          )}
        </TouchableOpacity>
      );
    }

    if (order.status === 'selesai') {
      return (
        <View style={[styles.actionButton, styles.completedButton]}>
          <Icon name="checkmark-done-circle" size={24} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Pesanan Telah Selesai</Text>
        </View>
      );
    }

    return null;
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Memuat detail pesanan...</Text>
      </View>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle" size={64} color={COLORS.danger} />
        <Text style={styles.errorText}>{error || 'Pesanan tidak ditemukan'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Banner */}
        <View style={[styles.statusBanner, getStatusBadgeStyle(order.status)]}>
          <Icon name="information-circle" size={24} color={COLORS.white} />
          <Text style={styles.statusBannerText}>
            {STATUS_LABELS[order.status]}
          </Text>
        </View>

        {/* Order Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Pesanan</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Nomor Pesanan</Text>
              <Text style={styles.infoValue}>#{order.id}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tanggal Pesan</Text>
              <Text style={styles.infoValue}>
                {formatDateTime(order.tanggal_pesan)}
              </Text>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Pengiriman</Text>
          <View style={styles.timeline}>
            {getTimelineSteps().map((step) =>
              renderTimelineStep(
                step.status,
                step.label,
                step.isActive,
                step.isCompleted
              )
            )}
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Customer</Text>
          <View style={styles.customerCard}>
            <View style={styles.customerHeader}>
              <View style={styles.customerIconContainer}>
                <Icon name="person" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.customerDetails}>
                <Text style={styles.customerName}>{order.nama_customer}</Text>
                <TouchableOpacity
                  style={styles.phoneButton}
                  onPress={handleCallCustomer}
                >
                  <Icon name="call" size={16} color={COLORS.primary} />
                  <Text style={styles.phoneText}>{order.phone_customer}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.callButton}
                onPress={handleCallCustomer}
              >
                <Icon name="call" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.addressContainer}>
              <Icon name="location" size={18} color={COLORS.textLight} />
              <Text style={styles.addressText}>{order.alamat_customer}</Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daftar Produk</Text>
          <View style={styles.itemsList}>
            {order.items?.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemIcon}>
                  <Icon
                    name={item.jenis === 'elpiji' ? 'flame' : 'water'}
                    size={24}
                    color={
                      item.jenis === 'elpiji' ? COLORS.danger : COLORS.info
                    }
                  />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.nama_produk}</Text>
                  <Text style={styles.itemPrice}>
                    {formatCurrency(item.harga_satuan)} × {item.jumlah}
                  </Text>
                </View>
                <Text style={styles.itemSubtotal}>
                  {formatCurrency(item.subtotal)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pembayaran</Text>
          <View style={styles.paymentInfo}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Metode Pembayaran</Text>
              <Text style={styles.paymentValue}>
                {PAYMENT_LABELS[order.metode_bayar]}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Status Pembayaran</Text>
              <Text
                style={[
                  styles.paymentValue,
                  {
                    color:
                      order.status_bayar === 'sudah_bayar'
                        ? COLORS.success
                        : COLORS.warning,
                  },
                ]}
              >
                {order.status_bayar === 'sudah_bayar'
                  ? 'Sudah Dibayar'
                  : 'Belum Dibayar'}
              </Text>
            </View>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Pesanan</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(order.total_harga)}
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Action Buttons (Fixed at bottom) */}
      {order.status !== 'selesai' && (
        <View style={styles.actionButtonContainer}>
          {renderActionButtons()}
        </View>
      )}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.lg,
  },
  loadingText: {
    marginTop: SIZES.md,
    fontSize: SIZES.fontMd,
    color: COLORS.textLight,
  },
  errorText: {
    marginTop: SIZES.md,
    fontSize: SIZES.fontMd,
    color: COLORS.danger,
    textAlign: 'center',
  },
  backButton: {
    marginTop: SIZES.lg,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.md,
    gap: SIZES.sm,
  },
  statusBannerText: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    marginTop: SIZES.sm,
  },
  sectionTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  infoGrid: {
    gap: SIZES.md,
  },
  infoItem: {
    gap: 4,
  },
  infoLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
  },
  infoValue: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
  },
  timeline: {
    paddingLeft: SIZES.sm,
  },
  timelineStep: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  timelineIconContainer: {
    alignItems: 'center',
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineIconActive: {
    backgroundColor: COLORS.primary,
  },
  timelineIconCompleted: {
    backgroundColor: COLORS.success,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.white,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginTop: 4,
    minHeight: 40,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: SIZES.md,
  },
  timelineLabel: {
    fontSize: SIZES.fontMd,
    color: COLORS.textLight,
    marginTop: 6,
  },
  timelineLabelActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  customerCard: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  customerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneText: {
    fontSize: SIZES.fontSm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressContainer: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  addressText: {
    flex: 1,
    fontSize: SIZES.fontMd,
    color: COLORS.text,
    lineHeight: 20,
  },
  itemsList: {
    gap: SIZES.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
  },
  itemSubtotal: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  paymentInfo: {
    gap: SIZES.md,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: SIZES.fontMd,
    color: COLORS.textLight,
  },
  paymentValue: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalSection: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    marginTop: SIZES.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: SIZES.fontLg,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: SIZES.fontXxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  actionButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    gap: SIZES.sm,
  },
  startButton: {
    backgroundColor: COLORS.warning,
  },
  completeButton: {
    backgroundColor: COLORS.success,
  },
  completedButton: {
    backgroundColor: COLORS.gray,
  },
  actionButtonText: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default OrderDetailScreen;
