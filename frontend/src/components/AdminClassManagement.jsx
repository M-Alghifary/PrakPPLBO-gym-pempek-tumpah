import React from 'react';
import './AdminClassManagement.css';

const classes = [
  {
    id: 1,
    name: 'Morning Yoga',
    instructor: 'Alam',
    status: 'Upcoming',
    time: '09:00 - 10:00',
    filled: 10,
    total: 17,
    icon: '🧘',
    color: '#c7f464',
  },
  {
    id: 2,
    name: 'Pilates',
    instructor: 'Yantok',
    status: 'Live',
    time: '13:00 - 14:00',
    filled: 14,
    total: 15,
    icon: '🧘‍♀️',
    color: '#f7a8e7',
  },
  {
    id: 3,
    name: 'Zumba',
    instructor: 'Elon',
    status: 'Upcoming',
    time: '09:00 - 10:00',
    filled: 3,
    total: 15,
    icon: '💃',
    color: '#c77dff',
  },
  {
    id: 4,
    name: 'Hyrox Class',
    instructor: 'Franseda',
    status: 'Full',
    time: '08:00 - 09:00',
    filled: 20,
    total: 20,
    icon: '🏋️‍♂️',
    color: '#ff6b6b',
  },
];

export default function AdminClassManagement() {
  return (
    <div className="class-management">
      <div className="class-management-header">
        <h2>Manajemen Kelas & Jadwal</h2>
        <button className="add-class-btn">+ Tambah Kelas Baru</button>
      </div>
      <div className="day-filter">
        {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day, idx) => (
          <button key={day} className={`day-btn${day === 'Rabu' ? ' active' : ''}`}>{day}</button>
        ))}
      </div>
      <div className="class-list">
        {classes.map((cls) => (
          <div className="class-card" key={cls.id}>
            <div className="class-time">{cls.time}</div>
            <div className="class-main">
              <div className="class-icon" style={{ background: cls.color }}>{cls.icon}</div>
              <div className="class-info">
                <div className="class-name">{cls.name}</div>
                <div className="class-instructor">Instruktur: {cls.instructor}</div>
                <div className={`class-status status-${cls.status.toLowerCase()}`}>Status: {cls.status}</div>
                <div className="class-slot">
                  <span>{cls.filled} / {cls.total} Slot Terisi</span>
                  <div className="slot-bar-bg">
                    <div className="slot-bar-fill" style={{ width: `${(cls.filled / cls.total) * 100}%` }} />
                  </div>
                </div>
              </div>
              <div className="class-actions">
                <button className="edit-btn">Edit</button>
                <button className="cancel-btn" disabled>Batal</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
