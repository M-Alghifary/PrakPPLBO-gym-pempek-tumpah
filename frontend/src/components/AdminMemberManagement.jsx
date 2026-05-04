import { useState } from 'react';
import { updateMemberRole, deleteMember } from '../api/adminApi';
import './AdminMemberManagement.css';

export default function AdminMemberManagement({ members, onDataUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && member.membershipStatus === 'ACTIVE') ||
      (filterStatus === 'inactive' && member.membershipStatus === 'INACTIVE');

    return matchesSearch && matchesStatus;
  });

  const handleEditRole = (member) => {
    setEditingId(member.id);
    setSelectedRole(member.role);
  };

  const handleSaveRole = async (memberId) => {
    try {
      await updateMemberRole(memberId, selectedRole);
      setEditingId(null);
      onDataUpdate();
    } catch (error) {
      alert('Gagal mengupdate role: ' + error.message);
    }
  };

  const handleDelete = async (memberId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus member ini?')) {
      try {
        await deleteMember(memberId);
        onDataUpdate();
      } catch (error) {
        alert('Gagal menghapus member: ' + error.message);
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return '#ff6b6b';
      case 'OWNER':
        return '#ff9f43';
      case 'TRAINER':
        return '#45b7d1';
      default:
        return '#48c774';
    }
  };

  const getStatusBadge = (status) => {
    return status === 'ACTIVE' ? '✓ Aktif' : '✗ Inactive';
  };

  return (
    <div className="member-management">
      {/* Search and Filter */}
      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Cari member..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Members Table */}
      <div className="table-container">
        <table className="members-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Member</th>
              <th>Email</th>
              <th>Masa Aktif</th>
              <th>Status</th>
              <th>Role</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td className="id-cell">{member.id}</td>
                  <td className="name-cell">{member.name}</td>
                  <td className="email-cell">{member.email}</td>
                  <td className="date-cell">
                    {new Date(member.joinedAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="status-cell">
                    <span className={`status-badge ${member.membershipStatus.toLowerCase()}`}>
                      {getStatusBadge(member.membershipStatus)}
                    </span>
                  </td>
                  <td className="role-cell">
                    {editingId === member.id ? (
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="role-select"
                      >
                        <option value="MEMBER">MEMBER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="TRAINER">TRAINER</option>
                        <option value="OWNER">OWNER</option>
                      </select>
                    ) : (
                      <span
                        className="role-badge"
                        style={{ backgroundColor: getRoleColor(member.role) }}
                      >
                        {member.role}
                      </span>
                    )}
                  </td>
                  <td className="action-cell">
                    {editingId === member.id ? (
                      <>
                        <button
                          className="btn-action btn-save"
                          onClick={() => handleSaveRole(member.id)}
                        >
                          Simpan
                        </button>
                        <button
                          className="btn-action btn-cancel"
                          onClick={() => setEditingId(null)}
                        >
                          Batal
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleEditRole(member)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(member.id)}
                        >
                          Hapus
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  Tidak ada data member
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="summary">
        <p>Total: {filteredMembers.length} member</p>
      </div>
    </div>
  );
}
