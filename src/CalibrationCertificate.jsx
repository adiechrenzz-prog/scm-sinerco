import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { database, auth } from "./firebase";
import { ref, onValue, set, update, remove } from "firebase/database";
import { signOut } from "firebase/auth";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function CalibrationCertificate() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [instruments, setInstruments] = useState([]); // Untuk dropdown instrument
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    instrumentName: "",
    certificateNumber: "",
    calibrationDate: "",
    validUntil: "",
  });

  // ========================= 1. LOAD DATA =========================
  useEffect(() => {
    // Load Master Instruments untuk dropdown
    const instRef = ref(database, "instrumentList");
    onValue(instRef, (snap) => {
      const val = snap.val() || {};
      setInstruments(Object.values(val));
    });

    // Load Certificates
    const certRef = ref(database, "calibrationCertificates");
    onValue(certRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const arr = Object.keys(val).map((id) => ({
          id,
          ...val[id],
        }));
        setData(arr);
      } else {
        setData([]);
      }
    });
  }, []);

  // ========================= 2. HANDLERS =========================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ instrumentName: "", certificateNumber: "", calibrationDate: "", validUntil: "" });
    setEditId(null);
  };

  const saveCertificate = () => {
    if (!form.instrumentName || !form.certificateNumber) {
      return alert("Instrument dan No Sertifikat wajib diisi!");
    }

    if (editId) {
      update(ref(database, "calibrationCertificates/" + editId), form)
        .then(() => alert("✔ Berhasil Update"));
    } else {
      const id = Date.now();
      set(ref(database, "calibrationCertificates/" + id), form)
        .then(() => alert("✔ Berhasil Tambah"));
    }
    resetForm();
  };

  const deleteCert = (id) => {
    if (window.confirm("Hapus sertifikat ini?")) {
      remove(ref(database, "calibrationCertificates/" + id));
    }
  };

  // Filter Search
  const filteredData = data.filter(d => 
    d.instrumentName.toLowerCase().includes(search.toLowerCase()) ||
    d.certificateNumber.toLowerCase().includes(search.toLowerCase())
  );

  // ========================= 3. EXPORT =========================
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Certificates");
    XLSX.writeFile(wb, "Calibration_Certificates.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Calibration Certificate List", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["Instrument", "Certificate No", "Date", "Valid Until"]],
      body: filteredData.map((d) => [d.instrumentName, d.certificateNumber, d.calibrationDate, d.validUntil]),
    });
    doc.save("Calibration_Certificates.pdf");
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={{ color: "#7b003f", margin: 0 }}>📄 Calibration Certificate</h2>
        <button style={styles.btnLog} onClick={() => { signOut(auth); navigate("/login"); }}>Logout</button>
      </div>

      {/* NAVIGASI LENGKAP (TOMBOL KE SEMUA) */}
      <div style={styles.fullNavBar}>
        <div style={styles.navGroup}>
          <span style={styles.navLabel}>CALIBRATION MENU</span>
          <div style={styles.btnRow}>
            <button style={styles.btnNav} onClick={() => navigate("/dashboard-ho")}>🏠 Dashboard</button>
            <button style={styles.btnNav} onClick={() => navigate("/instrument-list")}>🛠 List Instrument</button>
            <button style={styles.btnNav} onClick={() => navigate("/calibration-history")}>📘 History</button>
            <button style={styles.btnNav} onClick={() => navigate("/calibration-schedule")}>📅 Schedule</button>
            <button style={styles.btnNav} onClick={() => navigate("/calibration-reminder")}>⏰ Reminder</button>
            <button style={{...styles.btnNav, background: "#7b003f", color: "#fff"}}>📄 Certificate</button>
          </div>
        </div>
      </div>

      {/* FORM CARD */}
      <div style={styles.card}>
        <h4 style={{ marginTop: 0 }}>{editId ? "✏ Edit Sertifikat" : "➕ Tambah Sertifikat Baru"}</h4>
        <div style={styles.formGrid}>
          <select name="instrumentName" value={form.instrumentName} onChange={handleChange} style={styles.input}>
            <option value="">-- Pilih Instrument --</option>
            {instruments.map(inst => (
              <option key={inst.id} value={inst.instrument}>{inst.id} - {inst.instrument}</option>
            ))}
          </select>
          <input name="certificateNumber" placeholder="No Sertifikat" value={form.certificateNumber} onChange={handleChange} style={styles.input} />
          <div style={styles.inputGroup}>
            <label style={styles.label}>Tgl Kalibrasi</label>
            <input type="date" name="calibrationDate" value={form.calibrationDate} onChange={handleChange} style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Berlaku Hingga</label>
            <input type="date" name="validUntil" value={form.validUntil} onChange={handleChange} style={styles.input} />
          </div>
        </div>
        <div style={{ marginTop: 15 }}>
          <button style={styles.btnPrimary} onClick={saveCertificate}>{editId ? "Update" : "Simpan"}</button>
          {editId && <button style={styles.btnSec} onClick={resetForm}>Batal</button>}
        </div>
      </div>

      {/* TOOLBAR */}
      <div style={styles.toolbar}>
        <input 
          style={styles.inputSearch} 
          placeholder="🔍 Cari Instrument / No Sertifikat..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
        <div style={{ display: 'flex', gap: 5 }}>
          <button style={styles.btnExcel} onClick={exportExcel}>Export Excel</button>
          <button style={styles.btnPDF} onClick={exportPDF}>Export PDF</button>
        </div>
      </div>

      {/* TABLE */}
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr style={{ background: "#f2f2f2" }}>
              <th style={styles.th}>Instrument</th>
              <th style={styles.th}>Certificate No</th>
              <th style={styles.th}>Calibration Date</th>
              <th style={styles.th}>Valid Until</th>
              <th style={styles.th}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((d) => (
              <tr key={d.id} style={styles.tr}>
                <td style={styles.td}>{d.instrumentName}</td>
                <td style={styles.td}><b>{d.certificateNumber}</b></td>
                <td style={styles.td}>{d.calibrationDate}</td>
                <td style={styles.td}>{d.validUntil}</td>
                <td style={styles.td}>
                  <button style={styles.btnEdit} onClick={() => { setEditId(d.id); setForm(d); }}>Edit</button>
                  <button style={styles.btnDel} onClick={() => deleteCert(d.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "20px", backgroundColor: "#f4f7f6", minHeight: "100vh", fontFamily: "sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  fullNavBar: { background: "#fff", padding: "15px", borderRadius: "10px", marginBottom: "20px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" },
  navGroup: { display: "flex", flexDirection: "column", gap: "5px", borderLeft: "3px solid #7b003f", paddingLeft: "12px" },
  navLabel: { fontSize: "10px", fontWeight: "bold", color: "#7b003f" },
  btnRow: { display: "flex", gap: "5px", flexWrap: "wrap" },
  btnNav: { padding: "7px 12px", cursor: "pointer", background: "#f8f9fa", border: "1px solid #ddd", borderRadius: "4px", fontSize: "12px" },
  card: { background: "#fff", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", marginBottom: 20 },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" },
  input: { padding: "8px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "13px", width: '100%' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '10px', color: '#666', marginBottom: '2px' },
  inputSearch: { flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ddd" },
  toolbar: { display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "15px", alignItems: "center" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px", textAlign: "left", fontSize: "12px", borderBottom: "2px solid #ddd" },
  td: { padding: "12px", fontSize: "12px", borderBottom: "1px solid #eee" },
  btnPrimary: { background: "#7b003f", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer" },
  btnSec: { background: "#666", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", marginLeft: 5 },
  btnEdit: { background: "#007bff", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", marginRight: 5 },
  btnDel: { background: "#dc3545", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" },
  btnExcel: { background: "#157347", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "5px", cursor: "pointer", fontSize: "12px" },
  btnPDF: { background: "#d32f2f", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "5px", cursor: "pointer", fontSize: "12px" },
  btnLog: { background: "#333", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer" },
};