import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axiosInstance';

export default function Report() {
  const [profile, setProfile] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [membership, setMembership] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bmiForm, setBmiForm] = useState({ height: '', weight: '' });
  const [bmiResult, setBmiResult] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [profileRes, workoutRes, membershipRes, bookingRes] = await Promise.all([
        api.get('/members/profile').catch(() => ({ data: { data: null } })),
        api.get('/workout/logs').catch(() => ({ data: { data: [] } })),
        api.get('/memberships/active').catch(() => ({ data: { data: null } })),
        api.get('/schedule/my-bookings').catch(() => ({ data: { data: [] } })),
      ]);
      setProfile(profileRes.data.data);
      setWorkouts(workoutRes.data.data || []);
      setMembership(membershipRes.data.data);
      setBookings(bookingRes.data.data || []);

      // Pre-fill BMI form dari profil
      if (profileRes.data.data) {
        setBmiForm({
          height: profileRes.data.data.height || '',
          weight: profileRes.data.data.weight || '',
        });
        setBmiResult({
          bmi: profileRes.data.data.bmi,
          category: profileRes.data.data.bmiCategory,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateBmi = () => {
    const h = parseFloat(bmiForm.height) / 100;
    const w = parseFloat(bmiForm.weight);
    if (!h || !w) return;
    const bmi = (w / (h * h)).toFixed(1);
    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obesitas';
    setBmiResult({ bmi, category });
  };

  const getBmiColor = (category) => {
    if (category === 'Normal') return '#4caf7d';
    if (category === 'Underweight') return '#4a9eff';
    if (category === 'Overweight') return '#ffa500';
    return '#ff4444';
  };

  const totalSessions = workouts.length;
  const totalClasses = bookings.filter((b) => b.status === 'ATTENDED').length;

  return (
    <Layout>
      <div style={styles.pageHeader}>
        <h2 style={styles.title}>Laporan & BMI</h2>
        <p style={styles.subtitle}>Pantau Progres Kesehatan Dan Latihan Kamu</p>
      </div>

      {loading ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '60px' }}>
          Loading...
        </div>
      ) : (
        <>
          {/* Row 1 — BMI Kalkulator + Hasil + Stats */}
          <div style={styles.row}>
            {/* BMI Kalkulator */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>⊞ BMI Kalkulator</div>
              <div style={styles.bmiInputRow}>
                <div style={styles.bmiInputGroup}>
                  <label style={styles.bmiLabel}>Tinggi Badan</label>
                  <input
                    style={styles.bmiInput}
                    type="number"
                    placeholder="170"
                    value={bmiForm.height}
                    onChange={(e) => setBmiForm({ ...bmiForm, height: e.target.value })}
                  />
                  <span style={styles.bmiUnit}>cm</span>
                </div>
                <div style={styles.bmiInputGroup}>
                  <label style={styles.bmiLabel}>Berat Badan</label>
                  <input
                    style={styles.bmiInput}
                    type="number"
                    placeholder="64"
                    value={bmiForm.weight}
                    onChange={(e) => setBmiForm({ ...bmiForm, weight: e.target.value })}
                  />
                  <span style={styles.bmiUnit}>kg</span>
                </div>
              </div>
              <button style={styles.btnHitung} onClick={calculateBmi}>
                Hitung BMI
              </button>
              {!profile && (
                <div style={styles.infoNote}>
                  ℹ️ Isi Data Profil untuk simpan hasil BMI
                </div>
              )}
            </div>

            {/* Hasil BMI */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>⊞ Hasil BMI</div>
              {bmiResult ? (
                <div style={styles.bmiResult}>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚖️</div>
                  <div style={{
                    fontSize: '22px', fontWeight: 'bold',
                    color: getBmiColor(bmiResult.category),
                  }}>
                    {bmiResult.category}
                  </div>
                  <div style={{ color: '#fff', fontSize: '20px', marginTop: '4px' }}>
                    BMI: {bmiResult.bmi}
                  </div>
                  <div style={{ color: '#aaa', fontSize: '12px', marginTop: '8px' }}>
                    {bmiResult.category === 'Normal'
                      ? 'Berat Badan Kamu Ideal. Pertahankan Pola Hidup Sehatmu!'
                      : bmiResult.category === 'Underweight'
                      ? 'Berat badan kamu kurang. Tingkatkan asupan nutrisi!'
                      : bmiResult.category === 'Overweight'
                      ? 'Berat badan berlebih. Tingkatkan aktivitas fisik!'
                      : 'Konsultasikan dengan dokter untuk program penurunan berat badan.'}
                  </div>
                </div>
              ) : (
                <div style={styles.bmiEmpty}>
                  Isi form dan klik Hitung BMI
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div style={styles.statsGrid}>
              {[
                { label: 'Total Latihan', value: `${totalSessions} sesi`, icon: '🏋️' },
                { label: 'Total Kelas', value: `${totalClasses} kelas`, icon: '📅' },
                { label: 'Membership', value: membership ? `${membership.daysRemaining} hari` : 'Tidak aktif', icon: '💳' },
                { label: 'Status', value: membership ? 'ACTIVE' : 'INACTIVE', icon: '✅' },
              ].map((s, i) => (
                <div key={i} style={styles.statCard}>
                  <div style={styles.statIcon}>{s.icon}</div>
                  <div>
                    <div style={styles.statValue}>{s.value}</div>
                    <div style={styles.statLabel}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 — Riwayat Pengukuran + Workout Log */}
          <div style={styles.row}>
            {/* Riwayat Pengukuran */}
            <div style={{ ...styles.card, flex: 2 }}>
              <div style={styles.cardTitle}>👤 Riwayat Pengukuran Tubuh</div>
              {profile ? (
                <div style={styles.measureGrid}>
                  <div style={styles.measureCard}>
                    <div style={styles.measureBadge}>Terbaru</div>
                    <div style={styles.measureDate}>
                      {new Date().toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </div>
                    <div style={styles.measureLabel}>Berat Badan</div>
                    <div style={styles.measureValue}>{profile.weight} kg</div>
                    <div style={{
                      color: getBmiColor(profile.bmiCategory),
                      fontSize: '12px', marginTop: '4px',
                    }}>
                      BMI {profile.bmiCategory}
                    </div>
                  </div>
                  <div style={styles.measureEmpty}>
                    <div style={{ color: '#555', fontSize: '13px', textAlign: 'center' }}>
                      Update profil secara berkala untuk melihat progres
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#aaa', fontSize: '13px', marginTop: '12px' }}>
                  Belum ada data profil. Lengkapi profil kamu dulu.
                </div>
              )}
            </div>

            {/* Tips */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>💡 Tips Untukmu</div>
              {[
                { icon: '💧', title: 'Jangan Lupa Minum', desc: 'Minum air yang cukup supaya kamu dapat latihan dengan optimal' },
                { icon: '⚖️', title: 'Jaga Berat Badan Idealmu', desc: 'Pertahankan pola makan dan tetap latihan rutin' },
                { icon: '😴', title: 'Istirahat yang Cukup', desc: 'Tidur 7-8 jam per malam untuk pemulihan otot optimal' },
              ].map((tip, i) => (
                <div key={i} style={styles.tipItem}>
                  <div style={styles.tipIcon}>{tip.icon}</div>
                  <div>
                    <div style={styles.tipTitle}>{tip.title}</div>
                    <div style={styles.tipDesc}>{tip.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 3 — Workout Log */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>⊞ Workout Log</div>
            {workouts.length === 0 ? (
              <div style={{ color: '#aaa', fontSize: '13px', marginTop: '12px' }}>
                Belum ada workout log. Tambahkan di menu Workout.
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Tanggal', 'Latihan', 'Beban', 'Sets', 'Reps', 'Durasi'].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workouts.slice(0, 5).map((w) => (
                    <tr key={w.id}>
                      <td style={styles.td}>
                        {new Date(w.workoutDate).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </td>
                      <td style={styles.td}>{w.exerciseName}</td>
                      <td style={styles.td}>{w.weightKg ? `${w.weightKg} kg` : '-'}</td>
                      <td style={styles.td}>{w.sets || '-'}</td>
                      <td style={styles.td}>{w.reps || '-'}</td>
                      <td style={styles.td}>
                        {w.durationMinutes ? `${w.durationMinutes} Menit` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}

const styles = {
  pageHeader: { marginBottom: '20px' },
  title: { color: '#fff', fontSize: '22px', margin: 0, fontFamily: 'sans-serif' },
  subtitle: { color: '#aaa', fontSize: '14px', margin: '4px 0 0' },
  row: { display: 'flex', gap: '16px', marginBottom: '16px' },
  card: {
    backgroundColor: '#1e1e1e', borderRadius: '16px',
    padding: '20px', flex: 1,
  },
  cardTitle: {
    color: '#fff', fontWeight: 'bold', fontSize: '15px',
    marginBottom: '16px', fontFamily: 'sans-serif',
  },
  bmiInputRow: { display: 'flex', gap: '12px', marginBottom: '14px' },
  bmiInputGroup: { flex: 1, position: 'relative' },
  bmiLabel: { color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '6px' },
  bmiInput: {
    width: '100%', padding: '10px 40px 10px 12px',
    backgroundColor: '#2a2a2a', border: 'none', borderRadius: '8px',
    color: '#fff', fontSize: '14px', outline: 'none',
  },
  bmiUnit: {
    position: 'absolute', right: '12px', top: '34px',
    color: '#aaa', fontSize: '12px',
  },
  btnHitung: {
    width: '100%', padding: '10px', borderRadius: '8px',
    border: 'none', backgroundColor: '#2a2a2a', color: '#fff',
    fontSize: '14px', cursor: 'pointer', fontWeight: 'bold',
  },
  infoNote: { color: '#aaa', fontSize: '12px', marginTop: '10px' },
  bmiResult: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', padding: '10px 0',
  },
  bmiEmpty: { color: '#555', fontSize: '13px', textAlign: 'center', marginTop: '30px' },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px', flex: 1,
  },
  statCard: {
    backgroundColor: '#1e1e1e', borderRadius: '12px',
    padding: '16px', display: 'flex', alignItems: 'center', gap: '12px',
  },
  statIcon: { fontSize: '28px' },
  statValue: { color: '#fff', fontWeight: 'bold', fontSize: '18px' },
  statLabel: { color: '#aaa', fontSize: '12px', marginTop: '2px' },
  measureGrid: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  measureCard: {
    backgroundColor: '#2a2a2a', borderRadius: '12px',
    padding: '16px', minWidth: '140px',
  },
  measureBadge: {
    backgroundColor: '#4caf7d', color: '#fff', fontSize: '10px',
    padding: '2px 8px', borderRadius: '99px', display: 'inline-block',
    marginBottom: '6px',
  },
  measureDate: { color: '#aaa', fontSize: '11px', marginBottom: '8px' },
  measureLabel: { color: '#aaa', fontSize: '12px' },
  measureValue: { color: '#fff', fontWeight: 'bold', fontSize: '20px', marginTop: '4px' },
  measureEmpty: {
    backgroundColor: '#2a2a2a', borderRadius: '12px',
    padding: '16px', flex: 1, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  tipItem: {
    display: 'flex', gap: '10px', alignItems: 'flex-start',
    padding: '10px', backgroundColor: '#2a2a2a',
    borderRadius: '10px', marginBottom: '8px',
  },
  tipIcon: {
    width: '32px', height: '32px', borderRadius: '50%',
    backgroundColor: '#333', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0,
  },
  tipTitle: { color: '#fff', fontSize: '13px', fontWeight: 'bold' },
  tipDesc: { color: '#aaa', fontSize: '12px', marginTop: '2px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    color: '#aaa', fontSize: '13px', textAlign: 'left',
    paddingBottom: '10px', borderBottom: '1px solid #2a2a2a',
  },
  td: {
    color: '#fff', fontSize: '13px',
    padding: '12px 0', borderBottom: '1px solid #2a2a2a',
  },
};