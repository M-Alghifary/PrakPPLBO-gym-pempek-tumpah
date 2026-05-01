import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getPackages, getActiveMembership } from '../../api/membershipApi';
import { formatRupiah } from '../../utils/format';

export default function MembershipScreen({ navigation }) {
  const [packages, setPackages] = useState([]);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [pkgRes, memberRes] = await Promise.all([
        getPackages().catch(() => ({ data: { data: [] } })),
        getActiveMembership().catch(() => ({ data: { data: null } })),
      ]);
      setPackages(pkgRes.data.data || []);
      setMembership(memberRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderItem = ({ item: pkg }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.pkgName}>{pkg.name}</Text>
        <Text style={styles.pkgPrice}>{formatRupiah(pkg.price)}</Text>
      </View>
      <Text style={styles.pkgDays}>{pkg.durationDays} hari</Text>
      <Text style={styles.pkgDesc}>{pkg.description}</Text>
      <TouchableOpacity
        style={styles.buyBtn}
        onPress={() =>
          navigation.navigate('PaymentScreen', {
            packageId: pkg.id,
            packageName: pkg.name,
            price: pkg.price,
          })
        }
      >
        <Text style={styles.buyBtnText}>Beli Sekarang</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Paket Membership</Text>
      </View>

      {membership && (
        <View style={styles.activeBox}>
          <Text style={styles.activeLabel}>✅ Membership Aktif</Text>
          <Text style={styles.activeName}>{membership.packageName}</Text>
          <Text style={styles.activeSub}>{membership.daysRemaining} hari tersisa</Text>
          <Text style={styles.activeSub}>
            Valid sampai{' '}
            {new Date(membership.endDate).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color="#4caf7d" size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={packages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4caf7d" />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Tidak ada paket membership tersedia</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#111111' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  backBtn: { padding: 4 },
  backText: { color: '#4caf7d', fontSize: 14 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  activeBox: {
    backgroundColor: '#1a3a2a',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4caf7d',
  },
  activeLabel: { color: '#4caf7d', fontWeight: 'bold', fontSize: 13, marginBottom: 4 },
  activeName: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  activeSub: { color: '#aaa', fontSize: 13, marginBottom: 2 },
  list: { padding: 16, paddingTop: 0 },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pkgName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  pkgPrice: { color: '#4caf7d', fontWeight: 'bold', fontSize: 15 },
  pkgDays: { color: '#aaa', fontSize: 13, marginBottom: 6 },
  pkgDesc: { color: '#ccc', fontSize: 13, marginBottom: 16, minHeight: 36 },
  buyBtn: {
    backgroundColor: '#4caf7d',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buyBtnText: { color: '#111', fontWeight: 'bold', fontSize: 14 },
  emptyText: { color: '#aaa', textAlign: 'center', marginTop: 60, fontSize: 14 },
});
