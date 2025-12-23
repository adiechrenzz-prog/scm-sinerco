import { useEffect, useState, useRef } from "react";
import { database, auth } from "../firebase"; // Pastikan firebase.js ada di folder src
import { ref, onValue, update, remove, push, set } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function ApprovalBarangKeluar() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // =========================
  // AUTH CHECK
  // =========================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        navigate("/login");
      } else {
        setLoadingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // =========================
  // LOAD DATA FROM FIREBASE
  // =========================
  useEffect(() => {
    const barangKeluarRef = ref(database, "barangkeluar");
    const unsubscribe = onValue(barangKeluarRef, (snap) => {
      const data = snap.val() || {};
      // Mengubah object Firebase menjadi array dan memastikan ID tersimpan
      const formattedData = Object.entries(data).map(([key, value]) => ({
        id: key,
        ...value,
      }));
      setItems(formattedData);
    });
    return () => unsubscribe();
  }, []);

  // =========================
  // LOGIC FUNCTIONS
  // =========================
  const setStatus = (id, status) => {
    update(ref(database, "barangkeluar/" + id), { status });
  };

  const deleteAll = () => {
    if (window.confirm("PERINGATAN! Anda akan menghapus SEMUA data approval. Lanjutkan?")) {
      remove(ref(database, "barangkeluar"));
      alert("Seluruh data berhasil dibersihkan.");
    }
  };

  const handleLogout = () => {
    signOut(auth).then(() => navigate("/login"));
  };

  // =========================
  // EXPORT & IMPORT EXCEL
  // =========================
  const exportExcel = () => {
    const rows = items.map((i) => ({
      "No DO": i.noDO,
      "Part Number": i.partnumber,
      "Nama Barang": i.nama,
      "Jumlah": i.jumlah,
      "Harga Satuan": i.harga,
      "Total Harga": i.jumlah * i.harga,
      "Peminta": i.peminta,
      "Tujuan": i.tujuan,
      "Waktu Transaksi": i.waktu,
      "Status Approval": i.status,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Log Barang Keluar");
    XLSX.writeFile(wb, `Approval_Report_${new Date().toLocaleDateString()}.xlsx`);
  };

  const importExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

      rows.forEach((r) => {
        const newRef = push(ref(database, "barangkeluar"));
        set(newRef, {
          id: newRef.key,
          noDO: r["No DO"] || "-",
          partnumber: r["Part Number"] || "-",
          nama: r["Nama Barang"] || r["Nama"] || "-",
          jumlah: Number(r["Jumlah"]) || 0,
          harga: Number(r["Harga Satuan"]) || Number(r["Harga"]) || 0,
          peminta: r["Peminta"] || "-",
          tujuan: r["Tujuan"] || "-",
          waktu: r["Waktu Transaksi"] || r["Waktu"] || new Date().toLocaleString(),
          status: r["Status Approval"] || "pending",
        });
      });
      alert("Data Excel berhasil di-import!");
    };
    reader.readAsArrayBuffer(file);
  };

  // Filter Search
  const filteredItems = items.filter(item => 
    item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.noDO?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingAuth) return <div style={{ padding: 20 }}>Memuat Otoritas...</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>📝 Approval Barang Keluar</h2>
        <button onClick={handleLogout} style={{ background: "#f44336", color: "white", border: "none", padding: "8px 15px", borderRadius: 4, cursor: "pointer" }}>
          Logout
        </button>
      </div>

      {/* NAVIGASI UTAMA */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, background: "#f5f5f5", padding: 15, borderRadius: 8 }}>
        <button onClick={() => navigate("/dashboard-ho")} style={navBtnStyle}>🏠 HO Home</button>
        <button onClick={() => navigate("/dashboard-inventory")} style={navBtnStyle}>📦 Dash Inventory</button>
        <button onClick={() => navigate("/barang-masuk")} style={navBtnStyle}>📥 Barang Masuk</button>
        <button onClick={() => navigate("/barang-keluar")} style={navBtnStyle}>📤 Request Keluar</button>
        <button onClick={() => navigate("/stock-opname")} style={navBtnStyle}>📋 Stock Opname</button>
        
        <div style={{ borderLeft: "2px solid #ccc", height: "30px", margin: "0 10px" }}></div>

        <button onClick={() => fileRef.current.click()} style={{ ...actionBtnStyle, background: "#2196F3" }}>⬆ Import Excel</button>
        <button onClick={exportExcel} style={{ ...actionBtnStyle, background: "#4CAF50" }}>⬇ Export Excel</button>
        <button onClick={deleteAll} style={{ ...actionBtnStyle, background: "red" }}>🗑 Hapus Semua</button>
        
        <input type="file" ref={fileRef} accept=".xlsx,.xls" style={{ display: "none" }} onChange={importExcel} />
      </div>

      {/* SEARCH BOX */}
      <input 
        type="text" 
        placeholder="Cari Nama Barang atau No DO..." 
        style={{ width: "100%", padding: "10px", marginBottom: "20px", borderRadius: "4px", border: "1px solid #ddd" }}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* TABLE */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ background: "#333", color: "white" }}>
              <th style={thStyle}>No DO</th>
              <th style={thStyle}>Part Number</th>
              <th style={thStyle}>Nama Barang</th>
              <th style={thStyle}>Jumlah</th>
              <th style={thStyle}>Total Harga</th>
              <th style={thStyle}>Peminta</th>
              <th style={thStyle}>Tujuan</th>
              <th style={thStyle}>Waktu</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Aksi Approval</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? filteredItems.map((i) => (
              <tr key={i.id} style={{ 
                borderBottom: "1px solid #ddd",
                backgroundColor: i.status === "approved" ? "#e8f5e9" : i.status === "rejected" ? "#ffebee" : "white"
              }}>
                <td style={tdStyle}>{i.noDO}</td>
                <td style={tdStyle}>{i.partnumber}</td>
                <td style={tdStyle}>{i.nama}</td>
                <td style={tdStyle}>{i.jumlah}</td>
                <td style={tdStyle}>{(i.jumlah * i.harga).toLocaleString()}</td>
                <td style={tdStyle}>{i.peminta}</td>
                <td style={tdStyle}>{i.tujuan}</td>
                <td style={tdStyle}>{i.waktu}</td>
                <td style={{ ...tdStyle, fontWeight: "bold", color: getStatusColor(i.status) }}>
                  {i.status?.toUpperCase()}
                </td>
                <td style={tdStyle}>
                  {i.status === "pending" ? (
                    <div style={{ display: "flex", gap: 5 }}>
                      <button onClick={() => setStatus(i.id, "approved")} style={approveBtnStyle}>✔ Approve</button>
                      <button onClick={() => setStatus(i.id, "rejected")} style={rejectBtnStyle}>✖ Reject</button>
                    </div>
                  ) : (
                    <button onClick={() => setStatus(i.id, "pending")} style={resetBtnStyle}>🔄 Reset</button>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="10" style={{ textAlign: "center", padding: 20 }}>Tidak ada data barang keluar.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =========================
// STYLES & HELPERS
// =========================
const thStyle = { padding: "12px", textAlign: "left", border: "1px solid #ddd" };
const tdStyle = { padding: "10px", border: "1px solid #ddd" };
const navBtnStyle = { padding: "8px 12px", cursor: "pointer", borderRadius: "4px", border: "1px solid #ccc", background: "white" };
const actionBtnStyle = { padding: "8px 12px", cursor: "pointer", borderRadius: "4px", border: "none", color: "white", fontWeight: "bold" };
const approveBtnStyle = { background: "#4CAF50", color: "white", border: "none", padding: "5px 10px", borderRadius: 4, cursor: "pointer" };
const rejectBtnStyle = { background: "#f44336", color: "white", border: "none", padding: "5px 10px", borderRadius: 4, cursor: "pointer" };
const resetBtnStyle = { background: "#ff9800", color: "white", border: "none", padding: "5px 10px", borderRadius: 4, cursor: "pointer" };

const getStatusColor = (status) => {
  if (status === "approved") return "#2e7d32";
  if (status === "rejected") return "#c62828";
  return "#f57c00";
};