import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axiosInstance';

const TABS = ['UPCOMING', 'COMPLETED', 'CANCELLED'];

export default function Booking() {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('UPCOMING');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/schedule/my-bookings');
      setBookings(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (classId) => {
    try {
      await api.put(`/schedule/classes/${classId}/cancel`);
      setMessage({ text: 'Booking berhasil dibatalkan', type: 'success' });
      fetchBookings();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Gagal membatalkan',
        type: 'error',
      });
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const filtered = bookings.filter((b) => {
    if (activeTab === 'UPCOMING') return b.status === 'BOOKED';
    if (activeTab === 'COMPLETED') return b.status === 'ATTENDED';
    if (activeTab === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  return (
    <Layout>
      <div style={styles.pageHeader}>
        <h2 style={styles.title}>Booking Saya</h2>
        <p style={styles.subtitle}>Kelola Reservasi Kelas Kamu</p>
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

      {/* Tabs */}
      <div style={styles.tabRow}>
        {TABS.map((tab) => (
          <button
            key={tab}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ color: '#aaa', textAlign: 'center', marginTop: '60px' }}>
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📅</div>
          <div style={{ color: '#aaa', fontSize: '14px' }}>
            Belum Ada Book lainnya<br />Book kelas Mu Sekarang!
          </div>
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((b) => (
            <div key={b.bookingId} style={styles.card}>
              {/* Icon + Info */}
              <div style={styles.cardTop}>
                <div style={styles.classIcon}>🧘</div>
                <div style={styles.classInfo}>
                  <div style={styles.className}>{b.className}</div>
                  <div style={styles.classTime}>
                    {new Date(b.startTime).toLocaleTimeString('id-ID', {
                      hour: '2-digit', minute: '2-digit',
                    })}
                    {' - '}
                    {new Date(b.endTime).toLocaleTimeString('id-ID', {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                  <div style={styles.classTrainer}>
                    Instruktur : {b.trainerName}
                  </div>
                  <div style={styles.classDate}>
                    Tanggal :{' '}
                    {new Date(b.startTime).toLocaleDateString('id-ID', {
                      weekday: 'long', day: 'numeric',
                      month: 'long', year: 'numeric',
                    })}
                  </div>
                  <div style={{
                    ...styles.statusBadge,
                    color: b.status === 'BOOKED' ? '#4caf7d'
                      : b.status === 'ATTENDED' ? '#4a9eff'
                      : '#ff6b6b',
                  }}>
                    Status :{' '}
                    {b.status === 'BOOKED' ? 'Terkonfirmasi'
                      : b.status === 'ATTENDED' ? 'Selesai'
                      : 'Dibatalkan'}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {b.status === 'BOOKED' && (
                <div style={styles.actions}>
                  <button style={styles.btnCancel}
                    onClick={() => handleCancel(b.classId)}>
                    ✖ Batalkan
                  </button>
                </div>
              )}

              {b.status === 'ATTENDED' && (
                <div style={styles.attendedBadge}>
                  ✅ Presensi Tercatat
                </div>
              )}
            </div>
          ))}

          {/* Empty slots untuk grid rapi */}
          {filtered.length % 3 !== 0 &&
            Array(3 - (filtered.length % 3)).fill(0).map((_, i) => (
              <div key={`empty-${i}`} style={styles.emptyCard}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
                <div style={{ color: '#555', fontSize: '13px', textAlign: 'center' }}>
                  Belum Ada Book lainnya<br />Book kelas Mu Sekarang!
                </div>
              </div>
            ))
          }
        </div>
      )}
    </Layout>
  );
}

const styles = {
  pageHeader: { marginBottom: '20px' },
  title: { color: '#fff', fontSize: '22px', margin: 0, fontFamily: 'sans-serif' },
  subtitle: { color: '#aaa', fontSize: '14px', margin: '4px 0 0' },
  notification: {
    padding: '12px 16px', borderRadius: '10px', border: '1px solid',
    marginBottom: '16px', fontSize: '14px',
  },
  tabRow: {
    display: 'flex', gap: '8px', marginBottom: '24px',
  },
  tab: {
    padding: '10px 28px', borderRadius: '10px', border: 'none',
    backgroundColor: '#2a2a2a', color: '#aaa', fontSize: '13px',
    fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px',
  },
  tabActive: {
    backgroundColor: '#3a3a3a', color: '#fff',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px',
  },
  card: {
    backgroundColor: '#1e1e1e', borderRadius: '16px', padding: '20px',
    display: 'flex', flexDirection: 'column', gap: '14px',
  },
  emptyCard: {
    backgroundColor: '#1e1e1e', borderRadius: '16px', padding: '20px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '180px',
  },
  empty: {
    textAlign: 'center', marginTop: '80px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  cardTop: { display: 'flex', gap: '12px' },
  classIcon: {
    width: '44px', height: '44px', borderRadius: '50%',
    backgroundColor: '#4caf7d', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '20px', flexShrink: 0,
  },
  classInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' },
  className: { color: '#fff', fontWeight: 'bold', fontSize: '14px' },
  classTime: { color: '#aaa', fontSize: '12px' },
  classTrainer: { color: '#aaa', fontSize: '12px' },
  classDate: { color: '#aaa', fontSize: '12px' },
  statusBadge: { fontSize: '12px', marginTop: '2px' },
  actions: { display: 'flex', gap: '8px' },
  btnCancel: {
    flex: 1, padding: '8px', borderRadius: '8px',
    border: '1px solid #555', backgroundColor: 'transparent',
    color: '#aaa', fontSize: '12px', cursor: 'pointer',
  },
  attendedBadge: {
    textAlign: 'center', color: '#4caf7d',
    fontSize: '13px', padding: '8px',
    backgroundColor: '#1a3a2a', borderRadius: '8px',
  },
};