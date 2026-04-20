import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosInstance';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', form);
      const { token, name, role } = res.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('name', name);
      localStorage.setItem('role', role);

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>REGISTER</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <input
            style={styles.input}
            type="text"
            placeholder="username..."
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="password..."
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <input
            style={styles.input}
            type="email"
            placeholder="date of birth..."
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'REGISTER'}
          </button>
        </form>

        <p style={styles.link}>
          Sudah punya akun?{' '}
          <Link to="/login" style={styles.linkGreen}>LOGIN</Link>
        </p>
      </div>
    </div>
  );
}

// styles sama dengan Login — copy paste dari Login.jsx
const styles = {
  page: {
    backgroundColor: '#111',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    width: '400px',
  },
  title: {
    color: '#fff',
    fontFamily: 'sans-serif',
    letterSpacing: '4px',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '14px 20px',
    borderRadius: '30px',
    border: 'none',
    backgroundColor: '#ddd',
    fontSize: '14px',
    marginBottom: '12px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '14px',
    borderRadius: '30px',
    border: 'none',
    backgroundColor: '#4caf7d',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    letterSpacing: '2px',
  },
  error: {
    color: '#ff6b6b',
    fontSize: '13px',
    textAlign: 'center',
  },
  link: {
    color: '#aaa',
    fontSize: '13px',
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  linkGreen: {
    color: '#4caf7d',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};