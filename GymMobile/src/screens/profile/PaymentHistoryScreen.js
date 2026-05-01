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
import { getPaymentHistory } from '../../api/paymentApi';
import { formatRupiah } from '../../utils/format';

export default function PaymentHistoryScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await getPaymentHistory();
      setTransactions(res.data.data || []);
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

  const statusColor = (status) => {
    const s = status?.toUpperCase();
    if (s === 'SUCCESS') return '#4caf7d';
    if (s === 'PENDING') return '#ffa726';
    return '#ff6b6b';
  };

  const formatDate = (iso) => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const renderItem = ({ item: t }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.pkgName}>{t.packageName || t.paymentDetail || '-'}</Text>
        <View style={[styles.statusBadge, { borderColor: statusColor(t.status) }]}>
          <Text style={[styles.statusText, { color: statusColor(t.status) }]}>
            {t.status?.toUpperCase() || '-'}
          </Text>
        </View>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.subText}>{t.paymentMethod || '-'}</Text>
        <Text style={styles.amount}>
          {t.amount ? formatRupiah(t.amount) : '-'}
        </Text>
      </View>
      <Text style={styles.date}>{formatDate(t.createdAt)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Riwayat Transaksi</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#4caf7d" size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item, index) => String(item.id || index)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4caf7d" />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🕐</Text>
              <Text style={styles.emptyText}>Belum ada transaksi</Text>
            </View>
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
  list: { padding: 16 },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pkgName: { color: '#fff', fontWeight: 'bold', fontSize: 14, flex: 1, marginRight: 10 },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  subText: { color: '#aaa', fontSize: 12 },
  amount: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  date: { color: '#666', fontSize: 11 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#aaa', fontSize: 14 },
});
