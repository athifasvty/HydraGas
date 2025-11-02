import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getPesananKurir } from '../../api/kurir';
import { formatCurrency, formatDateTime, formatDateShort } from '../../utils/formatters';
import { COLORS, SIZES, STATUS_LABELS, STATUS_COLORS } from '../../utils/constants';

const OrderListScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [selectedFilter, setSelectedFilter] = useState('all'); // all, diproses, dikirim
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch orders
  const fetchOrders = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      console.log('📋 Fetching orders...');

      const response = await getPesananKurir();

      console.log('✅ Response:', response);

      if (response.success) {
        const pesanan = Array.isArray(response.data?.pesanan)
          ? response.data.pesanan
          : Array.isArray(response.data)
          ? response.data
          : [];

        console.log('📦 Orders count:', pesanan.length);

        setOrders(pesanan);
        applyFilters(pesanan, selectedFilter, searchQuery);
      } else {
        setError(response.message || 'Gagal mengambil data pesanan');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  // Apply filters
  const applyFilters = (data, filter, search) => {
    let filtered = [...data];

    // Filter by status
    if (filter === 'diproses') {
      filtered = filtered.filter((o) => o.status === 'diproses');
    } else if (filter === 'dikirim') {
      filtered = filtered.filter((o) => o.status === 'dikirim');
    }
    // 'all' tidak perlu filter

    // Search filter
    if (search.trim() !== '') {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.id.toString().includes(query) ||
          o.nama_customer?.toLowerCase().includes(query) ||
          o.alamat_customer?.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    applyFilters(orders, filter, searchQuery);
  };

  // Handle search
  const handleSearch = (text) => {
    setSearchQuery(text);
    applyFilters(orders, selectedFilter, text);
  };

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders(true);
  }, []);

  useEffect(() => {
    fetchOrders();

    // Auto refresh setiap 30 detik
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

  // Render filter chips
  const renderFilterChips = () => {
    const filters = [
      { key: 'all', label: 'Semua', icon: 'list' },
      { key: 'diproses', label: 'Diproses', icon: 'time' },
      { key: 'dikirim', label: 'Dikirim', icon: 'bicycle' },
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

  // Render order card
  const renderOrderCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() =>
          navigation.navigate('KurirOrderDetail', { orderId: item.id })
        }
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.orderIdContainer}>
            <Icon name="receipt-outline" size={18} color={COLORS.primary} />
            <Text style={styles.orderId}>#{item.id}</Text>
          </View>
          <View style={[styles.statusBadge, getStatusBadgeStyle(item.status)]}>
            <Text style={styles.statusText}>
              {STATUS_LABELS[item.status]}
            </Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Icon name="person" size={18} color={COLORS.text} />
            <Text style={styles.customerName}>{item.nama_customer}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="location" size={18} color={COLORS.textLight} />
            <Text style={styles.addressText} numberOfLines={2}>
              {item.alamat_customer}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="call" size={18} color={COLORS.textLight} />
            <Text style={styles.phoneText}>{item.phone_customer}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="calendar" size={18} color={COLORS.textLight} />
            <Text style={styles.dateText}>
              {formatDateShort(item.tanggal_pesan)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="cube" size={18} color={COLORS.textLight} />
            <Text style={styles.itemsText}>{item.jumlah_item} Item</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(item.total_harga)}
            </Text>
          </View>
          <View style={styles.arrowContainer}>
            <Icon name="chevron-forward" size={24} color={COLORS.primary} />
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

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={COLORS.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari pesanan atau customer..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={COLORS.textLight}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Icon name="close-circle" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      {renderFilterChips()}

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Icon name="information-circle" size={18} color={COLORS.primary} />
        <Text style={styles.infoText}>
          {filteredOrders.length} pesanan ditemukan
        </Text>
      </View>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="bicycle-outline" size={100} color={COLORS.gray} />
          <Text style={styles.emptyText}>Tidak Ada Pesanan</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery
              ? 'Tidak ada hasil untuk pencarian Anda'
              : selectedFilter === 'all'
              ? 'Belum ada pesanan yang perlu diantar'
              : `Tidak ada pesanan dengan status "${
                  selectedFilter === 'diproses' ? 'Diproses' : 'Dikirim'
                }"`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
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
      )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: SIZES.md,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radiusMd,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.sm,
    fontSize: SIZES.fontMd,
    color: COLORS.text,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.sm,
    gap: SIZES.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.white,
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    gap: SIZES.sm,
  },
  infoText: {
    fontSize: SIZES.fontSm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: SIZES.md,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  orderId: {
    fontSize: SIZES.fontLg,
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
  cardBody: {
    padding: SIZES.md,
    gap: SIZES.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  customerName: {
    flex: 1,
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addressText: {
    flex: 1,
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
  },
  phoneText: {
    flex: 1,
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
  },
  dateText: {
    flex: 1,
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
  },
  itemsText: {
    flex: 1,
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
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
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  arrowContainer: {
    padding: SIZES.xs,
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
});

export default OrderListScreen;