import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getClasses, getMyBookings, bookClass } from '../../api/scheduleApi';

export default function ScheduleScreen({ navigation }) {
  const [classes, setClasses] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [bookingIds, setBookingIds] = useState(new Set());
  const [cancelledIds, setCancelledIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchData = useCallback(async () => {
    try {
      const [classRes, bookingRes] = await Promise.all([
        getClasses().catch(() => ({ data: { data: [] } })),
        getMyBookings().catch(() => ({ data: { data: [] } })),
      ]);
      const cls = classRes.data.data || [];
      const bkList = bookingRes.data.data || [];
      setAllClasses(cls);
      setClasses(cls);
      setBookingIds(new Set(bkList.filter((b) => b.status === 'BOOKED').map((b) => b.classId)));
      setCancelledIds(new Set(bkList.filter((b) => b.status === 'CANCELLED').map((b) => b.classId)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    if (search.trim() === '') {
      setClasses(allClasses);
    } else {
      setClasses(
        allClasses.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, allClasses]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleBook = async (classId) => {
    try {
      await bookClass(classId);
      showMsg('Booking berhasil!', 'success');
      fetchData();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Booking gagal', 'error');
    }
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const renderItem = ({ item: c }) => {
    const booked = bookingIds.has(c.id);
    const wasCancelled = cancelledIds.has(c.id);
    const full = c.status === 'FULL';
    const classCancelled = c.status === 'CANCELLED';

    let btnStyle = styles.btnBook;
    let btnText = 'Book';
    let disabled = false;
    if (booked) {
      btnStyle = styles.btnBooked;
      btnText = 'Booked ✓';
      disabled = true;
    } else if (classCancelled) {
      btnStyle = styles.btnCancelled;
      btnText = 'Kelas Dibatalkan';
      disabled = true;
    } else if (full) {
      btnStyle = styles.btnFull;
      btnText = 'Full';
      disabled = true;
    } else if (wasCancelled) {
      btnStyle = styles.btnBook;
      btnText = '🔄 Book Lagi';
      disabled = false;
    }

    return (
      <View style={styles.card}>
        <View style={[styles.iconCircle, { backgroundColor: classCancelled ? '#ff4444' : '#4caf7d' }]}>
          <Text style={{ fontSize: 18 }}>🏋️</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.className}>{c.name}</Text>
          <Text style={styles.subText}>
            {formatTime(c.startTime)} – {formatTime(c.endTime)}
          </Text>
          <Text style={styles.subText}>Instruktur: {c.trainerName}</Text>
          <Text style={styles.subText}>
            Kuota: {c.currentCapacity}/{c.maxCapacity}
          </Text>
          <TouchableOpacity
            style={btnStyle}
            disabled={disabled}
            onPress={() => handleBook(c.id)}
          >
            <Text style={styles.btnText}>{btnText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Jadwal Kelas</Text>
          <Text style={styles.subtitle}>Pilih kelas dan booking</Text>
        </View>
        <TouchableOpacity
          style={styles.myBookingBtn}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <Text style={styles.myBookingBtnText}>🗓 Booking Saya</Text>
        </TouchableOpacity>
      </View>

      {/* Message */}
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

      {/* Search */}
      <View style={styles.searchBox}>
        <Text style={{ marginRight: 8 }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari kelas..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator color="#4caf7d" size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4caf7d" />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Tidak ada kelas tersedia</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: '#aaa', fontSize: 13, marginTop: 2 },
  myBookingBtn: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  myBookingBtnText: { color: '#fff', fontSize: 13 },
  msgBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#1a1a1a',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },
  list: { padding: 16, paddingTop: 0 },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  className: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  subText: { color: '#aaa', fontSize: 12, marginBottom: 2 },
  btnBook: {
    backgroundColor: '#4caf7d',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  btnBooked: {
    backgroundColor: '#2a5a3a',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  btnFull: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  btnCancelled: {
    backgroundColor: '#2a1a1a',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  btnCancelledByUser: {
    backgroundColor: '#1a2a1a',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#4caf7d',
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  emptyText: { color: '#aaa', textAlign: 'center', marginTop: 60, fontSize: 14 },
});
