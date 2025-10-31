import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getProduk } from '../../api/customer';
import { formatCurrency } from '../../utils/formatters';
import { COLORS, SIZES } from '../../utils/constants';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { addToCart, isInCart, getItemQuantity, cartItems } = useCart();

  const [produk, setProduk] = useState([]);
  const [filteredProduk, setFilteredProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('semua');

  // Fetch produk dari API
  const fetchProduk = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      const response = await getProduk({ stok_tersedia: true });
      
      if (response.success) {
        setProduk(response.data);
        applyFilter(response.data, selectedFilter);
      } else {
        setError(response.message || 'Gagal mengambil data produk');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  // Apply filter
  const applyFilter = (data, filter) => {
    if (filter === 'semua') {
      setFilteredProduk(data);
    } else {
      setFilteredProduk(data.filter((item) => item.jenis === filter));
    }
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    applyFilter(produk, filter);
  };

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProduk(true);
  }, []);

  // Handle add to cart
  const handleAddToCart = (product) => {
    if (product.stok <= 0) {
      Alert.alert('Stok Habis', 'Maaf, produk ini sedang tidak tersedia.');
      return;
    }

    const currentQty = getItemQuantity(product.id);
    if (currentQty >= product.stok) {
      Alert.alert(
        'Stok Terbatas',
        `Maksimal pembelian ${product.stok} item untuk produk ini.`
      );
      return;
    }

    addToCart(product, 1);
    Alert.alert('Berhasil', `${product.nama_produk} ditambahkan ke keranjang`, [
      { text: 'OK' },
      {
        text: 'Lihat Keranjang',
        onPress: () => navigation.navigate('CustomerCart'),
      },
    ]);
  };

  useEffect(() => {
    fetchProduk();
  }, []);

  // Render Filter Chips
  const renderFilterChips = () => {
    const filters = [
      { key: 'semua', label: 'Semua', icon: 'list' },
      { key: 'elpiji', label: 'Gas Elpiji', icon: 'flame' },
      { key: 'galon', label: 'Galon Air', icon: 'water' },
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

  // Render Product Card
  const renderProductCard = ({ item }) => {
    const inCart = isInCart(item.id);
    const cartQty = getItemQuantity(item.id);
    const isOutOfStock = item.stok <= 0;
    const isLowStock = item.stok > 0 && item.stok < 10;

    return (
      <View style={styles.productCard}>
        {/* Product Icon */}
        <View
          style={[
            styles.productIcon,
            { backgroundColor: item.jenis === 'elpiji' ? '#FFE5E5' : '#E3F2FD' },
          ]}
        >
          <Icon
            name={item.jenis === 'elpiji' ? 'flame' : 'water'}
            size={32}
            color={item.jenis === 'elpiji' ? '#F44336' : '#2196F3'}
          />
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.nama_produk}</Text>
          <Text style={styles.productPrice}>{formatCurrency(item.harga)}</Text>

          {/* Stock Badge */}
          <View style={styles.stockBadgeContainer}>
            {isOutOfStock ? (
              <View style={[styles.stockBadge, styles.stockBadgeEmpty]}>
                <Text style={styles.stockBadgeText}>Habis</Text>
              </View>
            ) : isLowStock ? (
              <View style={[styles.stockBadge, styles.stockBadgeLow]}>
                <Text style={styles.stockBadgeText}>
                  Stok Terbatas ({item.stok})
                </Text>
              </View>
            ) : (
              <View style={[styles.stockBadge, styles.stockBadgeAvailable]}>
                <Text style={styles.stockBadgeText}>Tersedia ({item.stok})</Text>
              </View>
            )}
          </View>

          {/* Cart Quantity Info */}
          {inCart && (
            <View style={styles.cartInfo}>
              <Icon name="cart" size={14} color={COLORS.primary} />
              <Text style={styles.cartInfoText}>{cartQty} di keranjang</Text>
            </View>
          )}
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity
          style={[
            styles.addButton,
            isOutOfStock && styles.addButtonDisabled,
          ]}
          onPress={() => handleAddToCart(item)}
          disabled={isOutOfStock}
        >
          <Icon
            name="add-circle"
            size={36}
            color={isOutOfStock ? COLORS.gray : COLORS.primary}
          />
        </TouchableOpacity>
      </View>
    );
  };

  // Loading State
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Memuat produk...</Text>
      </View>
    );
  }

  // Error State
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle" size={64} color={COLORS.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProduk}>
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Halo,</Text>
          <Text style={styles.headerName}>{user?.name || 'Customer'}</Text>
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('CustomerCart')}
        >
          <Icon name="cart" size={28} color={COLORS.white} />
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      {renderFilterChips()}

      {/* Product List */}
      {filteredProduk.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="cube-outline" size={80} color={COLORS.gray} />
          <Text style={styles.emptyText}>Tidak ada produk tersedia</Text>
          <Text style={styles.emptySubtext}>
            {selectedFilter !== 'semua'
              ? 'Coba pilih kategori lain'
              : 'Produk sedang kosong'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProduk}
          renderItem={renderProductCard}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.md,
    backgroundColor: COLORS.primary,
  },
  headerGreeting: {
    fontSize: SIZES.fontSm,
    color: COLORS.white,
    opacity: 0.9,
  },
  headerName: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  cartButton: {
    position: 'relative',
    padding: SIZES.sm,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.danger,
    borderRadius: SIZES.radiusFull,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xs,
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: SIZES.md,
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
  listContent: {
    padding: SIZES.md,
    paddingBottom: SIZES.xl,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productIcon: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  productPrice: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  stockBadgeContainer: {
    marginTop: SIZES.xs,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
  },
  stockBadgeAvailable: {
    backgroundColor: '#E8F5E9',
  },
  stockBadgeLow: {
    backgroundColor: '#FFF3E0',
  },
  stockBadgeEmpty: {
    backgroundColor: '#FFEBEE',
  },
  stockBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
  },
  cartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.xs,
    gap: 4,
  },
  cartInfoText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  addButton: {
    padding: SIZES.xs,
  },
  addButtonDisabled: {
    opacity: 0.3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
  },
  emptyText: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.md,
  },
  emptySubtext: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
    marginTop: SIZES.xs,
    textAlign: 'center',
  },
});

export default HomeScreen;