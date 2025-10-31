import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getPesananAktif } from '../../api/customer';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { COLORS, SIZES, STATUS_LABELS, STATUS_COLORS } from '../../utils/constants';

const OrderScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch pesanan aktif
  const fetchOrders = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      const response = await getPesananAktif();

      if (response.success) {
        setOrders(response.data);
      } else {
        setError(response.message || 'Gagal mengambil data pesanan');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders(true);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Auto refresh setiap 30 detik
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Get status badge style
  const getStatusBadgeStyle = (status) => {
    return {
      backgroundColor: STATUS_COLORS[status] || COLORS.gray,
    };
  };

  // Render order card
  const renderOrderCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() =>
          navigation.navigate('CustomerOrderDetail', { orderId: item.id })
        }
      >
        {/* Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderIdContainer}>
            <Icon name="receipt-outline" size={18} color={COLORS.primary} />
            <Text style={styles.orderId}>Pesanan #{item.id}</Text>
          </View>
          <View style={[styles.statusBadge, getStatusBadgeStyle(item.status)]}>
            <Text style={styles.statusText}>
              {STATUS_LABELS[item.status]}
            </Text>
          </View>
        </View>

        {/* Order Info */}
        <View style={styles.orderInfo}>
          <View style={styles.infoRow}>
            <Icon name="calendar-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.infoText}>
              {formatDateTime(item.tanggal_pesan)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="cube-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.infoText}>{item.jumlah_item} Item</Text>
          </View>

          {item.nama_kurir && (
            <View style={styles.infoRow}>
              <Icon name="person-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.infoText}>Kurir: {item.nama_kurir}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.orderFooter}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(item.total_harga)}
            </Text>
          </View>

          <View style={styles.detailButton}>
            <Text style={styles.detailButtonText}>Lihat Detail</Text>
            <Icon name="chevron-forward" size={18} color={COLORS.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Memuat pesanan...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle" size={64} color={COLORS.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="cube-outline" size={100} color={COLORS.gray} />
        <Text style={styles.emptyText}>Belum Ada Pesanan Aktif</Text>
        <Text style={styles.emptySubtext}>
          Pesanan Anda akan muncul di sini
        </Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('CustomerHome')}
        >
          <Text style={styles.shopButtonText}>Mulai Belanja</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Info Header */}
      <View style={styles.infoHeader}>
        <Icon name="information-circle" size={20} color={COLORS.primary} />
        <Text style={styles.infoHeaderText}>
          Pesanan akan diperbarui otomatis setiap 30 detik
        </Text>
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  retryButton: {
    marginTop: SIZES.lg,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: SIZES.sm,
    gap: SIZES.sm,
  },
  infoHeaderText: {
    flex: 1,
    fontSize: SIZES.fontSm,
    color: COLORS.primary,
  },
  listContent: {
    padding: SIZES.md,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
    paddingBottom: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  orderId: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusFull,
  },
  statusText: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.white,
  },
  orderInfo: {
    gap: SIZES.sm,
    marginBottom: SIZES.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  infoText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailButtonText: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
  },
  emptyText: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.md,
  },
  emptySubtext: {
    fontSize: SIZES.fontMd,
    color: COLORS.textLight,
    marginTop: SIZES.sm,
    textAlign: 'center',
  },
  shopButton: {
    marginTop: SIZES.lg,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
  },
  shopButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
});

export default OrderScreen;