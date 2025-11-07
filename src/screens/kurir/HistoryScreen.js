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
import { getPesananKurir } from '../../api/kurir';
import { formatCurrency, formatDateShort, formatDateTime } from '../../utils/formatters';
import { COLORS, SIZES, STATUS_LABELS, STATUS_COLORS } from '../../utils/constants';

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [selectedFilter, setSelectedFilter] = useState('all'); // all, selesai, bulan_ini

  const [statistics, setStatistics] = useState({
    total_pengiriman: 0,
    total_pendapatan: 0,
    bulan_ini: 0,
  });

  // Fetch history
  const fetchHistory = async (isRefresh = false) => {
  try {
    if (!isRefresh) setLoading(true);
    setError(null);

    console.log('📜 Fetching history...');

    // ✅ FIX: Kirim params dengan benar
    const params = { status: 'selesai' };
    
    console.log('📤 Request params:', params);

    const response = await getPesananKurir(params);

    console.log('📥 Full Response:', JSON.stringify(response, null, 2));

    if (response.success) {
      const pesanan = Array.isArray(response.data?.pesanan)
        ? response.data.pesanan
        : Array.isArray(response.data)
        ? response.data
        : [];

      console.log('📦 History count:', pesanan.length);

      // Hitung statistik
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();

      const bulanIni = pesanan.filter((p) => {
        const date = new Date(p.tanggal_pesan);
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
      });

      const stats = {
        total_pengiriman: pesanan.length,
        total_pendapatan: pesanan.reduce(
          (sum, p) => sum + parseFloat(p.total_harga || 0),
          0
        ),
        bulan_ini: bulanIni.length,
      };

      console.log('📊 Statistics:', stats);

      setStatistics(stats);
      setHistory(pesanan);
      applyFilter(pesanan, selectedFilter);
    } else {
      console.log('❌ Error response:', response);
      setError(response.message || 'Gagal mengambil data riwayat');
    }
  } catch (err) {
    console.error('💥 Catch Error:', err);
    console.error('💥 Error Message:', err.message);
    setError(err.message || 'Terjadi kesalahan');
  } finally {
    setLoading(false);
    if (isRefresh) setRefreshing(false);
  }
};

  // Apply filter
  const applyFilter = (data, filter) => {
    let filtered = [...data];

    if (filter === 'selesai') {
      filtered = filtered.filter((h) => h.status === 'selesai');
    } else if (filter === 'bulan_ini') {
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();

      filtered = filtered.filter((h) => {
        const date = new Date(h.tanggal_pesan);
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
      });
    }
    // 'all' tidak perlu filter

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.tanggal_pesan) - new Date(a.tanggal_pesan));

    setFilteredHistory(filtered);
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    applyFilter(history, filter);
  };

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory(true);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, []);

  // Get status badge style
  const getStatusBadgeStyle = (status) => {
    return {
      backgroundColor: STATUS_COLORS[status] || COLORS.gray,
    };
  };

  // Render statistics card
  const renderStatistics = () => {
    return (
      <View style={styles.statisticsContainer}>
        <Text style={styles.statisticsTitle}>Statistik Pengiriman</Text>
        <View style={styles.statisticsGrid}>
          <View style={styles.statCard}>
            <Icon name="checkmark-done-circle" size={32} color={COLORS.success} />
            <Text style={styles.statValue}>{statistics.total_pengiriman}</Text>
            <Text style={styles.statLabel}>Total Pengiriman</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="calendar" size={32} color={COLORS.primary} />
            <Text style={styles.statValue}>{statistics.bulan_ini}</Text>
            <Text style={styles.statLabel}>Bulan Ini</Text>
          </View>

          <View style={[styles.statCard, styles.statCardWide]}>
            <Icon name="wallet" size={32} color="#9C27B0" />
            <Text style={styles.statValue}>
              {formatCurrency(statistics.total_pendapatan)}
            </Text>
            <Text style={styles.statLabel}>Total Pendapatan</Text>
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
      { key: 'bulan_ini', label: 'Bulan Ini', icon: 'calendar' },
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
          navigation.navigate('KurirOrderDetail', { orderId: item.id })
        }
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.orderIdContainer}>
            <Icon name="receipt-outline" size={18} color={COLORS.primary} />
            <Text style={styles.orderId}>#{item.id}</Text>
          </View>
          <View style={[styles.statusBadge, getStatusBadgeStyle(item.status)]}>
            <Text style={styles.statusText}>{STATUS_LABELS[item.status]}</Text>
          </View>
        </View>

        {/* Date */}
        <View style={styles.dateRow}>
          <Icon name="calendar-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.dateText}>
            {formatDateShort(item.tanggal_pesan)}
          </Text>
        </View>

        {/* Customer Info */}
        <View style={styles.customerRow}>
          <Icon name="person-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.customerText}>{item.nama_customer}</Text>
        </View>

        <View style={styles.customerRow}>
          <Icon name="location-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.addressText} numberOfLines={1}>
            {item.alamat_customer}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.itemsInfo}>
            <Icon name="cube-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.itemsText}>{item.jumlah_item} Item</Text>
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(item.total_harga)}
            </Text>
          </View>

          <Icon name="chevron-forward" size={20} color={COLORS.primary} />
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchHistory}>
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredHistory}
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
                ? 'Riwayat pengiriman Anda akan muncul di sini'
                : selectedFilter === 'selesai'
                ? 'Tidak ada pesanan dengan status "Selesai"'
                : 'Tidak ada pengiriman bulan ini'}
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
    textAlign: 'center',
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
    marginBottom: SIZES.sm,
  },
  dateText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
    marginBottom: SIZES.xs,
  },
  customerText: {
    flex: 1,
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.text,
  },
  addressText: {
    flex: 1,
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.sm,
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  itemsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: SIZES.md,
  },
  itemsText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: SIZES.fontXs,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SIZES.xl,
    minHeight: 300,
    justifyContent: 'center',
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
