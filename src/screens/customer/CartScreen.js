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

  // Calculate prices
  const subtotal = getTotalPrice();
  const ongkir = ONGKIR_FLAT;
  const total = subtotal + ongkir;

  // Render cart item
  const renderCartItem = ({ item }) => {
    const subtotalItem = item.harga * item.quantity;
    const isMaxQuantity = item.quantity >= item.stok;

    return (
      <View style={styles.cartItem}>
        {/* Product Icon */}
        <View
          style={[
            styles.itemIcon,
            { backgroundColor: item.jenis === 'elpiji' ? '#FFE5E5' : '#E3F2FD' },
          ]}
        >
          <Icon
            name={item.jenis === 'elpiji' ? 'flame' : 'water'}
            size={28}
            color={item.jenis === 'elpiji' ? '#F44336' : '#2196F3'}
          />
        </View>

        {/* Product Info */}
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.nama_produk}</Text>
          <Text style={styles.itemPrice}>{formatCurrency(item.harga)}</Text>
          <Text style={styles.itemSubtotal}>
            Subtotal: {formatCurrency(subtotalItem)}
          </Text>
        </View>

        {/* Quantity Controls */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => decreaseQuantity(item.id)}
          >
            <Icon name="remove" size={20} color={COLORS.white} />
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
              size={20}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleRemoveItem(item)}
        >
          <Icon name="trash" size={22} color={COLORS.danger} />
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
      {/* Header Actions */}
      <View style={styles.headerActions}>
        <Text style={styles.itemCount}>
          {cartItems.length} Item di Keranjang
        </Text>
        <TouchableOpacity onPress={handleClearCart}>
          <Text style={styles.clearText}>Kosongkan</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items List */}
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Footer - Price Breakdown & Checkout */}
      <View style={styles.footer}>
        {/* Price Breakdown */}
        <View style={styles.priceBreakdown}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal Produk</Text>
            <Text style={styles.priceValue}>{formatCurrency(subtotal)}</Text>
          </View>

          <View style={styles.priceRow}>
            <View style={styles.ongkirLabelContainer}>
              <Icon name="car-outline" size={18} color={COLORS.textLight} />
              <Text style={styles.priceLabel}>Ongkos Kirim</Text>
            </View>
            <Text style={styles.priceValue}>{formatCurrency(ongkir)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Belanja</Text>
            <Text style={styles.totalAmount}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>Lanjut ke Checkout</Text>
          <Icon name="arrow-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemCount: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
  },
  clearText: {
    fontSize: SIZES.fontSm,
    color: COLORS.danger,
    fontWeight: '600',
  },
  listContent: {
    padding: SIZES.md,
  },
  cartItem: {
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
    elevation: 2,
  },
  itemIcon: {
    width: 50,
    height: 50,
    borderRadius: SIZES.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  itemSubtotal: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.sm,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.5,
  },
  quantityText: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: SIZES.md,
    minWidth: 30,
    textAlign: 'center',
  },
  deleteButton: {
    padding: SIZES.sm,
  },
  footer: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  priceBreakdown: {
    marginBottom: SIZES.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  ongkirLabelContainer: {
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
  checkoutButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  checkoutButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
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

export default CartScreen;