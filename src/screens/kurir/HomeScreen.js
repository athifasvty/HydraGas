import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { getPesananKurir } from '../../api/kurir';
import { formatCurrency, formatTime } from '../../utils/formatters';
import { COLORS, SIZES, STATUS_LABELS, STATUS_COLORS } from '../../utils/constants';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [statistics, setStatistics] = useState({
    total_hari_ini: 0,
    pesanan_aktif: 0,
    selesai_hari_ini: 0,
    total_pendapatan: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);

  // Fetch dashboard data
  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      console.log('🏠 Fetching kurir dashboard...');

      // Get semua pesanan kurir
      const response = await getPesananKurir();

      console.log('📦 Full Response:', JSON.stringify(response, null, 2));

      if (response.success) {
        // ✅ FIX: Backend return {pesanan: [...], statistik: {...}}
        const pesanan = Array.isArray(response.data?.pesanan) 
          ? response.data.pesanan 
          : Array.isArray(response.data) 
          ? response.data 
          : [];

        const apiStatistik = response.data?.statistik || {};

        console.log('✅ Pesanan count:', pesanan.length);
        console.log('📊 API Statistik:', apiStatistik);

        // Hitung statistik dari data pesanan
        const today = new Date().toISOString().split('T')[0];
        
        const todayOrders = pesanan.filter((p) => {
          if (!p.tanggal_pesan) return false;
          return p.tanggal_pesan.startsWith(today);
        });

        console.log('📅 Today orders:', todayOrders.length);

        const stats = {
          total_hari_ini: todayOrders.length,
          pesanan_aktif: pesanan.filter((p) =>
            ['diproses', 'dikirim'].includes(p.status)
          ).length,
          selesai_hari_ini: apiStatistik.total_selesai_hari_ini || 0,
          total_pendapatan: todayOrders
            .filter((p) => p.status === 'selesai')
            .reduce((sum, p) => sum + parseFloat(p.total_harga || 0), 0),
        };

        console.log('📊 Final Statistics:', stats);

        setStatistics(stats);

        // Ambil 5 pesanan terbaru yang aktif
        const recent = pesanan
          .filter((p) => ['diproses', 'dikirim'].includes(p.status))
          .slice(0, 5);

        console.log('🔥 Recent orders:', recent.length);

        setRecentOrders(recent);
      } else {
        console.log('❌ API Error:', response.message);
        setError(response.message || 'Gagal mengambil data');
      }
    } catch (err) {
      console.error('💥 Catch Error:', err);
      console.error('💥 Error Message:', err.message);
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard(true);
  }, []);

  useEffect(() => {
    fetchDashboard();

    // Auto refresh setiap 30 detik
    const interval = setInterval(() => {
      fetchDashboard(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Get status badge style
  const getStatusBadgeStyle = (status) => {
    return {
      backgroundColor: STATUS_COLORS[status] || COLORS.gray,
    };
  };

  // Render statistic card
  const renderStatCard = (icon, label, value, color, onPress) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={28} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render recent order item
  const renderRecentOrder = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.recentOrderCard}
      onPress={() =>
        navigation.navigate('KurirOrderDetail', { orderId: item.id })
      }
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Pesanan #{item.id}</Text>
        <View style={[styles.statusBadge, getStatusBadgeStyle(item.status)]}>
          <Text style={styles.statusText}>{STATUS_LABELS[item.status]}</Text>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <View style={styles.infoRow}>
          <Icon name="person-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.infoText}>{item.nama_customer || '-'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="location-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.infoText} numberOfLines={1}>
            {item.alamat_customer || '-'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="time-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.infoText}>{formatTime(item.tanggal_pesan)}</Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>{formatCurrency(item.total_harga)}</Text>
        <Icon name="chevron-forward" size={20} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Memuat dashboard...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle" size={64} color={COLORS.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDashboard}>
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo,</Text>
          <Text style={styles.userName}>{user?.name || 'Kurir'}</Text>
        </View>
        <View style={styles.headerBadge}>
          <Icon name="bicycle" size={24} color={COLORS.white} />
        </View>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Statistik Hari Ini</Text>
        <View style={styles.statsGrid}>
          {renderStatCard(
            'calendar',
            'Total Pesanan',
            statistics.total_hari_ini,
            COLORS.primary,
            () => navigation.navigate('KurirOrders')
          )}
          {renderStatCard(
            'bicycle',
            'Pesanan Aktif',
            statistics.pesanan_aktif,
            COLORS.warning,
            () => navigation.navigate('KurirOrders')
          )}
          {renderStatCard(
            'checkmark-circle',
            'Selesai',
            statistics.selesai_hari_ini,
            COLORS.success,
            () => navigation.navigate('KurirHistory')
          )}
          {renderStatCard(
            'wallet',
            'Pendapatan',
            formatCurrency(statistics.total_pendapatan),
            '#9C27B0',
            () => navigation.navigate('KurirHistory')
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Menu Cepat</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('KurirOrders')}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: COLORS.primary + '20' },
              ]}
            >
              <Icon name="list" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.actionLabel}>Lihat Pesanan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('KurirHistory')}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: COLORS.success + '20' },
              ]}
            >
              <Icon name="checkmark-done" size={28} color={COLORS.success} />
            </View>
            <Text style={styles.actionLabel}>Riwayat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('KurirProfile')}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: COLORS.info + '20' },
              ]}
            >
              <Icon name="person" size={28} color={COLORS.info} />
            </View>
            <Text style={styles.actionLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Pesanan Terbaru</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('KurirOrders')}
            >
              <Text style={styles.seeAllText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recentList}>
            {recentOrders.map(renderRecentOrder)}
          </View>
        </View>
      )}

      {/* Empty State */}
      {recentOrders.length === 0 && !loading && (
        <View style={styles.emptyContainer}>
          <Icon name="bicycle-outline" size={80} color={COLORS.gray} />
          <Text style={styles.emptyText}>Belum Ada Pesanan Aktif</Text>
          <Text style={styles.emptySubtext}>
            Pesanan yang di-assign ke Anda akan muncul di sini
          </Text>
        </View>
      )}

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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.lg,
  },
  loadingText: {
    marginTop: SIZES.md,
    fontSize: SIZES.fontMd,
    color: COLORS.textLight,
  },
  errorText: {
    marginTop: SIZES.md,
    fontSize: SIZES.fontMd,
    color: COLORS.danger,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SIZES.lg,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.md,
    backgroundColor: COLORS.primary,
  },
  greeting: {
    fontSize: SIZES.fontSm,
    color: COLORS.white,
    opacity: 0.9,
  },
  userName: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    padding: SIZES.md,
  },
  sectionTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  statsGrid: {
    gap: SIZES.md,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: SIZES.fontXxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
    marginTop: 2,
  },
  actionsContainer: {
    padding: SIZES.md,
    paddingTop: 0,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  actionLabel: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  recentContainer: {
    padding: SIZES.md,
    paddingTop: 0,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  seeAllText: {
    fontSize: SIZES.fontSm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  recentList: {
    gap: SIZES.md,
  },
  recentOrderCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
    paddingBottom: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  orderId: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusFull,
  },
  statusText: {
    fontSize: SIZES.fontXs,
    fontWeight: '600',
    color: COLORS.white,
  },
  orderInfo: {
    gap: SIZES.xs,
    marginBottom: SIZES.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  orderTotal: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SIZES.xl,
    marginTop: SIZES.xl,
  },
  emptyText: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.md,
  },
  emptySubtext: {
    fontSize: SIZES.fontSm,
    color: COLORS.textLight,
    marginTop: SIZES.xs,
    textAlign: 'center',
  },
});

export default HomeScreen;
