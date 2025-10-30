import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SIZES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const ProfileScreen = ({ navigation }) => { // ✅ Tambah navigation prop
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (result.success) {
              // Navigation akan otomatis redirect ke login
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // ✅ Handler untuk Edit Profile
  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  // ✅ Handler untuk Change Password
  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.avatarContainer}>
          <Icon name="person" size={50} color={COLORS.white} />
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.username}>@{user?.username || 'username'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.role === 'customer' ? 'Customer' : 'Kurir'}
          </Text>
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Akun</Text>

        {/* Username */}
        <View style={styles.infoItem}>
          <View style={styles.infoLeft}>
            <Icon name="at-outline" size={20} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Username</Text>
          </View>
          <Text style={styles.infoValue}>{user?.username || '-'}</Text>
        </View>

        {/* Phone */}
        <View style={styles.infoItem}>
          <View style={styles.infoLeft}>
            <Icon name="call-outline" size={20} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Telepon</Text>
          </View>
          <Text style={styles.infoValue}>{user?.phone || 'Belum diisi'}</Text>
        </View>

        {/* Address */}
        <View style={styles.infoItem}>
          <View style={styles.infoLeft}>
            <Icon name="location-outline" size={20} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Alamat</Text>
          </View>
          <Text style={styles.infoValue} numberOfLines={2}>
            {user?.address || 'Belum diisi'}
          </Text>
        </View>

        {/* Member Since */}
        <View style={styles.infoItem}>
          <View style={styles.infoLeft}>
            <Icon name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Bergabung</Text>
          </View>
          <Text style={styles.infoValue}>
            {user?.created_at ? formatDate(user.created_at) : '-'}
          </Text>
        </View>
      </View>

      {/* Menu Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pengaturan</Text>

        {/* Edit Profile - ✅ NAVIGASI KE EDIT PROFILE */}
        <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
          <View style={styles.menuLeft}>
            <Icon name="create-outline" size={24} color={COLORS.text} />
            <Text style={styles.menuText}>Edit Profile</Text>
          </View>
          <Icon name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>

        {/* Change Password - ✅ NAVIGASI KE CHANGE PASSWORD */}
        <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
          <View style={styles.menuLeft}>
            <Icon name="lock-closed-outline" size={24} color={COLORS.text} />
            <Text style={styles.menuText}>Ganti Password</Text>
          </View>
          <Icon name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>

        {/* About */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            Alert.alert(
              'Tentang HydraGas',
              'HydraGas v1.0\nSistem Pemesanan Gas & Galon\n\n© 2024 HydraGas'
            )
          }
        >
          <View style={styles.menuLeft}>
            <Icon name="information-circle-outline" size={24} color={COLORS.text} />
            <Text style={styles.menuText}>Tentang Aplikasi</Text>
          </View>
          <Icon name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color={COLORS.white} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Version Info */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerCard: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.xl * 2,
    paddingHorizontal: SIZES.lg,
    alignItems: 'center',
    borderBottomLeftRadius: SIZES.radiusXl,
    borderBottomRightRadius: SIZES.radiusXl,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: SIZES.radiusFull,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  name: {
    fontSize: SIZES.fontXxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  username: {
    fontSize: SIZES.fontMd,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SIZES.md,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusFull,
  },
  roleText: {
    color: COLORS.white,
    fontSize: SIZES.fontSm,
    fontWeight: '600',
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: SIZES.md,
    marginHorizontal: SIZES.md,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: SIZES.fontMd,
    color: COLORS.text,
    marginLeft: SIZES.sm,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: SIZES.fontMd,
    color: COLORS.textLight,
    flex: 1,
    textAlign: 'right',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: SIZES.fontMd,
    color: COLORS.text,
    marginLeft: SIZES.md,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: COLORS.danger,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    marginLeft: SIZES.sm,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.xl,
  },
  versionText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
  },
});

export default ProfileScreen;