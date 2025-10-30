import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';

const HistoryScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Customer History Screen</Text>
      <Text style={styles.subtext}>Riwayat Pesanan</Text>
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
    color: COLORS.text,
  },
  subtext: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
  },
});

export default HistoryScreen;