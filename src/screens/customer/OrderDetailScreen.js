import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';

const OrderDetailScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Order Detail Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default OrderDetailScreen;