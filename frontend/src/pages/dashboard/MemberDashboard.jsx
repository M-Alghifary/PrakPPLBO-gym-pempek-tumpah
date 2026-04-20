export default function MemberDashboard() {
  const name = localStorage.getItem('name');
  return (
    <div style={{ backgroundColor: '#111', minHeight: '100vh', color: '#fff', padding: '40px' }}>
      <h2>Selamat datang, {name}!</h2>
    </div>
  );
}