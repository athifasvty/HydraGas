import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES } from '../utils/constants';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import StatusBadge from './StatusBadge';

const OrderCard = ({ order, onPress, showCustomerInfo = false }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="receipt-outline" size={24} color={COLORS.primary} />
          <Text style={styles.orderId}>Pesanan #{order.id}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      {/* Date */}
      <View style={styles.row}>
        <Icon name="calendar-outline" size={16} color={COLORS.textLight} />
        <Text style={styles.date}>{formatDateTime(order.tanggal_pesan)}</Text>
      </View>

      {/* Customer Info (untuk Kurir) */}
      {showCustomerInfo && order.nama_customer && (
        <View style={styles.customerInfo}>
          <View style={styles.row}>
            <Icon name="person-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.customerText}>{order.nama_customer}</Text>
          </View>
          {order.phone_customer && (
            <View style={styles.row}>
              <Icon name="call-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.customerText}>{order.phone_customer}</Text>
            </View>
          )}
          {order.alamat_customer && (
            <View style={styles.row}>
              <Icon name="location-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.customerText} numberOfLines={2}>
                {order.alamat_customer}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Kurir Info (untuk Customer) */}
      {!showCustomerInfo && order.nama_kurir && (
        <View style={styles.row}>
          <Icon name="bicycle-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.kurirText}>Kurir: {order.nama_kurir}</Text>
        </View>
      )}

      {/* Items Count */}
      <View style={styles.row}>
        <Icon name="cube-outline" size={16} color={COLORS.textLight} />
        <Text style={styles.itemsCount}>{order.jumlah_item} Item</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>
            {formatCurrency(order.total_harga)}
          </Text>
        </View>

        {order.metode_bayar && (
          <View style={styles.paymentBadge}>
            <Icon
              name={order.metode_bayar === 'cash' ? 'cash-outline' : 'card-outline'}
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.paymentText}>
              {order.metode_bayar === 'cash' ? 'COD' : 'Transfer'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SIZES.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  date: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
    marginLeft: SIZES.sm,
  },
  customerInfo: {
    backgroundColor: COLORS.light,
    padding: SIZES.sm,
    borderRadius: SIZES.radiusSm,
    marginBottom: SIZES.sm,
  },
  customerText: {
    fontSize: SIZES.fontSm,
    color: COLORS.text,
    marginLeft: SIZES.sm,
    flex: 1,
  },
  kurirText: {
    fontSize: SIZES.fontSm,
    color: COLORS.text,
    marginLeft: SIZES.sm,
  },
  itemsCount: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
    marginLeft: SIZES.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.sm,
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
  },
  totalPrice: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusFull,
  },
  paymentText: {
    fontSize: SIZES.fontSm,
    color: COLORS.primary,
    marginLeft: SIZES.xs,
    fontWeight: '500',
  },
});

export default OrderCard;