import React from 'react';
import Layout from '../../components/Layout';
import './AdminFinancePage.css';

const summary = [
  { label: 'Total Pemasukan', value: 'Rp. 45.580.000', change: '+18%', color: '#2ecc71', icon: '⬆️' },
  { label: 'Total Pengeluaran', value: 'Rp. 12.560.000', change: '+5,2%', color: '#e74c3c', icon: '⬆️' },
  { label: 'Laba Bersih', value: 'Rp. 33.020.000', change: '+14,2%', color: '#3498db', icon: '⬆️' },
  { label: 'Total Transaksi', value: '124', change: '', color: '#e056fd', icon: '🧾' },
];

const transactions = [
  { date: '2 September', desc: 'Member Bulanan', category: 'Pemasukan', amount: 300000, status: 'Berhasil' },
  { date: '2 September', desc: 'Maintenance Alat', category: 'Pengeluaran', amount: 450000, status: 'Berhasil' },
  { date: '2 September', desc: 'Member 3 Bulan', category: 'Pemasukan', amount: 900000, status: 'Berhasil' },
  { date: '2 September', desc: 'Booking Kelas', category: 'Pemasukan', amount: 70000, status: 'Berhasil' },
  { date: '2 September', desc: 'Gaji Karyawan', category: 'Pengeluaran', amount: 1200000, status: 'Berhasil' },
  { date: '2 September', desc: 'Biaya Kebersihan Gym', category: 'Pengeluaran', amount: 300000, status: 'Berhasil' },
  { date: '2 September', desc: 'Booking Kelas', category: 'Pemasukan', amount: 85000, status: 'Berhasil' },
];

export default function AdminFinancePage() {
  return (
    <Layout>
      <div className="finance-container">
        <div className="finance-header">
          <div>
            <h1>Laporan Keuangan</h1>
            <div className="subtitle">Pantau Semua Pemasukan Pengeluaran dan Ringkasan Gym</div>
          </div>
          <div className="finance-actions">
            <button className="month-btn">Bulan ini ▼</button>
            <button className="download-btn">Unduh laporan</button>
          </div>
        </div>
        <div className="summary-row">
          {summary.map((s, i) => (
            <div className="summary-card" key={i} style={{ borderColor: s.color }}>
              <div className="summary-label">{s.label}</div>
              <div className="summary-value">{s.value}</div>
              {s.change && <div className="summary-change" style={{ color: s.color }}>{s.icon} Peningkatan {s.change}</div>}
              {!s.change && <div className="summary-change" style={{ color: s.color, opacity: 0.7 }}>Total Transaksi saat ini</div>}
            </div>
          ))}
        </div>
        <div className="finance-main">
          <div className="transaction-table">
            <div className="table-title">Riwayat Transaksi Terbaru</div>
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Deskripsi</th>
                  <th>Kategori</th>
                  <th>Jumlah</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => (
                  <tr key={i}>
                    <td>{t.date}</td>
                    <td>{t.desc}</td>
                    <td>
                      <span className={`cat-badge ${t.category === 'Pemasukan' ? 'income' : 'expense'}`}>{t.category}</span>
                    </td>
                    <td>{t.amount.toLocaleString('id-ID')}</td>
                    <td><span className="status-badge">{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="finance-charts">
            <div className="chart-card">
              <div className="chart-title">Ringkasan Berdasarkan Diagram</div>
              <img src="https://placehold.co/180x120/purple/white?text=Pie+Chart" alt="Pie Chart" className="chart-img" />
              <ul className="chart-legend">
                <li><span className="dot" style={{ background: '#27ae60' }} /> Membership Bulanan <span className="amount">Rp. 16.510.000</span></li>
                <li><span className="dot" style={{ background: '#f7a800' }} /> Booking Kelas <span className="amount">Rp. 9.906.000</span></li>
                <li><span className="dot" style={{ background: '#6c5ce7' }} /> Membership 3 Bulan <span className="amount">Rp. 8.604.000</span></li>
              </ul>
            </div>
            <div className="chart-card">
              <div className="chart-title">Grafik Pemasukan Bulanan</div>
              <img src="https://placehold.co/180x120/blue/white?text=Bar+Chart" alt="Bar Chart" className="chart-img" />
              <div className="chart-xaxis">
                <span>Juni</span><span>Juli</span><span>Agustus</span><span>September</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
