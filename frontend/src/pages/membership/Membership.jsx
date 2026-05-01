import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axiosInstance';

export default function Membership() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [packagesRes, membershipRes] = await Promise.all([
          api.get('/memberships/packages').catch(() => ({ data: { data: [] } })),
          api.get('/memberships/active').catch(() => ({ data: { data: null } })),
        ]);
        setPackages(packagesRes.data.data || []);
        setMembership(membershipRes.data.data || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const subscribePackage = async (packageId) => {
    try {
      setSubscribing(true);
      const res = await api.post(`/memberships/subscribe/${packageId}`);
      setMembership(res.data.data);
      setMessage({ text: 'Membership berhasil diaktifkan!', type: 'success' });
      window.setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Gagal membeli paket membership',
        type: 'error',
      });
      window.setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <Layout>
      <div style={styles.pageHeader}>
        <h2 style={styles.title}>Membership</h2>
        <p style={styles.subtitle}>Pilih paket membership yang paling cocok untukmu.</p>
      </div>

      {message.text && (
        <div style={{
          ...styles.alert,
          backgroundColor: message.type === 'success' ? '#1a3a2a' : '#3a1a1a',
          borderColor: message.type === 'success' ? '#4caf7d' : '#ff6b6b',
          color: message.type === 'success' ? '#4caf7d' : '#ff6b6b',
        }}>
          {message.text}
        </div>
      )}

      {membership && (
        <div style={styles.activeBox}>
          <div style={styles.activeLabel}>Membership Aktif</div>
          <div>{membership.packageName}</div>
          <div>{membership.daysRemaining} hari tersisa</div>
          <div style={styles.activeDate}>
            Valid sampai {new Date(membership.endDate).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </div>
        </div>
      )}

      <div style={styles.grid}>
        {loading ? (
          <div style={{ color: '#aaa', textAlign: 'center', width: '100%' }}>
            Loading paket membership...
          </div>
        ) : packages.length === 0 ? (
          <div style={{ color: '#aaa', textAlign: 'center', width: '100%' }}>
            Tidak ada paket membership tersedia.
          </div>
        ) : (
          packages.map((pkg) => (
            <div key={pkg.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.packageName}>{pkg.name}</div>
                <div style={styles.packagePrice}>Rp {Number(pkg.price).toLocaleString('id-ID')}</div>
              </div>
              <div style={styles.packageDays}>{pkg.durationDays} hari</div>
              <div style={styles.packageDescription}>{pkg.description}</div>
              <button
                style={styles.buyBtn}
                onClick={() => subscribePackage(pkg.id)}
                disabled={subscribing}
              >
                {subscribing ? 'Memproses...' : 'Beli Sekarang'}
              </button>
            </div>
          ))
        )}
      </div>

      <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
        ← Kembali ke Home
      </button>
    </Layout>
  );
}

const styles = {
  pageHeader: { marginBottom: '20px' },
  title: { color: '#fff', fontSize: '24px', margin: 0, fontFamily: 'sans-serif' },
  subtitle: { color: '#aaa', fontSize: '14px', marginTop: '6px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '20px' },
  card: { backgroundColor: '#1e1e1e', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  packageName: { color: '#fff', fontSize: '16px', fontWeight: 'bold' },
  packagePrice: { color: '#4caf7d', fontSize: '15px', fontWeight: 'bold' },
  packageDays: { color: '#aaa', fontSize: '13px' },
  packageDescription: { color: '#ccc', fontSize: '13px', minHeight: '60px' },
  buyBtn: { border: 'none', borderRadius: '10px', padding: '12px', backgroundColor: '#4caf7d', color: '#111', fontWeight: 'bold', cursor: 'pointer', marginTop: 'auto' },
  backBtn: { marginTop: '24px', border: 'none', backgroundColor: '#2a2a2a', color: '#fff', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer' },
  alert: { padding: '14px 16px', borderRadius: '12px', border: '1px solid', marginBottom: '18px' },
  activeBox: { backgroundColor: '#2a2a2a', borderRadius: '16px', padding: '18px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  activeLabel: { color: '#4caf7d', fontWeight: 'bold', fontSize: '13px' },
  activeDate: { color: '#aaa', fontSize: '13px' },
};