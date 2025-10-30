import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES, PRODUCT_TYPE_LABELS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

const ProductCard = ({ product, onAddToCart, onPress }) => {
  const isOutOfStock = product.stok === 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={isOutOfStock}
      activeOpacity={0.7}
    >
      {/* Product Image Placeholder */}
      <View style={styles.imageContainer}>
        <Icon
          name={product.jenis === 'galon' ? 'water' : 'flame'}
          size={50}
          color={COLORS.primary}
        />
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.nama_produk}
        </Text>
        
        <Text style={styles.productType}>
          {PRODUCT_TYPE_LABELS[product.jenis]}
        </Text>

        <Text style={styles.price}>{formatCurrency(product.harga)}</Text>

        {/* Stock Status */}
        <View style={styles.stockContainer}>
          {isOutOfStock ? (
            <Text style={styles.outOfStock}>Stok Habis</Text>
          ) : product.stok < 10 ? (
            <Text style={styles.lowStock}>Stok: {product.stok}</Text>
          ) : (
            <Text style={styles.inStock}>Tersedia</Text>
          )}
        </View>
      </View>

      {/* Add to Cart Button */}
      {!isOutOfStock && onAddToCart && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => onAddToCart(product)}
        >
          <Icon name="cart" size={20} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.light,
    borderRadius: SIZES.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  infoContainer: {
    flex: 1,
  },
  productName: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  productType: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
    marginBottom: SIZES.xs,
  },
  price: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  stockContainer: {
    marginTop: SIZES.xs,
  },
  inStock: {
    fontSize: SIZES.fontSm,
    color: COLORS.success,
    fontWeight: '500',
  },
  lowStock: {
    fontSize: SIZES.fontSm,
    color: COLORS.warning,
    fontWeight: '500',
  },
  outOfStock: {
    fontSize: SIZES.fontSm,
    color: COLORS.danger,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: SIZES.radiusFull,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SIZES.sm,
  },
});

export default ProductCard;