import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile } from '../../api/memberApi';
import { getActiveMembership } from '../../api/membershipApi';
import { calculateBmi } from '../../api/memberApi';

export default function ProfileScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [profile, setProfile] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmiResult, setBmiResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [storedName, storedEmail, storedRole] = await Promise.all([
        AsyncStorage.getItem('name'),
        AsyncStorage.getItem('email'),
        AsyncStorage.getItem('role'),
      ]);
      setName(storedName || '');
      setEmail(storedEmail || '');
      setRole(storedRole || '');

      const [profileRes, membershipRes] = await Promise.all([
        getProfile().catch(() => ({ data: { data: null } })),
        getActiveMembership().catch(() => ({ data: { data: null } })),
      ]);

      const p = profileRes.data.data;
      setProfile(p);
      setMembership(membershipRes.data.data);

      if (p) {
        setHeight(String(p.height || ''));
        setWeight(String(p.weight || ''));
        if (p.bmi) {
          setBmiResult({ bmi: p.bmi, category: p.bmiCategory });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  const handleCalculateBmi = async () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w) {
      Alert.alert('Error', 'Isi tinggi dan berat badan terlebih dahulu');
      return;
    }
    setCalculating(true);
    try {
      const res = await calculateBmi({ height: h, weight: w });
      setBmiResult(res.data.data);
    } catch {
      const bmi = (w / ((h / 100) * (h / 100))).toFixed(1);
      let category = 'Normal';
      if (bmi < 18.5) category = 'Underweight';
      else if (bmi < 25) category = 'Normal';
      else if (bmi < 30) category = 'Overweight';
      else category = 'Obese';
      setBmiResult({ bmi, category });
    } finally {
      setCalculating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const bmiColor = (category) => {
    if (category === 'Normal') return '#4caf7d';
    if (category === 'Underweight') return '#ffa726';
    if (category === 'Overweight') return '#ff9800';
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
        <Text style={styles.title}>Profil</Text>

        {/* User Info */}
        <View style={styles.card}>
          <View style={styles.avatarCircle}>
            <Text style={{ fontSize: 32 }}>👤</Text>
          </View>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.userSub}>{email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{role || 'MEMBER'}</Text>
          </View>
        </View>

        {/* BMI Calculator */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⊞ BMI Kalkulator</Text>
          <View style={styles.bmiRow}>
            <View style={styles.bmiGroup}>
              <Text style={styles.bmiLabel}>Tinggi (cm)</Text>
              <TextInput
                style={styles.bmiInput}
                placeholder="170"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
              />
            </View>
            <View style={styles.bmiGroup}>
              <Text style={styles.bmiLabel}>Berat (kg)</Text>
              <TextInput
                style={styles.bmiInput}
                placeholder="64"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
              />
            </View>
          </View>
          <TouchableOpacity
            style={[styles.calcBtn, calculating && styles.calcBtnDisabled]}
            onPress={handleCalculateBmi}
            disabled={calculating}
          >
            <Text style={styles.calcBtnText}>
              {calculating ? 'Menghitung...' : 'Hitung BMI'}
            </Text>
          </TouchableOpacity>
          {bmiResult && (
            <View style={styles.bmiResult}>
              <Text style={[styles.bmiCategory, { color: bmiColor(bmiResult.category) }]}>
                {bmiResult.category}
              </Text>
              <Text style={styles.bmiValue}>BMI: {bmiResult.bmi}</Text>
            </View>
          )}
        </View>

        {/* Membership Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💳 Membership</Text>
          {membership ? (
            <>
              <Text style={styles.membershipName}>{membership.packageName}</Text>
              <Text style={styles.membershipSub}>{membership.daysRemaining} hari tersisa</Text>
              <Text style={styles.membershipSub}>
                Valid sampai{' '}
                {new Date(membership.endDate).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.membershipInactive}>Tidak ada membership aktif</Text>
              <TouchableOpacity
                style={styles.buyBtn}
                onPress={() => navigation.navigate('MembershipPackages')}
              >
                <Text style={styles.buyBtnText}>Beli Paket Membership</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Menu Buttons */}
        {[
          { icon: '🗓', label: 'Booking Saya', screen: 'MyBookings' },
          { icon: '🕐', label: 'Riwayat Transaksi', screen: 'PaymentHistory' },
          { icon: '📦', label: 'Paket Membership', screen: 'MembershipPackages' },
        ].map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuBtn}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.menuBtnText}>{item.icon}  {item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#111111' },
  scroll: { padding: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  userName: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  userSub: { color: '#aaa', fontSize: 13, marginBottom: 8 },
  roleBadge: {
    backgroundColor: '#4caf7d',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  roleText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  cardTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  bmiRow: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 12 },
  bmiGroup: { flex: 1 },
  bmiLabel: { color: '#aaa', fontSize: 12, marginBottom: 6 },
  bmiInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
  },
  calcBtn: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  calcBtnDisabled: { opacity: 0.6 },
  calcBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  bmiResult: { alignItems: 'center', marginTop: 14 },
  bmiCategory: { fontSize: 22, fontWeight: 'bold' },
  bmiValue: { color: '#fff', fontSize: 16, marginTop: 4 },
  membershipName: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
  membershipSub: { color: '#aaa', fontSize: 13, marginBottom: 3 },
  membershipInactive: { color: '#ff6b6b', fontSize: 14, marginBottom: 10 },
  buyBtn: {
    backgroundColor: '#4caf7d',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 6,
  },
  buyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  menuBtn: {
    backgroundColor: '#1e1e1e',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuBtnText: { color: '#fff', fontSize: 14 },
  menuArrow: { color: '#aaa', fontSize: 20 },
  logoutBtn: {
    backgroundColor: '#2a1a1a',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  logoutText: { color: '#ff6b6b', fontWeight: 'bold', fontSize: 15 },
});
