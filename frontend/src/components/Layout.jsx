import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.searchBar}>
            <span>🔍</span>
            <input
              style={styles.searchInput}
              placeholder="Search..."
              readOnly
            />
          </div>
          <div style={styles.avatar}>
            {localStorage.getItem('name')?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    backgroundColor: '#111',
    minHeight: '100vh',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 28px',
    backgroundColor: '#1a1a1a',
    borderBottom: '1px solid #2a2a2a',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#2a2a2a',
    borderRadius: '20px',
    padding: '8px 20px',
    flex: 1,
    maxWidth: '500px',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    color: '#aaa',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#4caf7d',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
  },
  content: {
    padding: '28px',
    overflowY: 'auto',
    flex: 1,
  },
};