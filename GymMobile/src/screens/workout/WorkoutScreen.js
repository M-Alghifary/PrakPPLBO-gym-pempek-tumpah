import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { getWorkoutLogs, addWorkoutLog, deleteWorkoutLog } from '../../api/workoutApi';

const EMPTY_FORM = {
  exercise: '',
  sets: '',
  reps: '',
  weight: '',
  notes: '',
};

export default function WorkoutScreen() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchLogs = useCallback(async () => {
    try {
      const res = await getWorkoutLogs();
      setLogs(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleSave = async () => {
    if (!form.exercise.trim()) {
      showMsg('Nama gerakan wajib diisi', 'error');
      return;
    }
    setSaving(true);
    try {
      await addWorkoutLog({
        exerciseName: form.exercise,
        workoutDate: new Date().toISOString().split('T')[0], 
        sets: form.sets ? parseInt(form.sets) : null,
        reps: form.reps ? parseInt(form.reps) : null,
        weight: form.weight ? parseFloat(form.weight) : null,
        notes: form.notes || null,
      });
            showMsg('Workout berhasil ditambahkan!', 'success');
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchLogs();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Gagal menambahkan workout', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Hapus Log', 'Hapus log workout ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteWorkoutLog(id);
            showMsg('Log berhasil dihapus', 'success');
            fetchLogs();
          } catch {
            showMsg('Gagal menghapus log', 'error');
          }
        },
      },
    ]);
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  const renderItem = ({ item: w }) => (
    <View style={styles.logCard}>
      <View style={styles.logRow}>
        <View style={styles.logInfo}>
          <Text style={styles.exerciseName}>{w.exercise || w.exerciseName}</Text>
          <Text style={styles.logDetail}>
            {[
              w.sets && `${w.sets} sets`,
              w.reps && `${w.reps} reps`,
              w.weight && `${w.weight} kg`,
            ].filter(Boolean).join('  ·  ') || 'Tidak ada detail'}
          </Text>
          {w.notes ? <Text style={styles.logNotes}>{w.notes}</Text> : null}
          <Text style={styles.logDate}>
            {formatDate(w.createdAt || w.workoutDate)}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(w.id)} style={styles.deleteBtn}>
          <Text style={{ fontSize: 18, opacity: 0.6 }}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Workout Log</Text>
          <Text style={styles.subtitle}>Catat latihan harianmu</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowForm((v) => !v)}
        >
          <Text style={styles.addBtnText}>{showForm ? '✕ Tutup' : '＋ Tambah'}</Text>
        </TouchableOpacity>
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

      {showForm && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.formContainer}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.formTitle}>Tambah Gerakan</Text>
            <TextInput
              style={styles.input}
              placeholder="Nama Gerakan *"
              placeholderTextColor="#666"
              value={form.exercise}
              onChangeText={(v) => setForm({ ...form, exercise: v })}
            />
            <View style={styles.formRow}>
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="Sets"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={form.sets}
                onChangeText={(v) => setForm({ ...form, sets: v })}
              />
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="Reps"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={form.reps}
                onChangeText={(v) => setForm({ ...form, reps: v })}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Beban (kg)"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={form.weight}
              onChangeText={(v) => setForm({ ...form, weight: v })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Catatan..."
              placeholderTextColor="#666"
              multiline
              value={form.notes}
              onChangeText={(v) => setForm({ ...form, notes: v })}
            />
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>
                {saving ? 'Menyimpan...' : 'Simpan Workout'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {loading ? (
        <ActivityIndicator color="#4caf7d" size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4caf7d" />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Belum ada log workout. Tambahkan sekarang!
            </Text>
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
  addBtn: {
    backgroundColor: '#4caf7d',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  msgBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#1a1a1a',
  },
  formContainer: {
    backgroundColor: '#1e1e1e',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    maxHeight: 400,
  },
  formTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginBottom: 12 },
  formRow: { flexDirection: 'row', gap: 10 },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  inputHalf: { flex: 1 },
  textArea: { height: 80, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: '#4caf7d',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  list: { padding: 16, paddingTop: 8 },
  logCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  logRow: { flexDirection: 'row', alignItems: 'flex-start' },
  logInfo: { flex: 1 },
  exerciseName: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  logDetail: { color: '#4caf7d', fontSize: 13, marginBottom: 3 },
  logNotes: { color: '#aaa', fontSize: 12, marginBottom: 3, fontStyle: 'italic' },
  logDate: { color: '#666', fontSize: 11 },
  deleteBtn: { padding: 4, marginLeft: 8 },
  emptyText: { color: '#aaa', textAlign: 'center', marginTop: 60, fontSize: 14 },
});
