import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import AdminMemberManagement from '../../components/AdminMemberManagement';
import { getAllMembers, getTodayCheckins, getAllClasses } from '../../api/adminApi';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    checkinToday: 0,
    classes: 0
  });
  const [members, setMembers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [membersData, checkinsData, classesData] = await Promise.all([
        getAllMembers(),
        getTodayCheckins(),
        getAllClasses()
      ]);

      setMembers(membersData || []);
      setStats({
        totalMembers: membersData?.length || 0,
        checkinToday: checkinsData?.length || 0,
        classes: classesData?.length || 0
      });

      // Ambil beberapa aktivitas terakhir dari members
      if (membersData && membersData.length > 0) {
        const recentActivities = membersData.slice(0, 5).map((member, idx) => ({
          id: idx,
          name: member.name,
          time: new Date(member.joinedAt).toLocaleTimeString('id-ID'),
          activity: 'Check-in'
        }));
        setActivities(recentActivities);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Layout><div className="loading">Loading...</div></Layout>;
  }

  return (
    <Layout>
      <div className="admin-dashboard">
        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            Manajemen Member
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-section">
            {/* Statistics Cards */}
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-label">Total Member</div>
                <div className="stat-number">{stats.totalMembers.toLocaleString('id-ID')}</div>
                <div className="stat-meta">Member aktif</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Check-in Hari ini</div>
                <div className="stat-number">{stats.checkinToday}</div>
                <div className="stat-meta">Orang hari ini</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Kelas</div>
                <div className="stat-number">{stats.classes}</div>
                <div className="stat-meta">Kelas tersedia</div>
              </div>
            </div>

            {/* Activity and Recent Members */}
            <div className="activity-container">
              <div className="activity-section">
                <h3 className="section-title">Aktivitas Member</h3>
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>Jam</th>
                      <th>Nama Member</th>
                      <th>Aktivitas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.length > 0 ? (
                      activities.map((activity) => (
                        <tr key={activity.id}>
                          <td>{activity.time}</td>
                          <td>{activity.name}</td>
                          <td>{activity.activity}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="no-data">Tidak ada aktivitas</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Members Management Tab */}
        {activeTab === 'members' && (
          <AdminMemberManagement members={members} onDataUpdate={loadDashboardData} />
        )}
      </div>
    </Layout>
  );
}
