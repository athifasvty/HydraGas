import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { getRiwayat } from '../../api/customer';
import { COLORS, SIZES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [totalPesanan, setTotalPesanan] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch total pesanan
  useEffect(() => {
    const fetchTotalPesanan = async () => {
      try {
        const response = await getRiwayat();
        if (response.success && response.data.statistik) {
          const total = 
            (response.data.statistik.total_selesai || 0) + 
            (response.data.statistik.total_dibatalkan || 0);
          setTotalPesanan(total);
        }
      } catch (error) {
        console.log('Error fetching total pesanan:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalPesanan();
  }, []);

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

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PROFILE</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.username}>{user?.username || 'username'}</Text>
        </View>

        {/* Info Items */}
        <View style={styles.infoContainer}>
          {/* Address */}
          <View style={styles.infoRow}>
            <Icon name="location" size={18} color={COLORS.textLight} />
            <Text style={styles.infoText}>{user?.address || 'Belum diisi'}</Text>
          </View>

          {/* Phone */}
          <View style={styles.infoRow}>
            <Icon name="call" size={18} color={COLORS.textLight} />
            <Text style={styles.infoText}>{user?.phone || 'Belum diisi'}</Text>
          </View>

          {/* Username */}
          <View style={styles.infoRow}>
            <Icon name="at" size={18} color={COLORS.textLight} />
            <Text style={styles.infoText}>{user?.username || '-'}</Text>
          </View>

          {/* Member Since */}
          <View style={styles.infoRow}>
            <Icon name="calendar" size={18} color={COLORS.textLight} />
            <Text style={styles.infoText}>
              Bergabung: {user?.created_at ? formatDate(user.created_at) : '-'}
            </Text>
          </View>

          {/* Role Badge */}
          <View style={styles.infoRow}>
            <Icon name="person" size={18} color={COLORS.textLight} />
            <Text style={styles.infoText}>
              {user?.role === 'customer' ? 'Customer' : 'Kurir'}
            </Text>
          </View>
        </View>

        {/* Edit Button */}
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Ubah</Text>
        </TouchableOpacity>
      </View>

      {/* Total Orders Card */}
      <TouchableOpacity 
        style={styles.ordersCard}
        onPress={() => navigation.navigate('CustomerOrders')}
      >
        <Text style={styles.ordersText}>Total Pesanan</Text>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Text style={styles.ordersCount}>{totalPesanan}</Text>
        )}
      </TouchableOpacity>

      {/* Menu Section */}
      <View style={styles.menuSection}>
        {/* Change Password */}
        <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
          <View style={styles.menuLeft}>
            <Icon name="lock-closed-outline" size={22} color={COLORS.text} />
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
            <Icon name="information-circle-outline" size={22} color={COLORS.text} />
            <Text style={styles.menuText}>Tentang Aplikasi</Text>
          </View>
          <Icon name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

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
    backgroundColor: COLORS.white,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.lg,
    paddingHorizontal: SIZES.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: SIZES.md,
    padding: SIZES.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    margin: SIZES.md,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    marginBottom: SIZES.md,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  infoContainer: {
    marginBottom: SIZES.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.text,
    marginLeft: SIZES.sm,
    flex: 1,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.lg,
    borderRadius: SIZES.radiusFull,
    alignSelf: 'flex-end',
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  ordersCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SIZES.md,
    marginBottom: SIZES.md,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ordersText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  ordersCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  menuSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.md,
    marginBottom: SIZES.md,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 15,
    color: COLORS.text,
    marginLeft: SIZES.md,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.md,
    marginBottom: SIZES.md,
    borderRadius: SIZES.radiusFull,
    paddingVertical: SIZES.md,
    borderWidth: 2,
    borderColor: COLORS.danger,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.lg,
  },
  versionText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
  },
});

export default ProfileScreen;