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
  Image,
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

  // Get product image based on type
  const getProductImage = (jenis) => {
    if (jenis === 'elpiji') {
      return require('../../assets/images/gas.png');
    } else {
      return require('../../assets/images/galon.png');
    }
  };

  // Render Filter Chips
  const renderFilterChips = () => {
    const filters = [
      { key: 'semua', label: 'All', icon: 'list' },
      { key: 'elpiji', label: 'Gas LPG', icon: 'flame' },
      { key: 'galon', label: 'Air Galon', icon: 'water' },
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

  // Render Product Card
  const renderProductCard = ({ item }) => {
    const inCart = isInCart(item.id);
    const cartQty = getItemQuantity(item.id);
    const isOutOfStock = item.stok <= 0;

    return (
      <View style={styles.productCard}>
        {/* Product Image */}
        <Image
          source={getProductImage(item.jenis)}
          style={styles.productImage}
          resizeMode="cover"
        />

        {/* Product Name */}
        <Text style={styles.productName} numberOfLines={2}>
          {item.nama_produk}
        </Text>

        {/* Stock Info */}
        <Text style={styles.stockText}>Stok: {item.stok}</Text>

        {/* Product Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>{formatCurrency(item.harga)}</Text>
          
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
              name="add"
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>

        {/* Stock Info */}
        {isOutOfStock && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Stok Habis</Text>
          </View>
        )}

        {/* Cart Info */}
        {inCart && !isOutOfStock && (
          <View style={styles.inCartBadge}>
            <Text style={styles.inCartText}>{cartQty} di keranjang</Text>
          </View>
        )}
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
        <View style={styles.headerLeft}>
          <Text style={styles.headerGreeting}>Selamat datang,</Text>
          <Text style={styles.headerName}>{user?.name || 'bina'}!</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Icon name="person-circle" size={40} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={styles.tab}>
          <Icon name="cube" size={20} color={COLORS.primary} />
          <Text style={styles.tabText}>Produk</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => navigation.navigate('CustomerCart')}
        >
          <Icon name="cart" size={20} color={COLORS.textLight} />
          <Text style={[styles.tabText, styles.tabTextInactive]}>Keranjang</Text>
          {cartItems.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => navigation.navigate('CustomerOrders')}
        >
          <Icon name="receipt" size={20} color={COLORS.textLight} />
          <Text style={[styles.tabText, styles.tabTextInactive]}>Pesanan</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.sectionTitle}>Produk Kami</Text>

      {/* Filter Chips */}
      {renderFilterChips()}

      {/* Product Grid */}
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
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SIZES.md,
    paddingTop: SIZES.lg,
    backgroundColor: COLORS.white,
  },
  headerLeft: {
    flex: 1,
  },
  headerGreeting: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  headerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  profileButton: {
    padding: SIZES.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
    backgroundColor: COLORS.white,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.sm,
    gap: 6,
    position: 'relative',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  tabTextInactive: {
    color: COLORS.textLight,
  },
  tabBadge: {
    position: 'absolute',
    top: 0,
    right: '25%',
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: SIZES.md,
    paddingTop: SIZES.md,
    paddingBottom: SIZES.sm,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.md,
    gap: SIZES.sm,
  },
  filterChip: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#4CAF50',
  },
  filterChipActive: {
    backgroundColor: '#4CAF50',
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
    paddingBottom: SIZES.xl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
  },
  productCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: SIZES.radiusSm,
    marginBottom: SIZES.sm,
    backgroundColor: COLORS.light,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
    minHeight: 36,
  },
  stockText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: SIZES.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.xs,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: SIZES.sm,
    right: SIZES.sm,
    backgroundColor: COLORS.danger,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
  },
  outOfStockText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  inCartBadge: {
    marginTop: SIZES.xs,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: SIZES.xs,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
    alignSelf: 'flex-start',
  },
  inCartText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '600',
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