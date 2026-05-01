import React, { useState } from 'react';
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
} from 'react-native';
import { initiatePayment, confirmPayment } from '../../api/paymentApi';
import { formatRupiah } from '../../utils/format';

const METHODS = [
  { key: 'BANK_TRANSFER', label: '🏦 Transfer Bank' },
  { key: 'E_WALLET', label: '💳 E-Wallet' },
  { key: 'QRIS', label: '📱 QRIS' },
];

export default function PaymentScreen({ route, navigation }) {
  const { packageId, packageName, price } = route.params;
  const [selectedMethod, setSelectedMethod] = useState('BANK_TRANSFER');
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [paymentDetail, setPaymentDetail] = useState('BCA');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleInitiate = async () => {
    if (selectedMethod === 'E_WALLET' && !phoneNumber.trim()) {
      Alert.alert('Validasi', 'Nomor HP wajib diisi untuk E-Wallet');
      return;
    }
    setLoading(true);
    try {
      const body = {
        paymentMethod: selectedMethod,
        paymentDetail: selectedMethod === 'QRIS' ? null : paymentDetail,
        phoneNumber: selectedMethod === 'E_WALLET' ? phoneNumber : null,
      };
      const res = await initiatePayment(packageId, body);
      setPaymentData(res.data.data);
    } catch (err) {
      Alert.alert('Gagal', err.response?.data?.message || 'Gagal memproses pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await confirmPayment(paymentData.paymentId);
      Alert.alert('Berhasil!', 'Pembayaran dikonfirmasi. Membership aktif!', [
        {
          text: 'OK',
          onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          }),
        },
      ]);
    } catch (err) {
      Alert.alert('Gagal', err.response?.data?.message || 'Gagal mengkonfirmasi pembayaran');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pembayaran</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Package Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detail Paket</Text>
          <Text style={styles.packageName}>{packageName}</Text>
          <Text style={styles.packagePrice}>{formatRupiah(price)}</Text>
        </View>

        {!paymentData ? (
          <>
            {/* Method Selector */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Metode Pembayaran</Text>
              {METHODS.map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={[
                    styles.methodRow,
                    selectedMethod === m.key && styles.methodRowSelected,
                  ]}
                  onPress={() => setSelectedMethod(m.key)}
                >
                  <View style={[
                    styles.radio,
                    selectedMethod === m.key && styles.radioSelected,
                  ]} />
                  <Text style={styles.methodLabel}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedMethod === 'BANK_TRANSFER' && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Pilih Bank</Text>
                {['BCA', 'Mandiri', 'BRI', 'BNI'].map((bank) => (
                  <TouchableOpacity
                    key={bank}
                    style={[styles.methodRow, paymentDetail === bank && styles.methodRowSelected]}
                    onPress={() => setPaymentDetail(bank)}
                  >
                    <View style={[styles.radio, paymentDetail === bank && styles.radioSelected]} />
                    <Text style={styles.methodLabel}>{bank}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {selectedMethod === 'E_WALLET' && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Pilih E-Wallet</Text>
                {['GoPay', 'OVO', 'Dana', 'ShopeePay'].map((wallet) => (
                  <TouchableOpacity
                    key={wallet}
                    style={[styles.methodRow, paymentDetail === wallet && styles.methodRowSelected]}
                    onPress={() => setPaymentDetail(wallet)}
                  >
                    <View style={[styles.radio, paymentDetail === wallet && styles.radioSelected]} />
                    <Text style={styles.methodLabel}>{wallet}</Text>
                  </TouchableOpacity>
                ))}
                <TextInput
                  style={{
                    backgroundColor: '#2a2a2a',
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    color: '#fff',
                    fontSize: 14,
                    marginTop: 10,
                  }}
                  placeholder="Nomor HP (contoh: 081234567890)"
                  placeholderTextColor="#666"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            )}

            <TouchableOpacity
              style={[styles.payBtn, loading && styles.payBtnDisabled]}
              onPress={handleInitiate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#111" />
              ) : (
                <Text style={styles.payBtnText}>Bayar {formatRupiah(price)}</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Payment Instructions */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Instruksi Pembayaran</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Metode</Text>
                <Text style={styles.infoValue}>
                  {METHODS.find((m) => m.key === selectedMethod)?.label || selectedMethod}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Kode Pembayaran</Text>
                <Text style={styles.codeValue}>{paymentData.paymentCode}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total Bayar</Text>
                <Text style={styles.infoValue}>{formatRupiah(paymentData.amount)}</Text>
              </View>
              <View style={styles.instructionBox}>
                <Text style={styles.instructionText}>
                  1. Buka aplikasi pembayaran kamu{'\n'}
                  2. Masukkan kode pembayaran di atas{'\n'}
                  3. Selesaikan pembayaran{'\n'}
                  4. Tekan tombol konfirmasi di bawah
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, confirming && styles.payBtnDisabled]}
              onPress={handleConfirm}
              disabled={confirming}
            >
              {confirming ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmBtnText}>✅ Saya Sudah Bayar</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
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
  scroll: { padding: 16 },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  cardTitle: { color: '#aaa', fontSize: 13, marginBottom: 10 },
  packageName: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginBottom: 6 },
  packagePrice: { color: '#4caf7d', fontWeight: 'bold', fontSize: 22 },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    marginBottom: 8,
    gap: 12,
  },
  methodRowSelected: { borderWidth: 1, borderColor: '#4caf7d' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#555',
  },
  radioSelected: { borderColor: '#4caf7d', backgroundColor: '#4caf7d' },
  methodLabel: { color: '#fff', fontSize: 14 },
  payBtn: {
    backgroundColor: '#4caf7d',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  payBtnDisabled: { opacity: 0.6 },
  payBtnText: { color: '#111', fontWeight: 'bold', fontSize: 16 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  infoLabel: { color: '#aaa', fontSize: 13 },
  infoValue: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  codeValue: { color: '#4caf7d', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 },
  instructionBox: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
  },
  instructionText: { color: '#ccc', fontSize: 13, lineHeight: 22 },
  confirmBtn: {
    backgroundColor: '#2a5a3a',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4caf7d',
  },
  confirmBtnText: { color: '#4caf7d', fontWeight: 'bold', fontSize: 16 },
});
