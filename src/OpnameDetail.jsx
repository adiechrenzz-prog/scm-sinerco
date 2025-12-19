import { useEffect, useState } from "react";
import { database, auth } from "./firebase";
import { ref, onValue } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";

export default function OpnameDetail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tanggal = params.get("tanggal"); // folder opname

  const [items, setItems] = useState([]);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // ========================= AUTH =========================
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });
  }, [navigate]);

  // ========================= LOAD DATA =========================
  useEffect(() => {
    if (!tanggal) return;
    const r = ref(database, "stockopname/" + tanggal);
    return onValue(r, (snap) => {
      const data = snap.val() || [];
      setItems(Object.values(data));
    });
  }, [tanggal]);

  if (loadingAuth) return <div style={styles.loading}>Checking Session...</div>;
  if (!tanggal) return <div style={styles.container}>Tanggal opname tidak ditemukan.</div>;

  const totalNilai = items.reduce((t, i) => t + Number(i.nilai || 0), 0);

  // ========================= ACTIONS =========================
  const exportExcel = () => {
    const rows = items.map((i) => ({
      "Part Number": i.partnumber,
      "Nama Barang": i.nama,
      "Stok Awal": i.stokAwal,
      "Total Masuk": i.masuk,
      "Total Keluar": i.keluar,
      "Sisa Stok": i.sisa,
      "Harga Satuan": i.harga,
      "Total Nilai": i.nilai,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detail Opname");
    XLSX.writeFile(wb, `Detail_Opname_${tanggal}.xlsx`);
  };

  return (
    <div style={styles.container}>
      {/* HEADER & LOGOUT */}
      <div style={styles.header} className="no-print">
        <h2 style={{ margin: 0, color: "#7b003f" }}>📄 Detail Stock Opname</h2>
        <button style={styles.btnLog} onClick={() => { signOut(auth); navigate("/login"); }}>Logout</button>
      </div>

      {/* NAVIGASI TERPADU (Sembunyikan saat print) */}
      <div style={styles.fullNavBar} className="no-print">
        <div style={styles.navGroup}>
          <span style={styles.navLabel}>SISTEM</span>
          <button style={styles.btnNav} onClick={() => navigate("/dashboard")}>🏠 Dashboard</button>
          <button style={styles.btnNav} onClick={() => navigate("/inventory")}>📦 Inventory</button>
        </div>
        <div style={styles.navGroup}>
          <span style={styles.navLabel}>MASTER DATA</span>
          <button style={styles.btnNav} onClick={() => navigate("/datapart")}>🛠 Datapart</button>
          <button style={styles.btnNav} onClick={() => navigate("/supplier")}>🏢 Supplier</button>
          <button style={styles.btnNav} onClick={() => navigate("/peminta")}>👤 Peminta</button>
        </div>
        <div style={styles.navGroup}>
          <span style={styles.navLabel}>TRANSAKSI</span>
          <button style={styles.btnNav} onClick={() => navigate("/barang-masuk")}>📥 Masuk</button>
          <button style={styles.btnNav} onClick={() => navigate("/barang-keluar")}>📤 Keluar</button>
        </div>
        <div style={styles.navGroup}>
          <span style={styles.navLabel}>LAPORAN</span>
          <button style={styles.btnNav} onClick={() => navigate("/sisa-stok")}>📊 Sisa Stok</button>
          <button style={{...styles.btnNav, background: "#7b003f", color: "#fff"}} onClick={() => navigate("/stock-opname")}>📋 Opname</button>
        </div>
      </div>

      {/* ACTION CARD */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ margin: 0 }}>🕒 Arsip: {tanggal.replace("_", " ")}</h3>
            <p style={{ margin: "5px 0 0 0", color: "#7b003f", fontWeight: "bold" }}>
              Total Nilai: Rp {totalNilai.toLocaleString()}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }} className="no-print">
            <button onClick={() => navigate("/stock-opname")} style={styles.btnBack}>⬅ Kembali</button>
            <button onClick={exportExcel} style={styles.btnExcel}>⬇ Export Excel</button>
            <button onClick={() => window.print()} style={styles.btnPrint}>🖨 Print PDF</button>
          </div>
        </div>
      </div>

      {/* TABEL DATA */}
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr style={{ background: "#f2f2f2" }}>
              <th style={styles.th}>Part Number</th>
              <th style={styles.th}>Nama Barang</th>
              <th style={styles.th}>Stok Awal</th>
              <th style={styles.th}>Masuk</th>
              <th style={styles.th}>Keluar</th>
              <th style={styles.th}>Sisa</th>
              <th style={styles.th}>Harga</th>
              <th style={styles.th}>Nilai</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i, idx) => (
              <tr key={idx} style={styles.tr}>
                <td style={styles.td}><b>{i.partnumber}</b></td>
                <td style={styles.td}>{i.nama}</td>
                <td style={styles.td}>{i.stokAwal}</td>
                <td style={styles.td}>{i.masuk}</td>
                <td style={styles.td}>{i.keluar}</td>
                <td style={styles.td}>{i.sisa}</td>
                <td style={styles.td}>{Number(i.harga).toLocaleString()}</td>
                <td style={styles.td}>{Number(i.nilai).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CSS KHUSUS PRINT */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          ${styles.card} { box-shadow: none !important; border: 1px solid #ddd !important; padding: 10px !important; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: { padding: "20px", backgroundColor: "#f4f7f6", minHeight: "100vh", fontFamily: "sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  fullNavBar: { display: "flex", gap: "20px", marginBottom: "20px", background: "#fff", padding: "15px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", flexWrap: "wrap" },
  navGroup: { display: "flex", flexDirection: "column", gap: "5px", borderLeft: "3px solid #7b003f", paddingLeft: "12px" },
  navLabel: { fontSize: "10px", fontWeight: "bold", color: "#7b003f", marginBottom: "2px" },
  btnNav: { padding: "7px 12px", cursor: "pointer", background: "#f8f9fa", border: "1px solid #ddd", borderRadius: "4px", fontSize: "12px", textAlign: "left" },
  card: { background: "#fff", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", marginBottom: 20 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px", textAlign: "left", fontSize: "12px", color: "#666", borderBottom: "2px solid #eee" },
  td: { padding: "12px", fontSize: "12px", borderBottom: "1px solid #f9f9f9" },
  btnBack: { background: "#6c757d", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" },
  btnExcel: { background: "#28a745", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" },
  btnPrint: { background: "#17a2b8", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" },
  btnLog: { background: "#333", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" },
  loading: { textAlign: "center", padding: 50 }
};