import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { STATUS_LABELS, STATUS_COLORS, SIZES } from '../utils/constants';

const StatusBadge = ({ status }) => {
  const label = STATUS_LABELS[status] || status;
  const backgroundColor = STATUS_COLORS[status] || '#999';

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusFull,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#FFFFFF',
    fontSize: SIZES.fontSm,
    fontWeight: '600',
  },
});

export default StatusBadge;