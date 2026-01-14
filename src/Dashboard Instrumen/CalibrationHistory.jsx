import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { database, auth } from "../firebase";
import { ref, onValue, push, remove } from "firebase/database";
import { signOut } from "firebase/auth";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function CalibrationHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [instruments, setInstruments] = useState([]); 
  const [search, setSearch] = useState("");
  
  const [form, setForm] = useState({
    noUnit: "",
    instrumentName: "",
    calibrationDate: "",
    calibrationAgency: "",
    certificateNo: "",
    result: "Pass",
    remarks: ""
  });

  useEffect(() => {
    const instRef = ref(database, "instrumentList");
    onValue(instRef, (snap) => {
      const val = snap.val() || {};
      setInstruments(Object.values(val));
    });

    const histRef = ref(database, "calibrationHistory");
    onValue(histRef, (snap) => {
      const val = snap.val() || {};
      const list = Object.keys(val).map(key => ({
        firebaseID: key,
        ...val[key]
      }));
      setHistory(list.reverse()); 
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "noUnit") {
      const selected = instruments.find(i => i.id === value);
      setForm({ 
        ...form, 
        noUnit: value, 
        instrumentName: selected ? selected.instrument : "" 
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const saveHistory = () => {
    if (!form.noUnit || !form.calibrationDate) {
      return alert("No Unit dan Tanggal Kalibrasi wajib diisi!");
    }
    const histRef = ref(database, "calibrationHistory");
    push(histRef, form)
      .then(() => {
        alert("✔ Riwayat Kalibrasi Tersimpan");
        setForm({
          noUnit: "", instrumentName: "", calibrationDate: "",
          calibrationAgency: "", certificateNo: "", result: "Pass", remarks: ""
        });
      })
      .catch(err => alert("Gagal: " + err.message));
  };

  const deleteHistory = (id) => {
    if (window.confirm("Hapus catatan riwayat ini?")) {
      remove(ref(database, `calibrationHistory/${id}`));
    }
  };

  const filtered = history.filter(h => 
    String(h.noUnit).toLowerCase().includes(search.toLowerCase()) ||
    String(h.instrumentName).toLowerCase().includes(search.toLowerCase())
  );

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Calibration_History");
    XLSX.writeFile(wb, "Calibration_History.xlsx");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ color: "#7b003f", margin: 0 }}>📘 Calibration History</h2>
        <button style={styles.btnLog} onClick={() => { signOut(auth); navigate("/login"); }}>Logout</button>
      </div>

      <div style={styles.fullNavBar}>
        <div style={styles.navGroup}>
          <span style={styles.navLabel}>CALIBRATION MENU</span>
          <div style={styles.btnRow}>
            <button style={styles.btnNav} onClick={() => navigate("/dashboard")}>🏠 Dashboard</button>
            <button style={styles.btnNav} onClick={() => navigate("/instrument-list")}>🛠 List Instrument</button>
            <button style={{...styles.btnNav, background: "#7b003f", color: "#fff"}}>📘 History</button>
            <button style={styles.btnNav} onClick={() => navigate("/calibration-schedule")}>📅 Schedule</button>
            <button style={styles.btnNav} onClick={() => navigate("/calibration-reminder")}>⏰ Reminder</button>
            <button style={styles.btnNav} onClick={() => navigate("/calibration-certificate")}>📄 Certificate</button>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h4 style={{marginTop:0}}>➕ Catat Kalibrasi Baru</h4>
        <div style={styles.formGrid}>
          <div style={styles.inputBox}>
            <label style={styles.label}>Pilih No Unit:</label>
            <select name="noUnit" value={form.noUnit} onChange={handleChange} style={styles.input}>
              <option value="">-- Pilih Unit --</option>
              {instruments.map(i => (
                <option key={i.id} value={i.id}>{i.id} - {i.instrument}</option>
              ))}
            </select>
          </div>
          <div style={styles.inputBox}>
            <label style={styles.label}>Tanggal Kalibrasi:</label>
            <input type="date" name="calibrationDate" value={form.calibrationDate} onChange={handleChange} style={styles.input} />
          </div>
          <div style={styles.inputBox}>
            <label style={styles.label}>Lembaga Kalibrasi:</label>
            <input name="calibrationAgency" placeholder="Nama Vendor/Lembaga" value={form.calibrationAgency} onChange={handleChange} style={styles.input} />
          </div>
          <div style={styles.inputBox}>
            <label style={styles.label}>No. Sertifikat:</label>
            <input name="certificateNo" placeholder="No. Sertifikat" value={form.certificateNo} onChange={handleChange} style={styles.input} />
          </div>
          <div style={styles.inputBox}>
            <label style={styles.label}>Hasil:</label>
            <select name="result" value={form.result} onChange={handleChange} style={styles.input}>
              <option value="Pass">Pass (OK)</option>
              <option value="Fail">Fail (Not OK)</option>
            </select>
          </div>
        </div>
        <button style={styles.btnPrimary} onClick={saveHistory}>Simpan Riwayat</button>
      </div>

      <div style={styles.toolbar}>
        <input 
          placeholder="🔍 Cari No Unit / Nama..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          style={styles.inputSearch} 
        />
        <button style={styles.btnExcel} onClick={exportExcel}>Export Excel</button>
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr style={{ background: "#f2f2f2" }}>
              <th style={styles.th}>No Unit</th>
              <th style={styles.th}>Instrument</th>
              <th style={styles.th}>Tanggal</th>
              <th style={styles.th}>Lembaga</th>
              <th style={styles.th}>No. Sertifikat</th>
              <th style={styles.th}>Hasil</th>
              <th style={styles.th}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((h) => (
              <tr key={h.firebaseID}>
                <td style={styles.td}><b>{h.noUnit}</b></td>
                <td style={styles.td}>{h.instrumentName}</td>
                <td style={styles.td}>{h.calibrationDate}</td>
                <td style={styles.td}>{h.calibrationAgency}</td>
                <td style={styles.td}>{h.certificateNo}</td>
                <td style={{...styles.td, fontWeight:'bold', color: h.result === 'Pass' ? 'green' : 'red'}}>{h.result}</td>
                <td style={styles.td}>
                  <button style={styles.btnDel} onClick={() => deleteHistory(h.firebaseID)}>Hapus</button>
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
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "15px", marginBottom: "15px" },
  inputBox: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '11px', fontWeight: 'bold' },
  input: { padding: "8px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "13px" },
  inputSearch: { flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ddd" },
  toolbar: { display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "15px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px", textAlign: "left", fontSize: "12px", borderBottom: "2px solid #ddd" },
  td: { padding: "12px", fontSize: "12px", borderBottom: "1px solid #eee" },
  btnPrimary: { background: "#7b003f", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer" },
  btnDel: { background: "#dc3545", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize: '11px' },
  // FIX: Menghapus duplikat properti color
  btnExcel: { background: "#157347", color: "white", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer" },
  btnLog: { background: "#333", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer" }
};