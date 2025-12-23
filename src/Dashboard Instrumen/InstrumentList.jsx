import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { database, auth } from "../firebase";
import { ref, onValue, set, remove } from "firebase/database";
import { signOut } from "firebase/auth";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function InstrumentList() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    id: "",
    instrument: "",
    serial: "",
    range: "",
    merk: "",
    location: "",
    pihakKalibrasi: "",
    lastCal: "",
    nextCal: "",
    certificate: "",
    status: "OK",
  });

  // ========================= 1. LOAD DATA =========================
  useEffect(() => {
    const r = ref(database, "instrumentList");
    return onValue(r, (snap) => {
      const val = snap.val() || {};
      const list = Object.keys(val).map(key => ({
        ...val[key],
        id: val[key].id || key 
      }));
      setData(list);
    });
  }, []);

  // ========================= 2. HANDLERS =========================
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({
      id: "", instrument: "", serial: "", range: "", merk: "",
      location: "", pihakKalibrasi: "", lastCal: "", nextCal: "",
      certificate: "", status: "OK",
    });
    setEditMode(false);
  };

  const saveData = () => {
    if (!form.id || !form.instrument) {
      alert("No Unit & Nama Instrument wajib diisi!");
      return;
    }
    set(ref(database, "instrumentList/" + form.id), form)
      .then(() => {
        alert("✔ Data Berhasil Disimpan");
        resetForm();
      })
      .catch((err) => alert("Gagal: " + err.message));
  };

  const deleteData = (id) => {
    if (window.confirm("Hapus instrument ini?")) {
      remove(ref(database, "instrumentList/" + id));
    }
  };

  const filtered = data.filter(
    (i) =>
      String(i.id).toLowerCase().includes(search.toLowerCase()) ||
      String(i.instrument).toLowerCase().includes(search.toLowerCase()) ||
      String(i.location).toLowerCase().includes(search.toLowerCase())
  );

  // ========================= 3. EXPORT / IMPORT =========================
  const importExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bytes = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(bytes, { type: "array" });
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });

      rows.forEach((row) => {
        if (!row.id) return;
        set(ref(database, "instrumentList/" + row.id), row);
      });
      alert("✔ Import Excel berhasil!");
    };
    reader.readAsArrayBuffer(file);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Instrument");
    XLSX.writeFile(wb, "Instrument_Master_List.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF("l", "pt", "a4");
    doc.text("Instrument Master List", 40, 40);
    const tableData = filtered.map((i) => [
      i.id, i.instrument, i.serial, i.range, i.merk, i.location, i.status
    ]);
    doc.autoTable({
      startY: 60,
      head: [["No Unit", "Instrument", "Serial", "Range", "Merk", "Location", "Status"]],
      body: tableData,
    });
    doc.save("Instrument_List.pdf");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ color: "#7b003f", margin: 0 }}>🔧 Instrument Master List</h2>
        <button style={styles.btnLog} onClick={() => { signOut(auth); navigate("/login"); }}>Logout</button>
      </div>

      {/* NAVIGASI LENGKAP (TAMBAHAN TOMBOL SESUAI REQUEST) */}
      <div style={styles.fullNavBar}>
        <div style={styles.navGroup}>
          <span style={styles.navLabel}>CALIBRATION SYSTEM</span>
          <div style={styles.btnRow}>
            <button style={styles.btnNav} onClick={() => navigate("/dashboard")}>🏠 Dashboard</button>
            <button style={{...styles.btnNav, background: "#7b003f", color: "#fff"}}>🛠 List Instrument</button>
            <button style={styles.btnNav} onClick={() => navigate("/calibration-history")}>📘 History</button>
            <button style={styles.btnNav} onClick={() => navigate("/calibration-schedule")}>📅 Schedule</button>
            <button style={styles.btnNav} onClick={() => navigate("/calibration-reminder")}>⏰ Reminder</button>
            <button style={styles.btnNav} onClick={() => navigate("/calibration-certificate")}>📄 Certificate</button>
          </div>
        </div>
      </div>

      {/* FORM INPUT */}
      <div style={styles.card}>
        <h4 style={{marginTop:0}}>{editMode ? "✏ Edit Instrument" : "➕ Tambah Instrument Baru"}</h4>
        <div style={styles.formGrid}>
          <input name="id" placeholder="No Unit (ID)" value={form.id} onChange={handleChange} style={styles.input} disabled={editMode} />
          <input name="instrument" placeholder="Nama Instrument" value={form.instrument} onChange={handleChange} style={styles.input} />
          <input name="serial" placeholder="Serial Number" value={form.serial} onChange={handleChange} style={styles.input} />
          <input name="range" placeholder="Range" value={form.range} onChange={handleChange} style={styles.input} />
          <input name="merk" placeholder="Merk" value={form.merk} onChange={handleChange} style={styles.input} />
          <input name="location" placeholder="Location" value={form.location} onChange={handleChange} style={styles.input} />
          <input name="pihakKalibrasi" placeholder="Pihak Kalibrasi" value={form.pihakKalibrasi} onChange={handleChange} style={styles.input} />
          <div style={{display:'flex', flexDirection:'column'}}>
            <label style={{fontSize:10}}>Last Cal:</label>
            <input type="date" name="lastCal" value={form.lastCal} onChange={handleChange} style={styles.input} />
          </div>
          <div style={{display:'flex', flexDirection:'column'}}>
            <label style={{fontSize:10}}>Next Cal:</label>
            <input type="date" name="nextCal" value={form.nextCal} onChange={handleChange} style={styles.input} />
          </div>
          <input name="certificate" placeholder="Certificate No." value={form.certificate} onChange={handleChange} style={styles.input} />
        </div>
        <div style={{marginTop:15}}>
          <button style={styles.btnPrimary} onClick={saveData}>{editMode ? "Update Data" : "Simpan Data"}</button>
          {editMode && <button onClick={resetForm} style={styles.btnSec}>Batal</button>}
        </div>
      </div>

      {/* TOOLBAR TABLE */}
      <div style={styles.toolbar}>
        <input 
          placeholder="🔍 Cari No Unit / Nama / Lokasi..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          style={styles.inputSearch} 
        />
        <div style={{display:'flex', gap:5}}>
            <button style={styles.btnExcel} onClick={exportExcel}>Export Excel</button>
            <button style={styles.btnPDF} onClick={exportPDF}>Export PDF</button>
            <label style={styles.btnImport}>
               Import Excel
               <input type="file" accept=".xlsx,.xls" onChange={importExcel} hidden />
            </label>
        </div>
      </div>

      {/* TABLE */}
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr style={{ background: "#f2f2f2" }}>
              <th style={styles.th}>No Unit</th>
              <th style={styles.th}>Instrument</th>
              <th style={styles.th}>Serial</th>
              <th style={styles.th}>Merk</th>
              <th style={styles.th}>Location</th>
              <th style={styles.th}>Next Cal</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.id} style={styles.tr}>
                <td style={styles.td}><b>{i.id}</b></td>
                <td style={styles.td}>{i.instrument}</td>
                <td style={styles.td}>{i.serial}</td>
                <td style={styles.td}>{i.merk}</td>
                <td style={styles.td}>{i.location}</td>
                <td style={styles.td}>{i.nextCal}</td>
                <td style={{...styles.td, fontWeight: "bold", color: i.status === "OK" ? "green" : "red"}}>{i.status}</td>
                <td style={styles.td}>
                  <button style={styles.btnEdit} onClick={() => { setForm(i); setEditMode(true); }}>Edit</button>
                  <button style={styles.btnDel} onClick={() => deleteData(i.id)}>Hapus</button>
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
  input: { padding: "8px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "13px" },
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
  btnImport: { background: "#333", color: "#fff", padding: "8px 12px", borderRadius: "5px", cursor: "pointer", fontSize: "12px" },
  btnLog: { background: "#333", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer" },
  loading: { textAlign: "center", marginTop: 100 }
};