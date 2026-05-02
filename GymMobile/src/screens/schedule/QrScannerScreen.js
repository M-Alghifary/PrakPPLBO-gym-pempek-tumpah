import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { scanAttendance } from '../../api/scheduleApi';

export default function QrScannerScreen({ route, navigation }) {
  const { classId, className } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || loading) return;

    if (!data.startsWith('GYM-CLASS-')) {
      Alert.alert('QR Tidak Valid', 'QR Code ini bukan untuk absensi Lenjer Fit.');
      return;
    }

    const parts = data.split('-');
    // Format: GYM-CLASS-{classId}-{timestamp}
    // parts:  [0] [1]   [2]       [3]
    const scannedClassId = parseInt(parts[2]);

    if (scannedClassId !== classId) {
      Alert.alert(
        'Kelas Tidak Sesuai',
        `QR ini untuk kelas lain. Kamu booking kelas ${className}.`
      );
      return;
    }

    setScanned(true);
    setLoading(true);

    try {
      await scanAttendance(classId);
      Alert.alert(
        '✅ Presensi Berhasil!',
        `Selamat! Kehadiran kamu di kelas ${className} sudah tercatat.`,
        [{
          text: 'OK',
          onPress: () => navigation.goBack(),
        }]
      );
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mencatat presensi';
      Alert.alert('Gagal', msg, [{
        text: 'Coba Lagi',
        onPress: () => setScanned(false),
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.page}>
        <ActivityIndicator color="#4caf7d" size="large" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.page}>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionText}>
            📷 Izin kamera dibutuhkan untuk scan QR absensi
          </Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Izinkan Kamera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>← Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan QR Absensi</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Info kelas */}
        <View style={styles.classInfo}>
          <Text style={styles.classLabel}>Kelas</Text>
          <Text style={styles.className}>{className}</Text>
        </View>

        {/* Frame scanner */}
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>

        {/* Instruksi */}
        <View style={styles.footer}>
          {loading ? (
            <ActivityIndicator color="#4caf7d" size="large" />
          ) : (
            <Text style={styles.instruction}>
              {scanned
                ? 'Memproses...'
                : 'Arahkan kamera ke QR Code\nyang berada di area kelas untuk mencatat kehadiran.'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const FRAME_SIZE = 240;
const CORNER_SIZE = 24;
const CORNER_WIDTH = 4;

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#111111' },
  container: { flex: 1, backgroundColor: '#000' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  classInfo: { alignItems: 'center' },
  classLabel: { color: '#aaa', fontSize: 13 },
  className: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  scanFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#4caf7d',
  },
  cornerTL: {
    top: 0, left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
  },
  cornerTR: {
    top: 0, right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
  },
  cornerBL: {
    bottom: 0, left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
  },
  cornerBR: {
    bottom: 0, right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
  },
  footer: { alignItems: 'center' },
  instruction: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  permissionBtn: {
    backgroundColor: '#4caf7d',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 12,
  },
  permissionBtnText: { color: '#111', fontWeight: 'bold', fontSize: 15 },
  backBtn: { padding: 12 },
  backBtnText: { color: '#4caf7d', fontSize: 14 },
});
