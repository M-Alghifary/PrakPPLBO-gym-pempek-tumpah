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

const pieData = [
  { label: 'Membership Bulanan', amount: 16510000, color: '#27ae60' },
  { label: 'Booking Kelas', amount: 9906000, color: '#f7a800' },
  { label: 'Membership 3 Bulan', amount: 8604000, color: '#6c5ce7' },
];

const monthlyIncome = [
  { month: 'Juni', amount: 10200000 },
  { month: 'Juli', amount: 13500000 },
  { month: 'Agustus', amount: 8800000 },
  { month: 'September', amount: 1355000 },
];

const formatCurrency = (value) => value.toLocaleString('id-ID');

function buildConicGradient(data) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  let offset = 0;
  return data
    .map((item) => {
      const start = offset;
      const slice = (item.amount / total) * 100;
      offset += slice;
      return `${item.color} ${start}% ${offset}%`;
    })
    .join(', ');
}

function PieChart({ data }) {
  const gradient = buildConicGradient(data);
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="pie-chart" style={{ background: `conic-gradient(${gradient})` }}>
      <div className="pie-chart-inner">
        <div className="pie-chart-value">Rp.</div>
        <div className="pie-chart-percent">{formatCurrency(total)}</div>
      </div>
    </div>
  );
}

function BarChart({ data }) {
  const maxAmount = Math.max(...data.map((item) => item.amount));

  return (
    <div className="bar-chart">
      <div className="bar-axis" />
      <div className="bar-series">
        {data.map((item) => {
          const fillHeight = Math.max(25, Math.round((item.amount / maxAmount) * 100));

          return (
            <div className="bar-item" key={item.month}>
              <span className="bar-value">Rp {formatCurrency(item.amount)}</span>
              <div
                className="bar-fill"
                style={{
                  height: `${fillHeight}%`,
                }}
                title={`Rp ${formatCurrency(item.amount)}`}
              />
              <span className="bar-label">{item.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
              <PieChart data={pieData} />
              <ul className="chart-legend">
                {pieData.map((item) => (
                  <li key={item.label}>
                    <span className="dot" style={{ background: item.color }} /> {item.label}
                    <span className="amount">Rp. {formatCurrency(item.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="chart-card">
              <div className="chart-title">Grafik Pemasukan Bulanan</div>
              <BarChart data={monthlyIncome} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
