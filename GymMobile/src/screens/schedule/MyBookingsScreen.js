import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getMyBookings, cancelBooking, bookClass, scanAttendance } from '../../api/scheduleApi';

const TABS = [
  { key: 'UPCOMING', label: 'Upcoming', status: 'BOOKED' },
  { key: 'COMPLETED', label: 'Completed', status: 'ATTENDED' },
  { key: 'CANCELLED', label: 'Cancelled', status: 'CANCELLED' },
];

export default function MyBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('UPCOMING');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchBookings = useCallback(async () => {
    try {
      const res = await getMyBookings();
      setBookings(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleCancel = (bookingId) => {
    Alert.alert('Batalkan Booking', 'Yakin ingin membatalkan booking ini?', [
      { text: 'Tidak', style: 'cancel' },
      {
        text: 'Ya, Batalkan',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelBooking(bookingId);
            setMessage({ text: 'Booking berhasil dibatalkan', type: 'success' });
            fetchBookings();
          } catch (err) {
            setMessage({
              text: err.response?.data?.message || 'Gagal membatalkan',
              type: 'error',
            });
          }
          setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        },
      },
    ]);
  };

  const handleRebook = (classId, className) => {
    Alert.alert(
      'Book Lagi',
      `Booking ulang kelas ${className}?`,
      [
        { text: 'Tidak', style: 'cancel' },
        {
          text: 'Ya, Book',
          onPress: async () => {
            try {
              await bookClass(classId);
              setMessage({ text: 'Booking berhasil!', type: 'success' });
              fetchBookings();
            } catch (err) {
              setMessage({
                text: err.response?.data?.message || 'Gagal booking ulang',
                type: 'error',
              });
            }
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
          },
        },
      ]
    );
  };

  const activeStatus = TABS.find((t) => t.key === activeTab)?.status;
  const filtered = bookings.filter((b) => b.status === activeStatus);

  const statusColor = (status) => {
    if (status === 'BOOKED') return '#4caf7d';
    if (status === 'ATTENDED') return '#4a9eff';
    return '#ff6b6b';
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const renderItem = ({ item: b }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.iconCircle}>
          <Text style={{ fontSize: 20 }}>🧘</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.className}>{b.className}</Text>
          <Text style={styles.subText}>
            {formatTime(b.startTime)}
            {b.endTime ? ` – ${formatTime(b.endTime)}` : ''}
          </Text>
          {b.trainerName ? (
            <Text style={styles.subText}>Instruktur: {b.trainerName}</Text>
          ) : null}
          <Text style={styles.subText}>{formatDate(b.startTime)}</Text>
          <Text style={[styles.statusText, { color: statusColor(b.status) }]}>
            Status:{' '}
            {b.status === 'BOOKED' ? 'Terkonfirmasi'
              : b.status === 'ATTENDED' ? 'Selesai'
              : 'Dibatalkan'}
          </Text>
        </View>
      </View>
      {b.status === 'BOOKED' && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => handleCancel(b.classId)}
        >
          <Text style={styles.cancelBtnText}>✖ Batalkan</Text>
        </TouchableOpacity>
      )}
      {b.status === 'BOOKED' && (
        <TouchableOpacity
          style={styles.absenBtn}
          onPress={() => navigation.navigate('QrScanner', {
            classId: b.classId,
            className: b.className,
            onSuccess: () => fetchBookings(),
          })}
        >
          <Text style={styles.absenBtnText}>📷 Scan Absen</Text>
        </TouchableOpacity>
      )}
      {b.status === 'ATTENDED' && (
        <View style={styles.attendedBadge}>
          <Text style={styles.attendedText}>✅ Presensi Tercatat</Text>
        </View>
      )}
      {b.status === 'CANCELLED' && (
        <TouchableOpacity
          style={styles.rebookBtn}
          onPress={() => handleRebook(b.classId, b.className)}
        >
          <Text style={styles.rebookBtnText}>🔄 Book Lagi</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Booking Saya</Text>
      </View>

      {!!message.text && (
        <View style={[
          styles.msgBanner,
          { borderColor: message.type === 'success' ? '#4caf7d' : '#ff6b6b' },
        ]}>
          <Text style={{ color: message.type === 'success' ? '#4caf7d' : '#ff6b6b', fontSize: 13 }}>
            {message.text}
          </Text>
        </View>
      )}

      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#4caf7d" size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.bookingId)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4caf7d" />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📅</Text>
              <Text style={styles.emptyText}>Belum ada booking</Text>
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
  msgBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#1a1a1a',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: '#3a3a3a' },
  tabText: { color: '#aaa', fontSize: 12, fontWeight: 'bold' },
  tabTextActive: { color: '#fff' },
  list: { padding: 16, paddingTop: 0 },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardRow: { flexDirection: 'row', gap: 12 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4caf7d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  className: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginBottom: 3 },
  subText: { color: '#aaa', fontSize: 12, marginBottom: 2 },
  statusText: { fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  cancelBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#aaa', fontSize: 13 },
  attendedBadge: {
    marginTop: 12,
    backgroundColor: '#1a3a2a',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  attendedText: { color: '#4caf7d', fontSize: 13 },
  rebookBtn: {
    marginTop: 10,
    backgroundColor: '#1a2a3a',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4caf7d',
  },
  rebookBtnText: {
    color: '#4caf7d',
    fontSize: 13,
    fontWeight: 'bold',
  },
  absenBtn: {
    marginTop: 8,
    backgroundColor: '#1a2a3a',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4a9eff',
  },
  absenBtnText: {
    color: '#4a9eff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#aaa', fontSize: 14 },
});
