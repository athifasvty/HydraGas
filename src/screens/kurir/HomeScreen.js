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
  const [activeTab, setActiveTab] = useState('dashboard');

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
  const renderStatCard = (icon, label, value, color, bgColor) => (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
      <View style={styles.statIconContainer}>
        <Icon name={icon} size={32} color={color} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Selamat datang,</Text>
          <Text style={styles.userName}>Kurir {user?.name || 'A'}!</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('KurirProfile')}
        >
          <Icon name="person-circle" size={40} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => setActiveTab('dashboard')}
        >
          {activeTab === 'dashboard' && <View style={styles.tabIndicator} />}
          <Text style={[
            styles.tabText, 
            activeTab === 'dashboard' && styles.tabTextActive
          ]}>
            Dashboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => {
            setActiveTab('pesanan');
            navigation.navigate('KurirOrders');
          }}
        >
          {activeTab === 'pesanan' && <View style={styles.tabIndicator} />}
          <Text style={[
            styles.tabText, 
            activeTab === 'pesanan' && styles.tabTextActive
          ]}>
            Pesanan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => {
            setActiveTab('riwayat');
            navigation.navigate('KurirHistory');
          }}
        >
          {activeTab === 'riwayat' && <View style={styles.tabIndicator} />}
          <Text style={[
            styles.tabText, 
            activeTab === 'riwayat' && styles.tabTextActive
          ]}>
            Riwayat
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsTitleContainer}>
            <Icon name="stats-chart" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Statistik Hari Ini</Text>
          </View>

          <View style={styles.statsGrid}>
            {renderStatCard(
              'calendar',
              'Total Pesanan',
              statistics.total_hari_ini,
              '#2196F3',
              '#E3F2FD'
            )}
            {renderStatCard(
              'bicycle',
              'Pesanan Aktif',
              statistics.pesanan_aktif,
              '#FF9800',
              '#FFF3E0'
            )}
            {renderStatCard(
              'checkmark-circle',
              'Selesai',
              statistics.selesai_hari_ini,
              '#4CAF50',
              '#E8F5E9'
            )}
            {renderStatCard(
              'wallet',
              'Pendapatan',
              formatCurrency(statistics.total_pendapatan),
              '#9C27B0',
              '#F3E5F5'
            )}
          </View>
        </View>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <View style={styles.recentContainer}>
            <View style={styles.recentHeader}>
              <Text style={styles.sectionTitle}>Pesanan Aktif</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.lg,
    backgroundColor: COLORS.white,
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
    alignItems: 'flex-start',
    padding: SIZES.md,
    paddingTop: SIZES.lg,
    backgroundColor: COLORS.white,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  profileButton: {
    padding: SIZES.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: SIZES.md,
    marginTop: SIZES.md,
    marginBottom: SIZES.md,
    backgroundColor: COLORS.light,
    borderRadius: SIZES.radiusFull,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.sm,
    alignItems: 'center',
    borderRadius: SIZES.radiusFull,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusFull,
    zIndex: -1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scrollContent: {
    flex: 1,
  },
  statsSection: {
    padding: SIZES.md,
  },
  statsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
    gap: SIZES.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.md,
  },
  statCard: {
    width: '47%',
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    marginBottom: SIZES.sm,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.text,
    marginBottom: SIZES.xs,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  recentContainer: {
    padding: SIZES.md,
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
    borderWidth: 1,
    borderColor: COLORS.border,
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