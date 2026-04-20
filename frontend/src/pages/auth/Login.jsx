import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosInstance';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', form);
      const { token, name, role } = res.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('name', name);
      localStorage.setItem('role', role);

      // Redirect berdasarkan role
      if (role === 'ADMIN' || role === 'OWNER') {
        navigate('/admin/dashboard');
      } else if (role === 'TRAINER') {
        navigate('/trainer/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>LOGIN</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="email"
            placeholder="username..."
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
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
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'LOGIN'}
          </button>
        </form>

        <p style={styles.link}>
          Belum punya akun?{' '}
          <Link to="/register" style={styles.linkGreen}>REGISTER</Link>
        </p>
      </div>
    </div>
  );
}

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
    outline: 'none',
    boxShadow: 'none',
    backgroundColor: '#ddd',
    fontSize: '14px',
    marginBottom: '12px',
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