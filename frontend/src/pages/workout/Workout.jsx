import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axiosInstance';

export default function Workout() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [form, setForm] = useState({
    workoutDate: new Date().toISOString().split('T')[0],
    exerciseName: '',
    weightKg: '',
    sets: '',
    reps: '',
    durationMinutes: '',
    notes: '',
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/workout/logs');
      setLogs(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.exerciseName) {
      setMessage({ text: 'Nama gerakan wajib diisi', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return;
    }

    try {
      await api.post('/workout/logs', {
        workoutDate: form.workoutDate,
        exerciseName: form.exerciseName,
        weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
        sets: form.sets ? parseInt(form.sets) : null,
        reps: form.reps ? parseInt(form.reps) : null,
        durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : null,
        notes: form.notes || null,
      });

      setMessage({ text: 'Workout berhasil ditambahkan!', type: 'success' });
      setForm({
        workoutDate: new Date().toISOString().split('T')[0],
        exerciseName: '',
        weightKg: '',
        sets: '',
        reps: '',
        durationMinutes: '',
        notes: '',
      });
      fetchLogs();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Gagal menambahkan workout',
        type: 'error',
      });
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleDelete = async (logId) => {
    if (!window.confirm('Hapus log ini?')) return;
    try {
      await api.delete(`/workout/logs/${logId}`);
      setMessage({ text: 'Log berhasil dihapus', type: 'success' });
      fetchLogs();
    } catch (err) {
      setMessage({ text: 'Gagal menghapus log', type: 'error' });
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  // Kelompokkan log berdasarkan tanggal
  const groupedLogs = logs.reduce((acc, log) => {
    const date = log.workoutDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  return (
    <Layout>
      <div style={styles.pageHeader}>
        <h2 style={styles.title}>Workout Log</h2>
        <p style={styles.subtitle}>Catat dan pantau latihan harianmu</p>
      </div>

      {message.text && (
        <div style={{
          ...styles.notification,
          backgroundColor: message.type === 'success' ? '#1a3a2a' : '#3a1a1a',
          borderColor: message.type === 'success' ? '#4caf7d' : '#ff6b6b',
          color: message.type === 'success' ? '#4caf7d' : '#ff6b6b',
        }}>
          {message.text}
        </div>
      )}

      <div style={styles.mainLayout}>
        {/* Kiri — Tabel Log */}
        <div style={styles.leftSection}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>⊞ Workout Log</div>
            {loading ? (
              <div style={{ color: '#aaa', textAlign: 'center', padding: '40px' }}>
                Loading...
              </div>
            ) : logs.length === 0 ? (
              <div style={{ color: '#aaa', textAlign: 'center', padding: '40px' }}>
                Belum ada log workout. Tambahkan sekarang!
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Tanggal', 'Latihan', 'Beban', 'Sets', 'Reps', 'Durasi', 'Notes', ''].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedLogs)
                    .sort(([a], [b]) => new Date(b) - new Date(a))
                    .map(([date, entries]) =>
                      entries.map((w, i) => (
                        <tr key={w.id}>
                          {/* Tanggal hanya tampil di baris pertama per grup */}
                          {i === 0 ? (
                            <td style={styles.td} rowSpan={entries.length}>
                              {new Date(date).toLocaleDateString('id-ID', {
                                day: 'numeric', month: 'long', year: 'numeric',
                              })}
                            </td>
                          ) : null}
                          <td style={styles.td}>{w.exerciseName}</td>
                          <td style={styles.td}>
                            {w.weightKg ? `${w.weightKg} kg` : '-'}
                          </td>
                          <td style={styles.td}>{w.sets || '-'}</td>
                          <td style={styles.td}>{w.reps || '-'}</td>
                          <td style={styles.td}>
                            {w.durationMinutes ? `${w.durationMinutes} menit` : '-'}
                          </td>
                          <td style={{ ...styles.td, color: '#aaa', maxWidth: '150px' }}>
                            {w.notes || '-'}
                          </td>
                          <td style={styles.td}>
                            <button
                              style={styles.btnDelete}
                              onClick={() => handleDelete(w.id)}
                            >
                              🗑
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Kanan — Form Tambah */}
        <div style={styles.rightSection}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Tambah Gerakan</div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Tanggal</label>
              <input
                style={styles.input}
                type="date"
                value={form.workoutDate}
                onChange={(e) => setForm({ ...form, workoutDate: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nama Gerakan *</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Nama Gerakan"
                value={form.exerciseName}
                onChange={(e) => setForm({ ...form, exerciseName: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Beban (kg)</label>
              <input
                style={styles.input}
                type="number"
                placeholder="Beban"
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Sets</label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="Sets"
                  value={form.sets}
                  onChange={(e) => setForm({ ...form, sets: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Reps</label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="Reps"
                  value={form.reps}
                  onChange={(e) => setForm({ ...form, reps: e.target.value })}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Durasi (menit)</label>
              <input
                style={styles.input}
                type="number"
                placeholder="Durasi"
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Notes</label>
              <textarea
                style={{ ...styles.input, resize: 'none', height: '80px' }}
                placeholder="Catatan tambahan..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <button style={styles.btnTambah} onClick={handleSubmit}>
              ＋ Tambah Gerakan
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  pageHeader: { marginBottom: '20px' },
  title: { color: '#fff', fontSize: '22px', margin: 0, fontFamily: 'sans-serif' },
  subtitle: { color: '#aaa', fontSize: '14px', margin: '4px 0 0' },
  notification: {
    padding: '12px 16px', borderRadius: '10px',
    border: '1px solid', marginBottom: '16px', fontSize: '14px',
  },
  mainLayout: { display: 'flex', gap: '20px' },
  leftSection: { flex: 1, overflow: 'hidden' },
  rightSection: { width: '240px', flexShrink: 0 },
  card: {
    backgroundColor: '#1e1e1e', borderRadius: '16px', padding: '20px',
  },
  cardTitle: {
    color: '#fff', fontWeight: 'bold', fontSize: '15px',
    marginBottom: '16px', fontFamily: 'sans-serif',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    color: '#aaa', fontSize: '12px', textAlign: 'left',
    paddingBottom: '10px', borderBottom: '1px solid #2a2a2a',
    paddingRight: '12px',
  },
  td: {
    color: '#fff', fontSize: '13px',
    padding: '10px 12px 10px 0',
    borderBottom: '1px solid #2a2a2a',
    verticalAlign: 'top',
  },
  btnDelete: {
    background: 'none', border: 'none',
    cursor: 'pointer', fontSize: '16px',
    opacity: 0.6,
  },
  formGroup: { marginBottom: '12px' },
  formRow: { display: 'flex', gap: '10px' },
  label: {
    color: '#aaa', fontSize: '12px',
    display: 'block', marginBottom: '6px',
  },
  input: {
    width: '100%', padding: '10px 12px',
    backgroundColor: '#2a2a2a', border: 'none',
    borderRadius: '8px', color: '#fff',
    fontSize: '13px', outline: 'none',
    boxSizing: 'border-box',
  },
  btnTambah: {
    width: '100%', padding: '12px', borderRadius: '8px',
    border: 'none', backgroundColor: '#2a2a2a',
    color: '#fff', fontSize: '14px',
    cursor: 'pointer', fontWeight: 'bold',
    marginTop: '4px',
  },
};