import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axiosInstance';

export default function MemberDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem('name');

  const [membership, setMembership] = useState(null);
  const [packages, setPackages] = useState([]);
  const [classes, setClasses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [memberRes, classRes, bookingRes, packageRes] = await Promise.all([
          api.get('/memberships/active').catch(() => ({ data: { data: null } })),
          api.get('/schedule/classes').catch(() => ({ data: { data: [] } })),
          api.get('/schedule/my-bookings').catch(() => ({ data: { data: [] } })),
          api.get('/memberships/packages').catch(() => ({ data: { data: [] } })),
        ]);

        setMembership(memberRes.data.data);
        setClasses(classRes.data.data?.slice(0, 3) || []);
        setBookings(bookingRes.data.data?.slice(0, 2) || []);
        setPackages(packageRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const subscribePackage = async (packageId) => {
    try {
      setSubscribing(true);
      const res = await api.post(`/memberships/subscribe/${packageId}`);
      setMembership(res.data.data);
      setMessage({ text: 'Membership berhasil diaktifkan!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      console.error(err);
      setMessage({
        text: err.response?.data?.message || 'Gagal membeli paket membership',
        type: 'error',
      });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px' }}>
          Loading...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Greeting + Quick Actions */}
      <div style={styles.topRow}>
        <div>
          <h2 style={styles.greeting}>Selamat Datang Kembali, {name}!</h2>
        </div>
        <div style={styles.quickActions}>
          <button style={styles.actionBtn} onClick={() => navigate('/workout')}>
            📋 Workout Log
          </button>
          <button style={styles.actionBtn} onClick={() => navigate('/schedule')}>
            📅 Lihat Jadwal Hari ini
          </button>
          <button style={styles.actionBtn} onClick={() => navigate('/membership')}>
            💲 Perpanjang Membership
          </button>
        </div>
      </div>

      {/* Row 1 — Membership Card + BMI + Aktivitas */}
      <div style={styles.row}>
        {/* Membership Card */}
        <div style={styles.memberCard}>
          <div style={styles.memberCardTop}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
              ⚙️ Lenjer Fit
            </span>
            <span style={{ color: '#ccc', fontSize: '13px' }}>GYM MEMBER</span>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
              {name}
            </div>
            {membership ? (
              <>
                <div style={styles.activeStatus}>✅ ACTIVE</div>
                <div style={{ color: '#ccc', fontSize: '13px', marginTop: '4px' }}>
                  Valid: {new Date(membership.endDate).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </div>
                <div style={{ color: '#4caf7d', fontSize: '13px', marginTop: '4px' }}>
                  {membership.daysRemaining} hari tersisa
                </div>
              </>
            ) : (
              <div style={{ color: '#ff6b6b', marginTop: '8px', fontSize: '14px' }}>
                ❌ Tidak ada membership aktif
                <br />
                <button
                  onClick={() => navigate('/membership')}
                  style={styles.subscribBtn}
                >
                  Beli Sekarang
                </button>
              </div>
            )}
          </div>
        </div>

        {/* BMI Widget */}
        <div style={styles.widget}>
          <div style={styles.widgetTitle}>Laporan BMI</div>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px' }}>⚖️</div>
            <div style={{ color: '#4caf7d', fontWeight: 'bold', fontSize: '16px', marginTop: '8px' }}>
              NORMAL
            </div>
            <div style={{ color: '#aaa', fontSize: '12px' }}>18.5 - 24.9</div>
          </div>
        </div>

        {/* Aktivitas Terbaru */}
        <div style={styles.widget}>
          <div style={styles.widgetTitle}>Aktivitas Terbaru</div>
          {bookings.length > 0 ? (
            bookings.map((b, i) => (
              <div key={i} style={styles.activityItem}>
                <span style={{ fontSize: '20px' }}>🏋️</span>
                <div>
                  <div style={{ color: '#fff', fontSize: '13px' }}>{b.className}</div>
                  <div style={{ color: '#aaa', fontSize: '11px' }}>{b.status}</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: '#aaa', fontSize: '13px', marginTop: '12px' }}>
              Belum ada aktivitas
            </div>
          )}
        </div>
      </div>

      {message.text && (
        <div style={{
          ...styles.notification,
          backgroundColor: message.type === 'success' ? '#1a3a2a' : '#3a1a1a',
          borderColor: message.type === 'success' ? '#4caf7d' : '#ff6b6b',
          color: message.type === 'success' ? '#4caf7d' : '#ff6b6b',
          marginBottom: '18px',
        }}>
          {message.text}
        </div>
      )}

      <div style={styles.packageSection}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Pilihan Paket Membership</h3>
          <span style={styles.sectionSubtitle}>Pilih paket sesuai kebutuhanmu dan lihat riwayat setelah pembelian.</span>
        </div>
        <div style={styles.packageRow}>
          {packages.length > 0 ? (
            packages.map((pkg) => (
              <div key={pkg.id} style={styles.packageCard}>
                <div style={styles.packageName}>{pkg.name}</div>
                <div style={styles.packageDuration}>{pkg.durationDays} hari</div>
                <div style={styles.packageDescription}>{pkg.description}</div>
                <div style={styles.packagePrice}>Rp {Number(pkg.price).toLocaleString('id-ID')}</div>
                <button
                  style={styles.packageBtn}
                  onClick={() => subscribePackage(pkg.id)}
                  disabled={subscribing}
                >
                  {subscribing ? 'Memproses...' : 'Beli Sekarang'}
                </button>
              </div>
            ))
          ) : (
            <div style={{ color: '#aaa' }}>Paket membership tidak tersedia saat ini.</div>
          )}
        </div>
      </div>

      {/* Row 2 — Jadwal Kelas + Booking Saya */}
      <div style={styles.row}>
        {/* Jadwal Kelas */}
        <div style={{ ...styles.widget, flex: 2 }}>
          <div style={styles.widgetTitle}>Jadwal Kelas</div>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Jam', 'Nama Kelas', 'Instruktur', ''].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classes.length > 0 ? classes.map((c) => (
                <tr key={c.id}>
                  <td style={styles.td}>
                    {new Date(c.startTime).toLocaleTimeString('id-ID', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td style={styles.td}>{c.name}</td>
                  <td style={styles.td}>{c.trainerName}</td>
                  <td style={styles.td}>
                    <button
                      style={{
                        ...styles.bookBtn,
                        backgroundColor: c.status === 'FULL' ? '#555' : '#4caf7d',
                        cursor: c.status === 'FULL' ? 'not-allowed' : 'pointer',
                      }}
                      disabled={c.status === 'FULL'}
                      onClick={() => navigate('/schedule')}
                    >
                      {c.status === 'FULL' ? 'Full' : 'Book'}
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} style={{ ...styles.td, color: '#aaa', textAlign: 'center' }}>
                    Tidak ada kelas tersedia
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Booking Saya */}
        <div style={styles.widget}>
          <div style={styles.widgetTitle}>Booking Saya</div>
          {bookings.length > 0 ? (
            bookings.map((b, i) => (
              <div key={i} style={styles.bookingItem}>
                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>
                  {b.className}
                </div>
                <div style={{ color: '#aaa', fontSize: '12px', marginTop: '4px' }}>
                  {new Date(b.startTime).toLocaleDateString('id-ID', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </div>
                <div style={{ color: '#4caf7d', fontSize: '12px' }}>
                  {b.status}
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: '#aaa', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
              📅 Belum ada booking<br />
              <button
                onClick={() => navigate('/schedule')}
                style={{ ...styles.subscribBtn, marginTop: '8px' }}
              >
                Book Kelas Sekarang
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  greeting: {
    color: '#fff',
    fontSize: '22px',
    fontFamily: 'sans-serif',
    margin: 0,
  },
  quickActions: {
    display: 'flex',
    gap: '10px',
  },
  actionBtn: {
    backgroundColor: '#2a2a2a',
    border: '1px solid #333',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'sans-serif',
  },
  row: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
  },
  memberCard: {
    background: 'linear-gradient(135deg, #8a7340, #c9a84c)',
    borderRadius: '16px',
    padding: '20px',
    minWidth: '220px',
    flex: 1,
  },
  memberCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeStatus: {
    color: '#4caf7d',
    fontWeight: 'bold',
    fontSize: '18px',
    marginTop: '8px',
  },
  widget: {
    backgroundColor: '#1e1e1e',
    borderRadius: '16px',
    padding: '20px',
    flex: 1,
  },
  widgetTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '15px',
    marginBottom: '16px',
    fontFamily: 'sans-serif',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
    borderBottom: '1px solid #2a2a2a',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    color: '#aaa',
    fontSize: '13px',
    textAlign: 'left',
    paddingBottom: '10px',
    borderBottom: '1px solid #2a2a2a',
  },
  td: {
    color: '#fff',
    fontSize: '13px',
    padding: '12px 0',
    borderBottom: '1px solid #2a2a2a',
  },
  bookBtn: {
    border: 'none',
    color: '#fff',
    padding: '6px 16px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  bookingItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '10px',
  },
  subscribBtn: {
    backgroundColor: '#4caf7d',
    border: 'none',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    marginTop: '4px',
  },
  notification: {
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid',
    fontSize: '14px',
  },
  packageSection: {
    backgroundColor: '#1b1b1b',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
  },
  sectionHeader: {
    marginBottom: '16px',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: '18px',
    margin: 0,
  },
  sectionSubtitle: {
    color: '#aaa',
    fontSize: '13px',
  },
  packageRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  packageCard: {
    backgroundColor: '#262626',
    borderRadius: '16px',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  packageName: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  packageDuration: {
    color: '#4caf7d',
    fontSize: '13px',
  },
  packageDescription: {
    color: '#ccc',
    fontSize: '13px',
    minHeight: '58px',
  },
  packagePrice: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  packageBtn: {
    border: 'none',
    borderRadius: '12px',
    padding: '12px',
    backgroundColor: '#4caf7d',
    color: '#111',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: 'auto',
  },
};