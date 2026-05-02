import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile, updateProfile, calculateBmi } from '../../api/memberApi';
import { getActiveMembership, getPackages } from '../../api/membershipApi';

const formatRupiah = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function ProfileScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [membership, setMembership] = useState(null);
  const [packages, setPackages] = useState([]);
  const [bmiResult, setBmiResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [storedName, storedEmail] = await Promise.all([
        AsyncStorage.getItem('name'),
        AsyncStorage.getItem('email'),
      ]);
      setName(storedName || '');
      setEmail(storedEmail || '');

      const [profileRes, membershipRes, packagesRes] = await Promise.all([
        getProfile().catch(() => ({ data: { data: null } })),
        getActiveMembership().catch(() => ({ data: { data: null } })),
        getPackages().catch(() => ({ data: { data: [] } })),
      ]);

      const p = profileRes.data.data;
      if (p) {
        setPhoneNumber(p.phoneNumber || '');
        setHeight(String(p.height || ''));
        setWeight(String(p.weight || ''));
        setDateOfBirth(p.dateOfBirth || '');
        setFitnessGoal(p.fitnessGoal || '');
        setProfilePhoto(p.profilePhotoUrl || null);
        if (p.bmi) setBmiResult({ bmi: p.bmi, category: p.bmiCategory });
      }

      setMembership(membershipRes.data.data);
      setPackages(packagesRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({
        phoneNumber: phoneNumber || null,
        height: parseFloat(height) || null,
        weight: parseFloat(weight) || null,
        dateOfBirth: dateOfBirth || null,
        fitnessGoal: fitnessGoal || null,
        profilePhotoUrl: profilePhoto || null,
      });
      Alert.alert('Berhasil', 'Profil berhasil diperbarui');
      setEditMode(false);
      fetchAll();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Diperlukan', 'Izin akses galeri dibutuhkan untuk memilih foto');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setProfilePhoto(base64Uri);
    }
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
          <TouchableOpacity onPress={editMode ? handlePickPhoto : null} style={styles.avatarWrapper}>
            {profilePhoto ? (
              <Image
                source={{ uri: profilePhoto }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={{ fontSize: 32 }}>👤</Text>
              </View>
            )}
            {editMode && (
              <View style={styles.avatarEditBadge}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>📷 Edit</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.userSub}>{email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>MEMBER</Text>
          </View>
        </View>

        {/* Edit Profile */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📋 Data Diri</Text>
            <TouchableOpacity onPress={() => setEditMode(!editMode)}>
              <Text style={styles.editToggle}>{editMode ? 'Batal' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>No. Telepon</Text>
            {editMode ? (
              <TextInput
                style={styles.fieldInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholder="08xxxxxxxxxx"
                placeholderTextColor="#666"
              />
            ) : (
              <Text style={styles.fieldValue}>{phoneNumber || '-'}</Text>
            )}
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Tinggi (cm)</Text>
            {editMode ? (
              <TextInput
                style={styles.fieldInput}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                placeholder="170"
                placeholderTextColor="#666"
              />
            ) : (
              <Text style={styles.fieldValue}>{height ? `${height} cm` : '-'}</Text>
            )}
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Berat (kg)</Text>
            {editMode ? (
              <TextInput
                style={styles.fieldInput}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="65"
                placeholderTextColor="#666"
              />
            ) : (
              <Text style={styles.fieldValue}>{weight ? `${weight} kg` : '-'}</Text>
            )}
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Tgl. Lahir</Text>
            {editMode ? (
              <TextInput
                style={styles.fieldInput}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#666"
              />
            ) : (
              <Text style={styles.fieldValue}>{dateOfBirth || '-'}</Text>
            )}
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Fitness Goal</Text>
            {editMode ? (
              <TextInput
                style={styles.fieldInput}
                value={fitnessGoal}
                onChangeText={setFitnessGoal}
                placeholder="Turunkan berat badan..."
                placeholderTextColor="#666"
              />
            ) : (
              <Text style={styles.fieldValue} numberOfLines={2}>{fitnessGoal || '-'}</Text>
            )}
          </View>

          {editMode && (
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</Text>
            </TouchableOpacity>
          )}
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
              {packages.length > 0 && (
                <View style={{ width: '100%', marginTop: 10 }}>
                  {packages.map((pkg) => (
                    <TouchableOpacity
                      key={pkg.id}
                      style={styles.packageCard}
                      onPress={() => navigation.navigate('MembershipPackages')}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.packageName}>{pkg.name}</Text>
                        <Text style={styles.packageDuration}>{pkg.durationDays} hari</Text>
                        {pkg.description ? (
                          <Text style={styles.packageDesc}>{pkg.description}</Text>
                        ) : null}
                      </View>
                      <Text style={styles.packagePrice}>{formatRupiah(pkg.price)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
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
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4caf7d',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  editToggle: { color: '#4caf7d', fontWeight: 'bold', fontSize: 14 },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  fieldLabel: { color: '#aaa', fontSize: 13, flex: 1 },
  fieldValue: { color: '#fff', fontSize: 13, flex: 1, textAlign: 'right' },
  fieldInput: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 13,
    textAlign: 'right',
  },
  saveBtn: {
    backgroundColor: '#4caf7d',
    borderRadius: 10,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
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
  packageCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  packageName: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  packageDuration: { color: '#aaa', fontSize: 12, marginTop: 2 },
  packageDesc: { color: '#888', fontSize: 11, marginTop: 2 },
  packagePrice: { color: '#4caf7d', fontWeight: 'bold', fontSize: 14, marginLeft: 8 },
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
