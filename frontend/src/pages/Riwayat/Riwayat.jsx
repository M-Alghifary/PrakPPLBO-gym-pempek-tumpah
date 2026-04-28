import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../api/axiosInstance";

export default function Riwayat() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentRes, membershipRes] = await Promise.all([
        api.get('/payments/history').catch(() => ({ data: { data: [] } })),
        api.get('/memberships/history').catch(() => ({ data: { data: [] } })),
      ]);

      const payments = paymentRes.data.data || [];
      const memberships = (membershipRes.data.data || []).map((item) => ({
        date: item.createdAt || item.startDate,
        description: item.packageName,
        method: 'Membership',
        status: item.status || 'SUCCESS',
        category: 'Membership',
        amount: Number(item.packagePrice) || 0,
      }));

      setTransactions([...payments, ...memberships]);
    } catch (err) {
      console.log(err);

      // fallback dummy
      setTransactions(dummyData);
    }
  };

  const filteredData =
    filter === "ALL"
      ? transactions
      : transactions.filter((t) => t.status?.toUpperCase() === filter);

  const summary = {
    total: transactions.length,
    success: transactions.filter((t) => t.status?.toUpperCase() === "SUCCESS").length,
    pending: transactions.filter((t) => t.status?.toUpperCase() === "PENDING").length,
    failed: transactions.filter((t) => t.status?.toUpperCase() === "FAILED").length,
    totalAmount: transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMethodLabel = (item) => item.paymentMethod || item.paymentDetail || "-";

  return (
    <Layout>
      <h2 style={styles.title}>Riwayat Transaksi</h2>
      <p style={styles.subtitle}>
        Lihat Semua Riwayat Pembayaran Kamu
      </p>

      {/* SUMMARY */}
      <div style={styles.summaryGrid}>
        <Card title="Total Transaksi" value={summary.total} />
        <Card title="Total Pembayaran" value={`Rp ${summary.totalAmount.toLocaleString()}`} />
        <Card title="Berhasil" value={summary.success} />
        <Card title="Tertunda" value={summary.pending} />
        <Card title="Gagal" value={summary.failed} />
      </div>

      {/* FILTER */}
      <div style={styles.filterRow}>
        {["ALL", "SUCCESS", "PENDING", "FAILED"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...styles.filterBtn,
              backgroundColor: filter === f ? "#4caf7d" : "#2a2a2a",
              color: filter === f ? "#000" : "#aaa",
            }}
          >
            {f === "ALL"
              ? "Semua"
              : f === "SUCCESS"
              ? "Berhasil"
              : f === "PENDING"
              ? "Tertunda"
              : "Gagal"}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <span>Tanggal</span>
          <span>Paket / Deskripsi</span>
          <span>Metode</span>
          <span>Status</span>
          <span>Jumlah</span>
        </div>

        {filteredData.map((t, i) => (
          <div key={i} style={styles.row}>
            <span>{formatDate(t.createdAt)}</span>
            <span>{t.packageName || t.paymentDetail || "-"}</span>
            <span>{getMethodLabel(t)}</span>
            <span style={getStatusStyle(t.status)}>
              {t.status?.toUpperCase() || "-"}
            </span>
            <span style={styles.category}>{
              t.amount ? `Rp ${Number(t.amount).toLocaleString('id-ID')}` : '-'
            }</span>
          </div>
        ))}
      </div>
    </Layout>
  );
}

// CARD COMPONENT
function Card({ title, value }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardValue}>{value}</div>
    </div>
  );
}

// STATUS STYLE
const getStatusStyle = (status) => {
  if (status === "SUCCESS") return { color: "#4caf7d" };
  if (status === "PENDING") return { color: "#f0ad4e" };
  return { color: "#ff6b6b" };
};

// DUMMY DATA
const dummyData = [
  {
    createdAt: "2026-09-02T10:15:00",
    packageName: "Booking kelas Morning Yoga",
    paymentMethod: "E-Wallet",
    status: "SUCCESS",
    amount: 50000,
  },
  {
    createdAt: "2026-09-02T11:00:00",
    packageName: "Membership 1 Bulan",
    paymentMethod: "Transfer Bank",
    status: "SUCCESS",
    amount: 300000,
  },
  {
    createdAt: "2026-09-02T12:30:00",
    packageName: "Zumba Dance",
    paymentMethod: "E-Wallet",
    status: "FAILED",
    amount: 50000,
  },
  {
    createdAt: "2026-09-02T13:45:00",
    packageName: "Membership 3 Bulan",
    paymentMethod: "Transfer Bank",
    status: "PENDING",
    amount: 800000,
  },
];

// STYLES
const styles = {
  title: {
    color: "#fff",
    fontSize: "24px",
  },
  subtitle: {
    color: "#aaa",
    marginBottom: "20px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "10px",
    marginBottom: "20px",
  },
  card: {
    backgroundColor: "#1e1e1e",
    padding: "15px",
    borderRadius: "10px",
  },
  cardTitle: {
    color: "#aaa",
    fontSize: "12px",
  },
  cardValue: {
    color: "#fff",
    fontSize: "18px",
    fontWeight: "bold",
  },
  filterRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },
  filterBtn: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
  table: {
    backgroundColor: "#1e1e1e",
    borderRadius: "10px",
    padding: "10px",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr",
    color: "#aaa",
    paddingBottom: "8px",
    borderBottom: "1px solid #333",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr",
    padding: "10px 0",
    borderBottom: "1px solid #2a2a2a",
    color: "#fff",
  },
  category: {
    backgroundColor: "#2a2a2a",
    padding: "4px 8px",
    borderRadius: "6px",
    textAlign: "center",
  },
};

