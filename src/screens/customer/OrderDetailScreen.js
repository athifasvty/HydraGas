import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getPesananAktif, getRiwayat } from '../../api/customer';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  COLORS,
  SIZES,
  STATUS_LABELS,
  STATUS_COLORS,
  PAYMENT_LABELS,
} from '../../utils/constants';

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId, fromHistory } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch order detail
  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      
      // Cek dari mana user datang
      if (fromHistory) {
        // Dari history, fetch dari API riwayat
        response = await getRiwayat();
        
        if (response.success) {
          const foundOrder = response.data.riwayat?.find((o) => o.id === orderId);
          if (foundOrder) {
            setOrder(foundOrder);
          } else {
            setError('Pesanan tidak ditemukan');
          }
        } else {
          setError(response.message || 'Gagal mengambil data pesanan');
        }
      } else {
        // Dari pesanan aktif, fetch dari API pesanan aktif
        response = await getPesananAktif();
        
        if (response.success) {
          const foundOrder = response.data.find((o) => o.id === orderId);
          if (foundOrder) {
            setOrder(foundOrder);
          } else {
            setError('Pesanan tidak ditemukan');
          }
        } else {
          setError(response.message || 'Gagal mengambil data pesanan');
        }
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  // Get status badge style
  const getStatusBadgeStyle = (status) => {
    return {
      backgroundColor: STATUS_COLORS[status] || COLORS.gray,
    };
  };

  // Render timeline step
  const renderTimelineStep = (status, label, isActive, isCompleted) => {
    return (
      <View style={styles.timelineStep}>
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
          {status !== 'selesai' && status !== 'dibatalkan' && (
            <View style={styles.timelineLine} />
          )}
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
    const currentStatus = order?.status;
    
    // Kalau dibatalkan, tampilkan timeline khusus
    if (currentStatus === 'dibatalkan') {
      return [
        { status: 'menunggu', label: 'Menunggu Konfirmasi', isCompleted: true, isActive: false },
        { status: 'dibatalkan', label: 'Pesanan Dibatalkan', isCompleted: false, isActive: true },
      ];
    }
    
    // Timeline normal untuk selesai atau aktif
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Status Banner */}
      <View style={[styles.statusBanner, getStatusBadgeStyle(order.status)]}>
        <Icon name="information-circle" size={24} color={COLORS.white} />
        <Text style={styles.statusBannerText}>
          {STATUS_LABELS[order.status]}
        </Text>
      </View>

      {/* Order Info Section */}
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

      {/* Timeline Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {order.status === 'dibatalkan' ? 'Status Pesanan' : 'Status Pengiriman'}
        </Text>
        <View style={styles.timeline}>
          {getTimelineSteps().map((step, index) =>
            renderTimelineStep(
              step.status,
              step.label,
              step.isActive,
              step.isCompleted
            )
          )}
        </View>
      </View>

      {/* Kurir Info (jika ada dan status bukan dibatalkan) */}
      {order.nama_kurir && order.status !== 'dibatalkan' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Kurir</Text>
          <View style={styles.kurirInfo}>
            <View style={styles.kurirIconContainer}>
              <Icon name="person" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.kurirDetails}>
              <Text style={styles.kurirName}>{order.nama_kurir}</Text>
              {order.phone_kurir && (
                <TouchableOpacity
                  style={styles.phoneButton}
                  onPress={() => Alert.alert('Hubungi Kurir', order.phone_kurir)}
                >
                  <Icon name="call" size={16} color={COLORS.primary} />
                  <Text style={styles.phoneText}>{order.phone_kurir}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Items Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daftar Produk</Text>
        <View style={styles.itemsList}>
          {order.items?.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.nama_produk}</Text>
                <Text style={styles.itemPrice}>
                  {formatCurrency(item.harga_satuan)} x {item.jumlah}
                </Text>
              </View>
              <Text style={styles.itemSubtotal}>
                {formatCurrency(item.subtotal)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Payment Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pembayaran</Text>
        <View style={styles.paymentInfo}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Metode Pembayaran</Text>
            <Text style={styles.paymentValue}>
              {PAYMENT_LABELS[order.metode_bayar]}
            </Text>
          </View>
          {order.status_bayar && (
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
          )}
        </View>
      </View>

      {/* Price Breakdown Section - BARU! */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rincian Harga</Text>
        <View style={styles.priceBreakdown}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Subtotal Produk ({order.jumlah_item} item)
            </Text>
            <Text style={styles.priceValue}>
              {formatCurrency(order.subtotal || 0)}
            </Text>
          </View>
          
          <View style={styles.priceRow}>
            <View style={styles.ongkirContainer}>
              <Icon name="car-outline" size={18} color={COLORS.textLight} />
              <Text style={styles.priceLabel}>Ongkos Kirim</Text>
            </View>
            <Text style={styles.priceValue}>
              {formatCurrency(order.ongkir || 0)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Pembayaran</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(order.total_harga)}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: SIZES.xl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  kurirInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
    padding: SIZES.md,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusMd,
  },
  kurirIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kurirDetails: {
    flex: 1,
  },
  kurirName: {
    fontSize: SIZES.fontMd,
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
  },
  itemsList: {
    gap: SIZES.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  priceBreakdown: {
    gap: SIZES.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.xs,
  },
  ongkirContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceLabel: {
    fontSize: SIZES.fontMd,
    color: COLORS.textLight,
  },
  priceValue: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SIZES.xs,
  },
  totalLabel: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: SIZES.fontXxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default OrderDetailScreen;