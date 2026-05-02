import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  SafeAreaView,
  ScrollView,
  RefreshControl,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getActiveMembership, getPackages } from '../api/membershipApi';
import { getClasses, getMyBookings, bookClass } from '../api/scheduleApi';

export default function HomeScreen({ navigation }) {
  const [name, setName] = useState('');
  const [membership, setMembership] = useState(null);
  const [classes, setClasses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookingIds, setBookingIds] = useState(new Set());
  const [message, setMessage] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const storedName = await AsyncStorage.getItem('name');
      setName(storedName || 'Member');

      const [memberRes, classRes, bookingRes] = await Promise.all([
        getActiveMembership().catch(() => ({ data: { data: null } })),
        getClasses().catch(() => ({ data: { data: [] } })),
        getMyBookings().catch(() => ({ data: { data: [] } })),
      ]);

      setMembership(memberRes.data.data);
      setClasses((classRes.data.data || []).slice(0, 3));
      const bkList = bookingRes.data.data || [];
      setBookings(bkList.slice(0, 2));
      setBookingIds(new Set(bkList.filter((b) => b.status === 'BOOKED').map((b) => b.classId)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('token').then(token => {
      console.log('Token:', token);
    });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  const handleBook = async (classId) => {
    try {
      await bookClass(classId);
      showMessage('Booking berhasil!');
      fetchAll();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Booking gagal');
    }
  };

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

  const statusColor = (status) => {
    if (status === 'BOOKED') return '#4caf7d';
    if (status === 'ATTENDED') return '#4a9eff';
    return '#ff6b6b';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.page}>
        <ActivityIndicator color="#4caf7d" size="large" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4caf7d" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Selamat Datang,</Text>
          <Text style={styles.name}>{name}! 👋</Text>
        </View>

        {/* Message */}
        {!!message && (
          <View style={styles.messageBanner}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}

        {/* Membership Card */}
        <View style={[styles.memberCard, !membership && styles.memberCardInactive]}>
          <View style={styles.memberCardTop}>
            <Text style={styles.memberCardBrand}>⚙️ Lenjer Fit</Text>
            <Text style={styles.memberCardLabel}>GYM MEMBER</Text>
          </View>
          <Text style={styles.memberCardName}>{name}</Text>
          {membership ? (
            <>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>✅ ACTIVE</Text>
              </View>
              <Text style={styles.memberCardSub}>
                Valid s/d {new Date(membership.endDate).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </Text>
              <Text style={styles.daysRemaining}>{membership.daysRemaining} hari tersisa</Text>
            </>
          ) : (
            <>
              <Text style={styles.inactiveText}>❌ Tidak ada membership aktif</Text>
              <TouchableOpacity
                style={styles.buyBtn}
                onPress={() => navigation.navigate('MembershipPackages')}
              >
                <Text style={styles.buyBtnText}>Beli Sekarang</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Aksi Cepat</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => navigation.navigate('Workout')}
          >
            <Text style={styles.quickBtnText}>📋 Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => navigation.navigate('Jadwal')}
          >
            <Text style={styles.quickBtnText}>📅 Jadwal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => navigation.navigate('MyBookings')}
          >
            <Text style={styles.quickBtnText}>🗓 Booking Saya</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => navigation.navigate('MembershipPackages')}
          >
            <Text style={styles.quickBtnText}>💲 Membership</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Jadwal Kelas */}
        <Text style={styles.sectionTitle}>Jadwal Kelas</Text>
        {classes.length === 0 ? (
          <Text style={styles.emptyText}>Tidak ada kelas tersedia</Text>
        ) : (
          classes.map((c) => {
            const booked = bookingIds.has(c.id);
            const full = c.status === 'FULL';
            return (
              <View key={c.id} style={styles.classCard}>
                <View style={styles.classCardLeft}>
                  <Text style={styles.className}>{c.name}</Text>
                  <Text style={styles.classInfo}>
                    {formatTime(c.startTime)} – {formatTime(c.endTime)}
                  </Text>
                  <Text style={styles.classInfo}>Instruktur: {c.trainerName}</Text>
                  <Text style={styles.classInfo}>
                    Kuota: {c.currentCapacity}/{c.maxCapacity}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.bookBtn,
                    (full || booked) && styles.bookBtnDisabled,
                  ]}
                  disabled={full || booked}
                  onPress={() => handleBook(c.id)}
                >
                  <Text style={styles.bookBtnText}>
                    {booked ? 'Booked' : full ? 'Full' : 'Book'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        {/* Booking Terbaru */}
        <Text style={styles.sectionTitle}>Booking Terbaru</Text>
        {bookings.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada booking</Text>
        ) : (
          bookings.map((b, i) => (
              <TouchableOpacity
                key={i}
                style={styles.bookingCard}
                onPress={() => b.status === 'BOOKED' && navigation.navigate('QrScanner', {
                  classId: b.classId,
                  className: b.className,
                
                })}
              >
              <Text style={styles.bookingName}>{b.className}</Text>
              <Text style={styles.bookingDate}>{formatDate(b.startTime)}</Text>
              <Text style={[styles.bookingStatus, { color: statusColor(b.status) }]}>
                {b.status === 'BOOKED' && (
                  <Text style={{ color: '#4caf7d', fontSize: 11, marginTop: 4 }}>
                    📷 Tap untuk scan absen
                  </Text>
                )}
              </Text>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#111111' },
  scroll: { padding: 16 },
  header: { marginBottom: 20 },
  greeting: { color: '#aaaaaa', fontSize: 14 },
  name: { color: '#ffffff', fontSize: 22, fontWeight: 'bold' },
  messageBanner: {
    backgroundColor: '#1a3a2a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4caf7d',
  },
  messageText: { color: '#4caf7d', fontSize: 13 },
  memberCard: {
    backgroundColor: '#c9a84c',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  memberCardInactive: { backgroundColor: '#2a2a2a' },
  memberCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  memberCardBrand: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  memberCardLabel: { color: '#fff', fontSize: 12, opacity: 0.8 },
  memberCardName: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginBottom: 6 },
  activeBadge: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 6,
  },
  activeBadgeText: { color: '#4caf7d', fontWeight: 'bold', fontSize: 13 },
  memberCardSub: { color: '#fff', fontSize: 13, opacity: 0.9 },
  daysRemaining: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginTop: 4 },
  inactiveText: { color: '#ff6b6b', fontSize: 14, marginBottom: 10 },
  buyBtn: {
    backgroundColor: '#4caf7d',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  buyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 4,
  },
  quickScroll: { marginBottom: 20 },
  quickBtn: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  quickBtnText: { color: '#fff', fontSize: 13 },
  classCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  classCardLeft: { flex: 1, marginRight: 12 },
  className: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  classInfo: { color: '#aaaaaa', fontSize: 12, marginBottom: 2 },
  bookBtn: {
    backgroundColor: '#4caf7d',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 64,
    alignItems: 'center',
  },
  bookBtnDisabled: { backgroundColor: '#333' },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  bookingCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  bookingName: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  bookingDate: { color: '#aaaaaa', fontSize: 12, marginBottom: 4 },
  bookingStatus: { fontSize: 12, fontWeight: 'bold' },
  emptyText: { color: '#aaaaaa', fontSize: 13, marginBottom: 12 },
});
