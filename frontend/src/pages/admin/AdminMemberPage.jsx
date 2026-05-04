import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import AdminMemberManagement from '../../components/AdminMemberManagement';
import { getAllMembers } from '../../api/adminApi';

export default function AdminMemberPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await getAllMembers();
      setMembers(data || []);
    } catch (e) {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  return (
    <Layout>
      <AdminMemberManagement members={members} onDataUpdate={loadMembers} />
    </Layout>
  );
}
