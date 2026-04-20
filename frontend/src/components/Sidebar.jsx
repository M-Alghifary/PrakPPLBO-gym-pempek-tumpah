import { Link, useLocation, useNavigate } from 'react-router-dom';

const menus = [
  { label: 'Home', path: '/dashboard', icon: '⌂' },
  { label: 'Jadwal Kelas', path: '/schedule', icon: '📅' },
  { label: 'Booking Saya', path: '/booking', icon: '🗓' },
  { label: 'Laporan & BMI', path: '/report', icon: '📊' },
  { label: 'Riwayat Transaksi', path: '/transactions', icon: '🕐' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <span style={styles.logoIcon}>⚙️</span>
        <span style={styles.logoText}>Lenjer Fit</span>
      </div>

      {/* Menu */}
      <nav style={styles.nav}>
        {menus.map((menu) => {
          const isActive = location.pathname === menu.path;
          return (
            <Link
              key={menu.path}
              to={menu.path}
              style={{
                ...styles.menuItem,
                ...(isActive ? styles.menuActive : {}),
              }}
            >
              <span style={styles.menuIcon}>{menu.icon}</span>
              <span>{menu.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button onClick={handleLogout} style={styles.logout}>
        🚪 Logout
      </button>
    </div>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    minHeight: '100vh',
    backgroundColor: '#1a1a1a',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    flexShrink: 0,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '40px',
    paddingLeft: '8px',
  },
  logoIcon: { fontSize: '22px' },
  logoText: {
    color: '#fff',
    fontSize: '20px',
    fontWeight: 'bold',
    fontFamily: 'sans-serif',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    color: '#aaa',
    textDecoration: 'none',
    fontSize: '15px',
    fontFamily: 'sans-serif',
    transition: 'all 0.2s',
  },
  menuActive: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
  },
  menuIcon: { fontSize: '18px' },
  logout: {
    background: 'none',
    border: 'none',
    color: '#aaa',
    fontSize: '15px',
    cursor: 'pointer',
    textAlign: 'left',
    padding: '12px 16px',
    borderRadius: '10px',
    fontFamily: 'sans-serif',
  },
};