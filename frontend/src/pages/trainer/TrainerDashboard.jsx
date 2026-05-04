import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getTrainerClasses, getClassParticipants } from '../../api/trainerApi';
import './TrainerDashboard.css';

export default function TrainerDashboard() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [participantLoading, setParticipantLoading] = useState(false);
  const [participantError, setParticipantError] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);

  const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  useEffect(() => {
    loadTrainerClasses();
  }, []);

  const loadTrainerClasses = async () => {
    try {
      setLoading(true);
      const data = await getTrainerClasses();
      setClasses(data || []);
    } catch (error) {
      console.error('Error loading trainer classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseLocalDate = (dateTimeString) => {
    if (!dateTimeString) return null;
    if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}T/.test(dateTimeString) && !dateTimeString.endsWith('Z')) {
      return new Date(dateTimeString.replace('T', ' '));
    }
    return new Date(dateTimeString);
  };

  // Parse day from date
  const getDayName = (dateString) => {
    if (!dateString) return '';
    const date = parseLocalDate(dateString);
    const dayIndex = date.getDay();
    return daysOfWeek[(dayIndex + 6) % 7]; // Adjust because JS uses 0=Sunday
  };

  // Filter classes by selected day
  const filteredClasses = selectedDay
    ? classes.filter((cls) => getDayName(cls.startTime) === selectedDay)
    : classes;

  // Format time from datetime string
  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = parseLocalDate(dateTimeString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString('id-ID');
  };

  // Get status label
  const getStatusLabel = (classData) => {
    const now = new Date();
    const startTime = parseLocalDate(classData.startTime);
    const endTime = parseLocalDate(classData.endTime);

    if (now < startTime) {
      return 'Upcoming';
    } else if (now > endTime) {
      return 'Completed';
    } else {
      return 'In Progress';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#888';
      case 'In Progress':
        return '#ff6b6b';
      case 'Upcoming':
        return '#48c774';
      default:
        return '#888';
    }
  };

  const handleViewParticipants = async (gymClass) => {
    setSelectedClass(gymClass);
    setParticipantError('');
    setParticipantLoading(true);
    setShowParticipants(true);

    try {
      const data = await getClassParticipants(gymClass.id);
      setParticipants(data || []);
    } catch (error) {
      console.error('Error loading participants:', error);
      setParticipantError('Gagal memuat peserta kelas. Coba lagi.');
      setParticipants([]);
    } finally {
      setParticipantLoading(false);
    }
  };

  const handleCloseParticipants = () => {
    setShowParticipants(false);
    setSelectedClass(null);
    setParticipants([]);
    setParticipantError('');
  };

  if (loading) {
    return (
      <Layout>
        <div className="trainer-dashboard">
          <div className="loading">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="trainer-dashboard">
        {/* Header */}
        <div className="trainer-header">
          <h1>Kelas & Jadwal Anda</h1>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <button
            className={`filter-btn ${selectedDay === null ? 'active' : ''}`}
            onClick={() => setSelectedDay(null)}
          >
            Semua
          </button>
          {daysOfWeek.map((day) => (
            <button
              key={day}
              className={`filter-btn ${selectedDay === day ? 'active' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Classes Grid */}
        <div className="classes-container">
          {filteredClasses.length > 0 ? (
            filteredClasses.map((gymClass) => {
              const status = getStatusLabel(gymClass);
              const statusColor = getStatusColor(status);
              return (
                <div key={gymClass.id} className="class-card">
                  {/* Time */}
                  <div className="class-time">
                    {formatTime(gymClass.startTime)} - {formatTime(gymClass.endTime)}
                  </div>

                  {/* Class Info */}
                  <div className="class-info">
                    <div className="class-header">
                      <div className="class-icon">{gymClass.name.charAt(0)}</div>
                      <div className="class-details">
                        <h3 className="class-name">{gymClass.name}</h3>
                        <p className="class-instructor">Instruktur: {gymClass.trainerName || 'Anda'}</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="class-status" style={{ color: statusColor }}>
                      {status}
                    </div>

                    {/* Slots */}
                    <div className="class-slots">
                      {gymClass.currentCapacity || 0} / {gymClass.maxCapacity || 0} Slot Terisi
                    </div>

                    {/* Date */}
                    <div className="class-date">{formatDate(gymClass.startTime)}</div>

                    {/* Actions */}
                    <div className="class-actions">
                      <button
                        className="view-btn"
                        onClick={() => handleViewParticipants(gymClass)}
                        title="Lihat peserta"
                      >
                        <span>👁️</span> Lihat Peserta
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-classes">
              <p>Tidak ada kelas untuk hari ini</p>
            </div>
          )}
        </div>
      </div>

      {showParticipants && (
        <div className="participants-modal-overlay" onClick={handleCloseParticipants}>
          <div className="participants-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Peserta Kelas</h3>
                <p>{selectedClass?.name}</p>
              </div>
              <button className="close-btn" onClick={handleCloseParticipants}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {participantLoading ? (
                <div className="loading">Memuat peserta...</div>
              ) : participantError ? (
                <div className="modal-error">{participantError}</div>
              ) : participants.length > 0 ? (
                <div className="participant-list">
                  {participants.map((participant) => (
                    <div key={participant.bookingId} className="participant-item">
                      <div>
                        <div className="participant-name">{participant.memberName}</div>
                        <div className="participant-email">{participant.memberEmail}</div>
                      </div>
                      <div className="participant-status">{participant.status}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-classes">
                  <p>Belum ada peserta untuk kelas ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
