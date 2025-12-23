import { useEffect, useState } from "react";
import { database, auth } from "../firebase";
import { ref, onValue } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function SisaStok() {
  const navigate = useNavigate();

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [barangMasuk, setBarangMasuk] = useState([]);
  const [barangKeluar, setBarangKeluar] = useState([]);
  const [search, setSearch] = useState("");

  // ============================
  // AUTH SESSION
  // ============================
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });
  }, [navigate]);

  // ============================
  // LOAD DATA DARI FIREBASE
  // ============================
  useEffect(() => {
    // Load Master Inventory
    onValue(ref(database, "items"), (snap) => {
      setInventory(Object.values(snap.val() || {}));
    });
    // Load Barang Masuk
    onValue(ref(database, "barangmasuk"), (snap) => {
      setBarangMasuk(Object.values(snap.val() || {}));
    });
    // Load Barang Keluar
    onValue(ref(database, "barangkeluar"), (snap) => {
      const data = snap.val() || {};
      // Filter hanya yang sudah approved
      const arr = Object.values(data).filter((i) => i.status === "approved");
      setBarangKeluar(arr);
    });
  }, []);

  if (loadingAuth) return <div style={styles.loading}>Checking Session...</div>;

  // ============================
  // LOGIKA PERHITUNGAN STOK
  // ============================
  const map = {};
  const safePN = (pn) => String(pn || "").trim();

  inventory.forEach((i) => {
    const pn = safePN(i.partnumber);
    if (!pn) return;
    map[pn] = { partnumber: pn, nama: i.nama || "", harga: Number(i.harga || 0), stokAwal: Number(i.stok || 0), masuk: 0, keluar: 0 };
  });

  barangMasuk.forEach((bm) => {
    const pn = safePN(bm.partnumber);
    if (!pn) return;
    if (!map[pn]) map[pn] = { partnumber: pn, nama: bm.nama || "", harga: 0, stokAwal: 0, masuk: 0, keluar: 0 };
    map[pn].masuk += Number(bm.jumlah || bm.Jumlah || 0);
  });

  barangKeluar.forEach((bk) => {
    const pn = safePN(bk.partnumber);
    if (!pn) return;
    if (!map[pn]) map[pn] = { partnumber: pn, nama: bk.nama || "", harga: 0, stokAwal: 0, masuk: 0, keluar: 0 };
    map[pn].keluar += Number(bk.jumlah || bk.Jumlah || 0);
  });

  const result = Object.values(map).map((i) => {
    const sisa = i.stokAwal + i.masuk - i.keluar;
    return { ...i, sisa, nilai: sisa * Number(i.harga || 0) };
  });

  result.sort((a, b) => a.partnumber.localeCompare(b.partnumber));

  const filtered = result.filter(
    (i) =>
      i.partnumber.toLowerCase().includes(search.toLowerCase()) ||
      i.nama.toLowerCase().includes(search.toLowerCase())
  );

  const totalNilai = filtered.reduce((sum, i) => sum + i.nilai, 0);

  const exportExcel = () => {
    const dataExcel = filtered.map((i) => ({
      "Part Number": i.partnumber,
      "Nama Barang": i.nama,
      "Stok Awal": i.stokAwal,
      "Total Masuk": i.masuk,
      "Total Keluar": i.keluar,
      "Sisa Stok": i.sisa,
      "Harga Satuan": i.harga,
      "Total Nilai": i.nilai,
    }));
    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sisa Stok");
    XLSX.writeFile(wb, "Laporan_Sisa_Stok.xlsx");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: "#7b003f" }}>📊 Laporan Sisa Stok</h2>
        <button style={styles.btnLog} onClick={() => { signOut(auth); navigate("/login"); }}>Logout</button>
      </div>

      {/* NAVIGASI LENGKAP - SINKRON DENGAN MODUL LAIN */}
      <div style={styles.fullNavBar}>
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
          <button style={styles.btnNav} onClick={() => navigate("/tujuan")}>📍 Tujuan</button>
        </div>

        <div style={styles.navGroup}>
          <span style={styles.navLabel}>TRANSAKSI</span>
          <button style={styles.btnNav} onClick={() => navigate("/barang-masuk")}>📥 Masuk</button>
          <button style={styles.btnNav} onClick={() => navigate("/barang-keluar")}>📤 Keluar</button>
          <button style={styles.btnNav} onClick={() => navigate("/approval-barang-keluar")}>📝 Approval</button>
        </div>

        <div style={styles.navGroup}>
          <span style={styles.navLabel}>LAPORAN</span>
          <button style={{...styles.btnNav, background: "#7b003f", color: "#fff"}} onClick={() => navigate("/sisa-stok")}>📊 Sisa Stok</button>
          <button style={styles.btnNav} onClick={() => navigate("/stock-opname")}>📋 Opname</button>
        </div>
      </div>

      {/* SUMMARY & ACTION */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 15 }}>
          <div>
            <span style={{ fontSize: 12, color: '#666' }}>Total Nilai Stok (Terfilter)</span>
            <h2 style={{ margin: 0, color: '#7b003f' }}>Rp {totalNilai.toLocaleString()}</h2>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              placeholder="Cari Part Number / Nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.inputSearch}
            />
            <button onClick={exportExcel} style={styles.btnExcel}>⬇ Export Excel</button>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div style={styles.card}>
        <div style={{ overflowX: "auto" }}>
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
              {filtered.map((i) => (
                <tr key={i.partnumber} style={styles.tr}>
                  <td style={styles.td}><b>{i.partnumber}</b></td>
                  <td style={styles.td}>{i.nama}</td>
                  <td style={styles.td}>{i.stokAwal}</td>
                  <td style={{...styles.td, color: 'green'}}>+{i.masuk}</td>
                  <td style={{...styles.td, color: 'red'}}>-{i.keluar}</td>
                  <td style={{
                    ...styles.td,
                    background: i.sisa <= 0 ? "#fff0f0" : "transparent",
                    color: i.sisa <= 0 ? "#d9534f" : "#333",
                    fontWeight: i.sisa <= 0 ? "bold" : "normal"
                  }}>
                    {i.sisa}
                  </td>
                  <td style={styles.td}>{i.harga.toLocaleString()}</td>
                  <td style={{...styles.td, fontWeight: 'bold'}}>{i.nilai.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
  inputSearch: { padding: "10px", borderRadius: "6px", border: "1px solid #ddd", width: "250px" },
  btnExcel: { background: "#28a745", color: "#fff", border: "none", padding: "10px 15px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px", textAlign: "left", fontSize: "12px", color: "#666", borderBottom: "2px solid #eee" },
  td: { padding: "12px", fontSize: "13px", borderBottom: "1px solid #f9f9f9" },
  tr: { transition: "0.2s" },
  btnLog: { background: "#333", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" },
  loading: { textAlign: "center", padding: 50 }
};