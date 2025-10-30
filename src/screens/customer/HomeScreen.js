import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Customer Home Screen</Text>
      <Text style={styles.subtext}>Katalog Produk</Text>
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

export default HomeScreen;