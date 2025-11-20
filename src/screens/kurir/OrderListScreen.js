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

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pesanan');

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

    if (filter === 'diproses') {
      filtered = filtered.filter((o) => o.status === 'diproses');
    } else if (filter === 'dikirim') {
      filtered = filtered.filter((o) => o.status === 'dikirim');
    }

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
      { key: 'all', label: 'Semua' },
      { key: 'diproses', label: 'Diproses' },
      { key: 'dikirim', label: 'Dikirim' },
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
      {/* Navigation Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => {
            setActiveTab('dashboard');
            navigation.navigate('KurirHome');
          }}
        >
          {activeTab === 'dashboard' && <View style={styles.tabIndicator} />}
          <Text style={[
            styles.tabText, 
            activeTab === 'dashboard' && styles.tabTextActive
          ]}>
            Dashboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => setActiveTab('pesanan')}
        >
          {activeTab === 'pesanan' && <View style={styles.tabIndicator} />}
          <Text style={[
            styles.tabText, 
            activeTab === 'pesanan' && styles.tabTextActive
          ]}>
            Pesanan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => {
            setActiveTab('riwayat');
            navigation.navigate('KurirHistory');
          }}
        >
          {activeTab === 'riwayat' && <View style={styles.tabIndicator} />}
          <Text style={[
            styles.tabText, 
            activeTab === 'riwayat' && styles.tabTextActive
          ]}>
            Riwayat
          </Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.pageTitle}>Pesanan Saya</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari Pesanan atau Customer.."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={COLORS.textLight}
        />
        <Icon name="search" size={20} color={COLORS.textLight} />
      </View>

      {/* Filter Chips */}
      {renderFilterChips()}

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
    backgroundColor: COLORS.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.lg,
    backgroundColor: COLORS.white,
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
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: SIZES.md,
    marginTop: SIZES.md,
    marginBottom: SIZES.md,
    backgroundColor: COLORS.light,
    borderRadius: SIZES.radiusFull,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.sm,
    alignItems: 'center',
    borderRadius: SIZES.radiusFull,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusFull,
    zIndex: -1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.md,
    marginBottom: SIZES.md,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.md,
    gap: SIZES.sm,
  },
  filterChip: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#4CAF50',
  },
  filterChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  filterTextActive: {
    color: COLORS.white,
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