import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axiosInstance';

export default function Schedule() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classRes, bookingRes] = await Promise.all([
        api.get('/schedule/classes'),
        api.get('/schedule/my-bookings').catch(() => ({ data: { data: [] } })),
      ]);
      setClasses(classRes.data.data || []);
      setBookings(bookingRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cek apakah kelas sudah di-booking member ini
  const isBooked = (classId) => {
    return bookings.some(
      (b) => b.classId === classId && b.status === 'BOOKED'
    );
  };

  const handleBook = async (classId) => {
    try {
      await api.post(`/schedule/classes/${classId}/book`);
      setMessage({ text: 'Booking berhasil!', type: 'success' });
      fetchData(); // refresh data
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Booking gagal',
        type: 'error',
      });
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleCancel = async (classId) => {
    try {
      await api.put(`/schedule/classes/${classId}/cancel`);
      setMessage({ text: 'Booking dibatalkan', type: 'success' });
      fetchData();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Gagal membatalkan',
        type: 'error',
      });
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  // Ambil booking upcoming untuk sidebar kanan
  const upcomingBookings = bookings.filter((b) => b.status === 'BOOKED');

  return (
    <Layout>
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.title}>JADWAL KELAS</h2>
          <p style={styles.subtitle}>Pilih Kelas Dan Booking</p>
        </div>
      </div>

      {/* Notifikasi */}
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
        {/* Kiri — Grid Kelas */}
        <div style={styles.leftSection}>
          {/* Search bar */}
          <div style={styles.searchRow}>
            <div style={styles.searchBox}>
              <span>🔍</span>
              <input style={styles.searchInput} placeholder="Cari Kelas" readOnly />
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ color: '#aaa', textAlign: 'center', marginTop: '40px' }}>
              Loading...
            </div>
          ) : classes.length === 0 ? (
            <div style={{ color: '#aaa', textAlign: 'center', marginTop: '40px' }}>
              Tidak ada kelas tersedia
            </div>
          ) : (
            <div style={styles.grid}>
              {classes.map((c) => {
                const booked = isBooked(c.id);
                const full = c.status === 'FULL';
                const cancelled = c.status === 'CANCELLED';

                return (
                  <div key={c.id} style={styles.classCard}>
                    {/* Icon + Info */}
                    <div style={styles.cardTop}>
                      <div style={{
                        ...styles.classIcon,
                        backgroundColor: cancelled ? '#ff4444' : '#4caf7d',
                      }}>
                        🏋️
                      </div>
                      <div style={styles.classInfo}>
                        <div style={styles.className}>{c.name}</div>
                        <div style={styles.classTime}>
                          {new Date(c.startTime).toLocaleTimeString('id-ID', {
                            hour: '2-digit', minute: '2-digit',
                          })}
                          {' - '}
                          {new Date(c.endTime).toLocaleTimeString('id-ID', {
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </div>
                        <div style={styles.classTrainer}>
                          Instruktur : {c.trainerName}
                        </div>
                      </div>
                    </div>

                    <div style={styles.divider} />

                    {/* Kuota & Status */}
                    <div style={styles.cardMeta}>
                      <span style={styles.metaText}>
                        Kuota : {c.currentCapacity} / {c.maxCapacity}
                      </span>
                      <span style={{
                        ...styles.metaText,
                        color: cancelled ? '#ff4444' : full ? '#ff6b6b' : booked ? '#4caf7d' : '#4caf7d',
                      }}>
                        Status : {cancelled ? 'Dibatalkan' : full ? 'Penuh' : booked ? 'Dipilih' : 'Tersedia'}
                      </span>
                    </div>

                    {/* Tombol */}
                    {cancelled ? (
                      <button style={styles.btnCancelled} disabled>
                        Dibatalkan
                      </button>
                    ) : full && !booked ? (
                      <button style={styles.btnFull} disabled>
                        Full
                      </button>
                    ) : booked ? (
                      <button
                        style={styles.btnBooked}
                        onClick={() => handleCancel(c.id)}
                      >
                        Booked — Batalkan?
                      </button>
                    ) : (
                      <button
                        style={styles.btnBook}
                        onClick={() => handleBook(c.id)}
                      >
                        Book
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Kanan — Booking Hari Ini + Informasi */}
        <div style={styles.rightSection}>
          <div style={styles.sideCard}>
            <div style={styles.sideTitle}>Book Saya (Hari ini)</div>
            {upcomingBookings.length > 0 ? (
              upcomingBookings.slice(0, 2).map((b, i) => (
                <div key={i} style={styles.sideBookingItem}>
                  <div style={styles.sideBookingIcon}>🧘</div>
                  <div>
                    <div style={styles.sideBookingName}>{b.className}</div>
                    <div style={styles.sideBookingTime}>
                      {new Date(b.startTime).toLocaleTimeString('id-ID', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                    <div style={styles.sideBookingStatus}>Terkonfirmasi</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.emptyBooking}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
                <div style={{ color: '#aaa', fontSize: '13px', textAlign: 'center' }}>
                  Belum Ada Book<br />Book kelas Mu Sekarang!
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div style={styles.sideCard}>
            <div style={styles.sideTitle}>Informasi</div>
            {[
              { icon: '👤', text: 'Booking lebih Awal — Disarankan Booking Minimal 2 Jam Sebelum latihan' },
              { icon: '⏰', text: 'Datang Tepat Waktu — Diharap Datang 15 Menit Sebelum Latihan' },
              { icon: '✖️', text: 'Batalkan Kelas — Batalkan Booking Minimal 1 Jam Sebelum latihan' },
            ].map((info, i) => (
              <div key={i} style={styles.infoItem}>
                <div style={styles.infoIcon}>{info.icon}</div>
                <div style={styles.infoText}>{info.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  pageHeader: { marginBottom: '20px' },
  title: { color: '#fff', fontSize: '24px', margin: 0, fontFamily: 'sans-serif' },
  subtitle: { color: '#aaa', fontSize: '14px', margin: '4px 0 0', fontFamily: 'sans-serif' },
  notification: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid',
    marginBottom: '16px',
    fontSize: '14px',
    fontFamily: 'sans-serif',
  },
  mainLayout: { display: 'flex', gap: '20px' },
  leftSection: { flex: 1 },
  rightSection: { width: '280px', display: 'flex', flexDirection: 'column', gap: '16px' },
  searchRow: { marginBottom: '16px' },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#2a2a2a', borderRadius: '10px', padding: '10px 16px',
  },
  searchInput: {
    background: 'none', border: 'none', outline: 'none',
    color: '#aaa', fontSize: '14px', width: '100%',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  classCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  cardTop: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  classIcon: {
    width: '40px', height: '40px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', flexShrink: 0,
  },
  classInfo: { flex: 1 },
  className: { color: '#fff', fontWeight: 'bold', fontSize: '14px', fontFamily: 'sans-serif' },
  classTime: { color: '#aaa', fontSize: '12px', marginTop: '2px' },
  classTrainer: { color: '#aaa', fontSize: '12px' },
  divider: { height: '1px', backgroundColor: '#2a2a2a' },
  cardMeta: { display: 'flex', flexDirection: 'column', gap: '4px' },
  metaText: { color: '#aaa', fontSize: '12px' },
  btnBook: {
    width: '100%', padding: '10px', borderRadius: '8px',
    border: 'none', backgroundColor: '#4caf7d', color: '#fff',
    fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  btnBooked: {
    width: '100%', padding: '10px', borderRadius: '8px',
    border: 'none', backgroundColor: '#2a5a3a', color: '#4caf7d',
    fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  btnFull: {
    width: '100%', padding: '10px', borderRadius: '8px',
    border: 'none', backgroundColor: '#333', color: '#aaa',
    fontSize: '13px', cursor: 'not-allowed',
  },
  btnCancelled: {
    width: '100%', padding: '10px', borderRadius: '8px',
    border: 'none', backgroundColor: '#2a1a1a', color: '#ff4444',
    fontSize: '13px', cursor: 'not-allowed',
  },
  sideCard: {
    backgroundColor: '#1e1e1e', borderRadius: '16px', padding: '16px',
  },
  sideTitle: {
    color: '#fff', fontWeight: 'bold', fontSize: '14px',
    marginBottom: '14px', fontFamily: 'sans-serif',
  },
  sideBookingItem: {
    display: 'flex', gap: '12px', alignItems: 'center',
    padding: '10px', backgroundColor: '#2a2a2a', borderRadius: '10px',
    marginBottom: '8px',
  },
  sideBookingIcon: { fontSize: '24px' },
  sideBookingName: { color: '#fff', fontWeight: 'bold', fontSize: '13px' },
  sideBookingTime: { color: '#aaa', fontSize: '12px' },
  sideBookingStatus: { color: '#4caf7d', fontSize: '12px' },
  emptyBooking: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '20px 0',
  },
  infoItem: {
    display: 'flex', gap: '10px', alignItems: 'flex-start',
    padding: '10px', backgroundColor: '#2a2a2a', borderRadius: '10px',
    marginBottom: '8px',
  },
  infoIcon: {
    width: '32px', height: '32px', borderRadius: '50%',
    backgroundColor: '#333', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '14px', flexShrink: 0,
  },
  infoText: { color: '#aaa', fontSize: '12px', lineHeight: '1.5' },
};