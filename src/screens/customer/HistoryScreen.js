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
import { getRiwayat } from '../../api/customer';
import { formatCurrency, formatDateTime, formatDateShort } from '../../utils/formatters';
import { COLORS, SIZES, STATUS_LABELS, STATUS_COLORS } from '../../utils/constants';

const HistoryScreen = ({ navigation }) => {
  const [riwayat, setRiwayat] = useState([]);
  const [statistik, setStatistik] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, selesai, dibatalkan

  // Fetch riwayat
  const fetchRiwayat = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      const params = {};
      if (selectedFilter !== 'all') {
        params.status = selectedFilter;
      }

      const response = await getRiwayat(params);

      if (response.success) {
        setRiwayat(response.data.riwayat || []);
        setStatistik(response.data.statistik || null);
      } else {
        setError(response.message || 'Gagal mengambil data riwayat');
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
    fetchRiwayat(true);
  }, [selectedFilter]);

  useEffect(() => {
    fetchRiwayat();
  }, [selectedFilter]);

  // Handle filter change
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  // Get status badge style
  const getStatusBadgeStyle = (status) => {
    return {
      backgroundColor: STATUS_COLORS[status] || COLORS.gray,
    };
  };

  // Render statistics card
  const renderStatistics = () => {
    if (!statistik) return null;

    return (
      <View style={styles.statisticsContainer}>
        <Text style={styles.statisticsTitle}>Statistik Belanja Anda</Text>
        <View style={styles.statisticsGrid}>
          <View style={styles.statCard}>
            <Icon name="checkmark-circle" size={28} color={COLORS.success} />
            <Text style={styles.statValue}>{statistik.total_selesai}</Text>
            <Text style={styles.statLabel}>Selesai</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="close-circle" size={28} color={COLORS.danger} />
            <Text style={styles.statValue}>{statistik.total_dibatalkan}</Text>
            <Text style={styles.statLabel}>Dibatalkan</Text>
          </View>

          <View style={[styles.statCard, styles.statCardWide]}>
            <Icon name="wallet" size={28} color={COLORS.primary} />
            <Text style={styles.statValue}>
              {formatCurrency(statistik.total_belanja)}
            </Text>
            <Text style={styles.statLabel}>Total Belanja</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render filter chips
  const renderFilterChips = () => {
    const filters = [
      { key: 'all', label: 'Semua', icon: 'list' },
      { key: 'selesai', label: 'Selesai', icon: 'checkmark-circle' },
      { key: 'dibatalkan', label: 'Dibatalkan', icon: 'close-circle' },
    ];

    return (
      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.filterChipActive,
            ]}
            onPress={() => handleFilterChange(filter.key)}
          >
            <Icon
              name={filter.icon}
              size={18}
              color={
                selectedFilter === filter.key ? COLORS.white : COLORS.primary
              }
              style={styles.filterIcon}
            />
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render history card
  const renderHistoryCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.historyCard}
        onPress={() =>
          navigation.navigate('CustomerOrderDetail', { orderId: item.id })
        }
      >
        {/* Header */}
        <View style={styles.cardHeader}>
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

        {/* Date */}
        <View style={styles.dateRow}>
          <Icon name="calendar-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.dateText}>
            {formatDateShort(item.tanggal_pesan)}
          </Text>
        </View>

        {/* Items Preview */}
        <View style={styles.itemsPreview}>
          {item.items?.slice(0, 2).map((product, index) => (
            <View key={index} style={styles.itemPreviewRow}>
              <Text style={styles.itemPreviewName} numberOfLines={1}>
                {product.nama_produk}
              </Text>
              <Text style={styles.itemPreviewQty}>x{product.jumlah}</Text>
            </View>
          ))}
          {item.items?.length > 2 && (
            <Text style={styles.moreItems}>
              +{item.items.length - 2} produk lainnya
            </Text>
          )}
        </View>

        {/* Payment Info */}
        <View style={styles.paymentRow}>
          <View style={styles.paymentInfo}>
            <Icon name="card-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.paymentText}>
              {item.metode_bayar === 'cash' ? 'COD' : 'Transfer'}
            </Text>
          </View>
          {item.status_bayar && (
            <View
              style={[
                styles.paymentStatusBadge,
                {
                  backgroundColor:
                    item.status_bayar === 'sudah_bayar'
                      ? '#E8F5E9'
                      : '#FFF3E0',
                },
              ]}
            >
              <Text
                style={[
                  styles.paymentStatusText,
                  {
                    color:
                      item.status_bayar === 'sudah_bayar'
                        ? COLORS.success
                        : COLORS.warning,
                  },
                ]}
              >
                {item.status_bayar === 'sudah_bayar'
                  ? 'Lunas'
                  : 'Belum Bayar'}
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(item.total_harga)}
            </Text>
          </View>

          <View style={styles.detailButton}>
            <Text style={styles.detailButtonText}>Detail</Text>
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
        <Text style={styles.loadingText}>Memuat riwayat...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle" size={64} color={COLORS.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRiwayat}>
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={riwayat}
        renderItem={renderHistoryCard}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            {renderStatistics()}
            {renderFilterChips()}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="time-outline" size={80} color={COLORS.gray} />
            <Text style={styles.emptyText}>Belum Ada Riwayat</Text>
            <Text style={styles.emptySubtext}>
              {selectedFilter === 'all'
                ? 'Riwayat pesanan Anda akan muncul di sini'
                : `Tidak ada pesanan dengan status "${
                    selectedFilter === 'selesai' ? 'Selesai' : 'Dibatalkan'
                  }"`}
            </Text>
          </View>
        }
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
  listContent: {
    flexGrow: 1,
  },
  statisticsContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
  },
  statisticsTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  statisticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: COLORS.background,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    gap: SIZES.xs,
  },
  statCardWide: {
    minWidth: '100%',
  },
  statValue: {
    fontSize: SIZES.fontXxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: SIZES.md,
    gap: SIZES.sm,
    backgroundColor: COLORS.white,
    marginBottom: SIZES.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterIcon: {
    marginRight: SIZES.xs,
  },
  filterText: {
    fontSize: SIZES.fontSm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginHorizontal: SIZES.md,
    marginBottom: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
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
    fontSize: SIZES.fontXs,
    fontWeight: '600',
    color: COLORS.white,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
    marginBottom: SIZES.md,
  },
  dateText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
  },
  itemsPreview: {
    marginBottom: SIZES.md,
    paddingVertical: SIZES.sm,
    gap: SIZES.xs,
  },
  itemPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPreviewName: {
    flex: 1,
    fontSize: SIZES.fontSm,
    color: COLORS.text,
  },
  itemPreviewQty: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
    marginLeft: SIZES.sm,
  },
  moreItems: {
    fontSize: SIZES.fontXs,
    color: COLORS.primary,
    fontStyle: 'italic',
    marginTop: SIZES.xs,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
    paddingBottom: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  paymentText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
  },
  paymentStatusBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
  },
  paymentStatusText: {
    fontSize: SIZES.fontXs,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    minHeight: 300,
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
});

export default HistoryScreen;