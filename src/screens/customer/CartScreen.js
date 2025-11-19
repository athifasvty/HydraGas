import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { COLORS, SIZES, ONGKIR_FLAT } from '../../utils/constants';

const CartScreen = ({ navigation }) => {
  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    getTotalPrice,
    clearCart,
  } = useCart();
  
  const { user } = useAuth();

  // Handle remove item
  const handleRemoveItem = (item) => {
    Alert.alert(
      'Hapus Item',
      `Hapus ${item.nama_produk} dari keranjang?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => removeFromCart(item.id),
        },
      ]
    );
  };

  // Handle clear cart
  const handleClearCart = () => {
    Alert.alert(
      'Kosongkan Keranjang',
      'Hapus semua item dari keranjang?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Semua',
          style: 'destructive',
          onPress: () => clearCart(),
        },
      ]
    );
  };

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Keranjang Kosong', 'Tambahkan produk terlebih dahulu');
      return;
    }
    navigation.navigate('CustomerCheckout');
  };

  // Handle edit profile
  const handleEditProfile = () => {
    navigation.navigate('CustomerProfile');
  };

  // Get product image based on type
  const getProductImage = (jenis) => {
    if (jenis === 'elpiji') {
      return require('../../assets/images/gas.png');
    } else {
      return require('../../assets/images/galon.png');
    }
  };

  // Calculate prices
  const subtotal = getTotalPrice();
  const ongkir = ONGKIR_FLAT;
  const total = subtotal + ongkir;

  // Render cart item
  const renderCartItem = ({ item }) => {
    const isMaxQuantity = item.quantity >= item.stok;

    return (
      <View style={styles.cartItem}>
        {/* Product Image */}
        <Image
          source={getProductImage(item.jenis)}
          style={styles.itemImage}
          resizeMode="cover"
        />

        {/* Product Info */}
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.nama_produk}</Text>
          <Text style={styles.itemPrice}>{formatCurrency(item.harga)}</Text>
        </View>

        {/* Quantity Controls */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => decreaseQuantity(item.id)}
          >
            <Icon name="remove" size={16} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{item.quantity}</Text>

          <TouchableOpacity
            style={[
              styles.quantityButton,
              isMaxQuantity && styles.quantityButtonDisabled,
            ]}
            onPress={() => increaseQuantity(item.id)}
            disabled={isMaxQuantity}
          >
            <Icon
              name="add"
              size={16}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleRemoveItem(item)}
        >
          <Icon name="trash" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="cart-outline" size={100} color={COLORS.gray} />
        <Text style={styles.emptyText}>Keranjang Kosong</Text>
        <Text style={styles.emptySubtext}>
          Yuk, mulai belanja sekarang!
        </Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.shopButtonText}>Mulai Belanja</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cart Items List */}
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Footer - Address & Price */}
      <View style={styles.footer}>
        {/* Address Section */}
        <View style={styles.addressContainer}>
          <View style={styles.addressHeader}>
            <Icon name="location" size={18} color={COLORS.primary} />
            <Text style={styles.addressTitle}>Alamat Pengiriman</Text>
          </View>
          <Text style={styles.addressText}>
            {user?.address || 'Alamat belum diisi'}
          </Text>
          <TouchableOpacity onPress={handleEditProfile}>
            <Text style={styles.changeAddressText}>Ubah</Text>
          </TouchableOpacity>
        </View>

        {/* Price Breakdown */}
        <View style={styles.priceBreakdown}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>{formatCurrency(subtotal)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Biaya Pengiriman</Text>
            <Text style={styles.priceValue}>{formatCurrency(ongkir)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>Bayar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  listContent: {
    padding: SIZES.md,
    paddingBottom: SIZES.xl,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radiusSm,
    marginRight: SIZES.md,
    backgroundColor: COLORS.light,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: COLORS.text,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.sm,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: SIZES.sm,
    minWidth: 20,
    textAlign: 'center',
  },
  deleteButton: {
    padding: SIZES.xs,
  },
  footer: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  addressContainer: {
    backgroundColor: '#E3F2FD',
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.md,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  addressTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SIZES.xs,
  },
  addressText: {
    fontSize: 13,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  changeAddressText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  priceBreakdown: {
    marginBottom: SIZES.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.text,
  },
  priceValue: {
    fontSize: 14,
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
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
    backgroundColor: COLORS.white,
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

export default CartScreen;