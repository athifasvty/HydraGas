import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  const subtotal = item.harga * item.quantity;

  return (
    <View style={styles.container}>
      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.nama_produk}
        </Text>
        <Text style={styles.price}>{formatCurrency(item.harga)}</Text>
        <Text style={styles.subtotal}>
          Subtotal: {formatCurrency(subtotal)}
        </Text>
      </View>

      {/* Quantity Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={onDecrease}
          >
            <Icon name="remove" size={20} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={styles.quantity}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={onIncrease}
            disabled={item.quantity >= item.stok}
          >
            <Icon name="add" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Remove Button */}
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Icon name="trash-outline" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContainer: {
    flex: 1,
    marginRight: SIZES.md,
  },
  productName: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  price: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
    marginBottom: SIZES.xs,
  },
  subtotal: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  controlsContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.xs,
  },
  quantityButton: {
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: SIZES.radiusFull,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: SIZES.md,
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    padding: SIZES.sm,
  },
});

export default CartItem;