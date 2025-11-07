import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SIZES } from '../../utils/constants';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (result.success) {
              console.log('✅ Logout berhasil');
            }
          },
        },
      ]
    );
  };

  // Handle about
  const handleAbout = () => {
    Alert.alert(
      'Tentang Aplikasi',
      'HydraGas - Aplikasi Pemesanan Gas & Galon\nVersi 1.0.0\n\n© 2024 HydraGas',
      [{ text: 'OK' }]
    );
  };

  // Render info card
  const renderInfoCard = (icon, label, value, iconColor = COLORS.primary) => (
    <View style={styles.infoCard}>
      <View style={[styles.infoIcon, { backgroundColor: iconColor + '20' }]}>
        <Icon name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '-'}</Text>
      </View>
    </View>
  );

  // Render menu item
  const renderMenuItem = (icon, label, onPress, iconColor = COLORS.primary) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: iconColor + '20' }]}>
        <Icon name={icon} size={22} color={iconColor} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Icon name="chevron-forward" size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Icon name="person" size={48} color={COLORS.white} />
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
          </View>
        </View>
        <Text style={styles.userName}>{user?.name || 'Kurir'}</Text>
        <Text style={styles.userRole}>Kurir Pengiriman</Text>
      </View>

      {/* Info Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Akun</Text>
        <View style={styles.infoCardsContainer}>
          {renderInfoCard('person-outline', 'Nama Lengkap', user?.name)}
          {renderInfoCard('at-outline', 'Username', user?.username)}
          {renderInfoCard('call-outline', 'Nomor Telepon', user?.phone, COLORS.success)}
          {renderInfoCard(
            'location-outline',
            'Alamat',
            user?.address || 'Belum diisi',
            COLORS.warning
          )}
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistik</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Icon name="bicycle" size={32} color={COLORS.primary} />
            <Text style={styles.statValue}>-</Text>
            <Text style={styles.statLabel}>Total Pengiriman</Text>
          </View>
          <View style={styles.statBox}>
            <Icon name="star" size={32} color="#FFB800" />
            <Text style={styles.statValue}>-</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pengaturan</Text>
        <View style={styles.menuContainer}>
          {renderMenuItem(
            'create-outline',
            'Edit Profile',
            () => navigation.navigate('EditProfile')
          )}
          {renderMenuItem(
            'lock-closed-outline',
            'Ganti Password',
            () => navigation.navigate('ChangePassword')
          )}
          {renderMenuItem(
            'information-circle-outline',
            'Tentang Aplikasi',
            handleAbout,
            COLORS.info
          )}
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Icon name="log-out-outline" size={24} color={COLORS.white} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>HydraGas v1.0.0</Text>
        <Text style={styles.copyrightText}>© 2024 HydraGas. All rights reserved.</Text>
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: SIZES.xl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SIZES.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
  },
  userName: {
    fontSize: SIZES.fontXxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  userRole: {
    fontSize: SIZES.fontMd,
    color: COLORS.white,
    opacity: 0.9,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    marginTop: SIZES.sm,
  },
  sectionTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  infoCardsContainer: {
    gap: SIZES.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
  },
  infoIcon: {
    width: 50,
    height: 50,
    borderRadius: SIZES.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    gap: SIZES.sm,
  },
  statValue: {
    fontSize: SIZES.fontXxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  menuContainer: {
    gap: SIZES.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: SIZES.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.danger,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    gap: SIZES.sm,
  },
  logoutText: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  footer: {
    alignItems: 'center',
    padding: SIZES.lg,
  },
  versionText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: SIZES.fontXs,
    color: COLORS.textLight,
  },
});

export default ProfileScreen;