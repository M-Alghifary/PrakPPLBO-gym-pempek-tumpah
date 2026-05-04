import { useState, useEffect } from 'react';
import { getAdminAllClasses, getAllTrainers, createClass, updateClass, deleteClass } from '../api/adminApi';
import './AdminClassManagement.css';

export default function AdminClassManagement() {
  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    trainerId: '',
    startTime: '',
    endTime: '',
    maxCapacity: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classesData, trainersData] = await Promise.all([
        getAdminAllClasses(),
        getAllTrainers()
      ]);
      setClasses(classesData || []);
      setTrainers(trainersData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Gagal memuat data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!form.name || !form.startTime || !form.endTime || !form.maxCapacity) {
      setMessage({ type: 'error', text: 'Mohon isi semua field yang diperlukan' });
      return;
    }

    try {
      setLoading(true);
      const classData = {
        name: form.name,
        description: form.description,
        trainerId: form.trainerId ? parseInt(form.trainerId) : null,
        startTime: form.startTime,
        endTime: form.endTime,
        maxCapacity: parseInt(form.maxCapacity)
      };

      if (editingClass) {
        await updateClass(editingClass.id, classData);
        setMessage({ type: 'success', text: 'Kelas berhasil diperbarui!' });
      } else {
        await createClass(classData);
        setMessage({ type: 'success', text: 'Kelas berhasil dibuat!' });
      }

      setForm({
        name: '',
        description: '',
        trainerId: '',
        startTime: '',
        endTime: '',
        maxCapacity: ''
      });
      setEditingClass(null);
      setShowForm(false);
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal menyimpan kelas' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (gymClass) => {
    setEditingClass(gymClass);
    setForm({
      name: gymClass.name,
      description: gymClass.description || '',
      trainerId: gymClass.trainerId || '',
      startTime: gymClass.startTime ? gymClass.startTime.slice(0, 16) : '',
      endTime: gymClass.endTime ? gymClass.endTime.slice(0, 16) : '',
      maxCapacity: gymClass.maxCapacity || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (classId) => {
    const confirmed = window.confirm('Hapus kelas ini? Aksi tidak bisa dibatalkan.');
    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteClass(classId);
      setMessage({ type: 'success', text: 'Kelas berhasil dihapus!' });
      if (editingClass?.id === classId) {
        setEditingClass(null);
        setForm({
          name: '',
          description: '',
          trainerId: '',
          startTime: '',
          endTime: '',
          maxCapacity: ''
        });
        setShowForm(false);
      }
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal menghapus kelas' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingClass(null);
    setForm({
      name: '',
      description: '',
      trainerId: '',
      startTime: '',
      endTime: '',
      maxCapacity: ''
    });
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return '#48c774';
    if (now > end) return '#888';
    return '#ff6b6b';
  };

  const getStatusLabel = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return 'Upcoming';
    if (now > end) return 'Completed';
    return 'In Progress';
  };

  return (
    <div className="class-management">
      <div className="class-management-header">
        <h2>Manajemen Kelas & Jadwal</h2>
        <button
          className="add-class-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Batalkan' : '+ Tambah Kelas Baru'}
        </button>
      </div>

      {message.text && (
        <div style={{
          backgroundColor: message.type === 'success' ? '#48c77433' : '#ff6b6b33',
          color: message.type === 'success' ? '#48c774' : '#ff6b6b',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: `1px solid ${message.type === 'success' ? '#48c774' : '#ff6b6b'}`
        }}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div style={{ backgroundColor: '#2a2a2a', border: '1px solid #333', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
          <h3 style={{ color: '#fff', marginTop: 0 }}>
            {editingClass ? 'Edit Kelas' : 'Buat Kelas Baru'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ color: '#aaa', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Nama Kelas *</label>
                <input
                  type="text"
                  placeholder="Contoh: Morning Yoga"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #444', borderRadius: '6px', color: '#fff', padding: '10px 12px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ color: '#aaa', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Pilih Trainer *</label>
                <select
                  value={form.trainerId}
                  onChange={(e) => setForm({ ...form, trainerId: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #444', borderRadius: '6px', color: '#fff', padding: '10px 12px', fontSize: '14px', boxSizing: 'border-box' }}
                >
                  <option value="">-- Pilih Trainer --</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ color: '#aaa', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Waktu Mulai *</label>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #444', borderRadius: '6px', color: '#fff', padding: '10px 12px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ color: '#aaa', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Waktu Selesai *</label>
                <input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #444', borderRadius: '6px', color: '#fff', padding: '10px 12px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ color: '#aaa', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Kapasitas Maksimal *</label>
                <input
                  type="number"
                  placeholder="Contoh: 20"
                  min="1"
                  value={form.maxCapacity}
                  onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #444', borderRadius: '6px', color: '#fff', padding: '10px 12px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ color: '#aaa', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Deskripsi</label>
                <input
                  type="text"
                  placeholder="Deskripsi kelas (opsional)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #444', borderRadius: '6px', color: '#fff', padding: '10px 12px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button type="submit" disabled={loading} style={{ backgroundColor: '#48c774', color: '#1a1a1a', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>
                {loading ? 'Loading...' : editingClass ? 'Simpan Perubahan' : 'Buat Kelas'}
              </button>
              {editingClass && (
                <button type="button" onClick={handleCancelEdit} style={{ backgroundColor: '#444', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>
                  Batal Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="class-list">
        {classes.length > 0 ? (
          classes.map((cls) => (
            <div className="class-card" key={cls.id}>
              <div className="class-time" style={{ backgroundColor: 'rgba(72, 199, 116, 0.1)', color: '#48c774' }}>
                {new Date(cls.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })} - {new Date(cls.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>
              <div className="class-main">
                <div className="class-icon" style={{ background: 'linear-gradient(135deg, #48c774, #2ecc71)' }}>
                  {cls.name.charAt(0)}
                </div>
                <div className="class-info">
                  <div className="class-name">{cls.name}</div>
                  <div className="class-instructor">Instruktur: {cls.trainerName || 'TBA'}</div>
                  <div className="class-status" style={{ color: getStatusColor(cls.startTime, cls.endTime) }}>
                    Status: {getStatusLabel(cls.startTime, cls.endTime)}
                  </div>
                  <div className="class-slot">
                    <span>{cls.currentCapacity} / {cls.maxCapacity} Slot Terisi</span>
                    <div className="slot-bar-bg">
                      <div className="slot-bar-fill" style={{ width: `${(cls.currentCapacity / cls.maxCapacity) * 100}%`, backgroundColor: '#48c774' }} />
                    </div>
                  </div>
                </div>
              </div>              <div className="class-actions">
                <button className="edit-btn" onClick={() => handleEdit(cls)}>Edit</button>
                <button className="cancel-btn" onClick={() => handleDelete(cls.id)}>Hapus</button>
              </div>            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
            <p>Belum ada kelas. Buat kelas baru sekarang!</p>
          </div>
        )}
      </div>
    </div>
  );
}
