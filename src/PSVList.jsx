// src/PSVList.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { database, auth } from "./firebase";
import { ref, onValue, set, remove } from "firebase/database";
import { signOut } from "firebase/auth";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function PSVList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);
  const oldIdRef = useRef("");

  const [form, setForm] = useState({
    id: "",
    alat: "",
    merk: "",
    sn: "",
    location: "",
    setPressure: "",
    pihak: "",
    lastCoi: "",
    nextCoi: "",
    certificate: "",
    status: "OK",
  });

  // ============================ 1. LOAD DATA ============================
  useEffect(() => {
    const r = ref(database, "psvList");
    return onValue(r, (snap) => {
      const val = snap.val() || {};
      const arr = Object.keys(val).map(key => ({
        ...val[key],
        id: key 
      }));
      setData(arr);
    });
  }, []);

  // ============================ 2. HANDLERS ============================
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({
      id: "", alat: "", merk: "", sn: "", location: "",
      setPressure: "", pihak: "", lastCoi: "", nextCoi: "",
      certificate: "", status: "OK",
    });
    setEditMode(false);
    oldIdRef.current = "";
  };

  const saveData = () => {
    if (!form.id || !form.alat) {
      alert("⚠ No. Unit & Nama Alat wajib diisi!");
      return;
    }
    const payload = { ...form };
    const oldId = oldIdRef.current;
    if (editMode && oldId && form.id !== oldId) {
      remove(ref(database, "psvList/" + oldId));
    }
    set(ref(database, "psvList/" + form.id), payload)
      .then(() => {
        alert("✔ Data Berhasil Disimpan");
        resetForm();
      })
      .catch((err) => alert("Gagal: " + err.message));
  };

  const editData = (item) => {
    oldIdRef.current = item.id;
    setForm({ ...item });
    setEditMode(true);
  };

  const deleteData = (id) => {
    if (window.confirm(`Hapus data PSV unit ${id}?`)) {
      remove(ref(database, "psvList/" + id));
    }
  };

  const filtered = data.filter((i) =>
    String(i.id).toLowerCase().includes(search.toLowerCase()) ||
    String(i.location).toLowerCase().includes(search.toLowerCase()) ||
    String(i.sn).toLowerCase().includes(search.toLowerCase())
  );

  // ============================ 3. EXPORTS ============================
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PSV_Asset_Register");
    XLSX.writeFile(wb, "PSV_Asset_Register.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    doc.text("PSV Asset Register Report", 14, 15);
    const tableColumn = ["No Unit", "Alat", "SN", "Location", "Set Press", "Next COI", "Status"];
    const tableRows = filtered.map(i => [
      i.id, i.alat, i.sn, i.location, i.setPressure, i.nextCoi, i.status
    ]);
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
    doc.save("PSV_Asset_Register.pdf");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ color: "#7b003f", margin: 0 }}>🛢 PSV Asset Register</h2>
        <button style={styles.btnLog} onClick={() => { signOut(auth); navigate("/login"); }}>Logout</button>
      </div>

      {/* NAVIGASI LENGKAP - SEMUA TOMBOL DITAMBAHKAN DISINI */}
      <div style={styles.fullNavBar}>
        <div style={styles.navGroup}>
          <span style={styles.navLabel}>PSV MANAGEMENT MENU</span>
          <div style={styles.btnRow}>
            <button style={styles.btnNav} onClick={() => navigate("/dashboard")}>🏠 Dashboard</button>
            <button style={{...styles.btnNav, background: "#7b003f", color: "#fff"}}>📘 Asset List</button>
            <button style={styles.btnNav} onClick={() => navigate("/psv-serial")}>🔢 Serial Number</button>
            <button style={styles.btnNav} onClick={() => navigate("/psv-location")}>📍 Location</button>
            <button style={styles.btnNav} onClick={() => navigate("/psv-set-pressure")}>⚙️ Set Pressure</button>
            <button style={styles.btnNav} onClick={() => navigate("/psv-certificate")}>📄 Certificate</button>
            <button style={styles.btnNav} onClick={() => navigate("/psv-status")}>📊 Status</button>
          </div>
        </div>
      </div>

      {/* FORM CARD */}
      <div style={styles.card}>
        <h4 style={{marginTop:0}}>{editMode ? "✏ Edit PSV Data" : "➕ Add New PSV"}</h4>
        <div style={styles.formGrid}>
          <div style={styles.inputBox}><label style={styles.label}>No. Unit:</label>
            <input name="id" value={form.id} onChange={handleChange} style={styles.input} /></div>
          <div style={styles.inputBox}><label style={styles.label}>Nama Alat:</label>
            <input name="alat" value={form.alat} onChange={handleChange} style={styles.input} /></div>
          <div style={styles.inputBox}><label style={styles.label}>Merk:</label>
            <input name="merk" value={form.merk} onChange={handleChange} style={styles.input} /></div>
          <div style={styles.inputBox}><label style={styles.label}>SN Number:</label>
            <input name="sn" value={form.sn} onChange={handleChange} style={styles.input} /></div>
          <div style={styles.inputBox}><label style={styles.label}>Location:</label>
            <input name="location" value={form.location} onChange={handleChange} style={styles.input} /></div>
          <div style={styles.inputBox}><label style={styles.label}>Set Pressure:</label>
            <input name="setPressure" value={form.setPressure} onChange={handleChange} style={styles.input} /></div>
          <div style={styles.inputBox}><label style={styles.label}>Last COI:</label>
            <input type="date" name="lastCoi" value={form.lastCoi} onChange={handleChange} style={styles.input} /></div>
          <div style={styles.inputBox}><label style={styles.label}>Next COI:</label>
            <input type="date" name="nextCoi" value={form.nextCoi} onChange={handleChange} style={styles.input} /></div>
          <div style={styles.inputBox}><label style={styles.label}>Status:</label>
            <select name="status" value={form.status} onChange={handleChange} style={styles.input}>
              <option value="OK">OK</option>
              <option value="Due">Due</option>
              <option value="Overdue">Overdue</option>
            </select></div>
        </div>
        <div style={{marginTop: 15}}>
          <button style={styles.btnPrimary} onClick={saveData}>{editMode ? "Update Data" : "Save Asset"}</button>
          {editMode && <button style={styles.btnCancel} onClick={resetForm}>Cancel</button>}
        </div>
      </div>

      {/* TOOLBAR */}
      <div style={styles.toolbar}>
        <input 
          placeholder="🔍 Search No Unit / Location / SN..." 
          value={search} onChange={(e) => setSearch(e.target.value)} 
          style={styles.inputSearch} 
        />
        <div style={{display:'flex', gap: 5}}>
          <button style={styles.btnExcel} onClick={exportExcel}>Excel</button>
          <button style={styles.btnPDF} onClick={exportPDF}>PDF</button>
        </div>
      </div>

      {/* TABLE CARD */}
      <div style={styles.card}>
        <div style={{overflowX: 'auto'}}>
          <table style={styles.table}>
            <thead>
              <tr style={{ background: "#f2f2f2" }}>
                <th style={styles.th}>No Unit</th>
                <th style={styles.th}>Alat</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Set Press</th>
                <th style={styles.th}>Next COI</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id}>
                  <td style={styles.td}><b>{i.id}</b></td>
                  <td style={styles.td}>{i.alat}</td>
                  <td style={styles.td}>{i.location}</td>
                  <td style={styles.td}>{i.setPressure}</td>
                  <td style={styles.td}>{i.nextCoi}</td>
                  <td style={{...styles.td, fontWeight:'bold', color: i.status === 'OK' ? 'green' : 'red'}}>{i.status}</td>
                  <td style={styles.td}>
                    <button style={styles.btnEdit} onClick={() => editData(i)}>Edit</button>
                    <button style={styles.btnDel} onClick={() => deleteData(i.id)}>Del</button>
                  </td>
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
  fullNavBar: { background: "#fff", padding: "15px", borderRadius: "10px", marginBottom: "20px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" },
  navGroup: { display: "flex", flexDirection: "column", gap: "5px", borderLeft: "3px solid #7b003f", paddingLeft: "12px" },
  navLabel: { fontSize: "10px", fontWeight: "bold", color: "#7b003f" },
  btnRow: { display: "flex", gap: "5px", flexWrap: "wrap" },
  btnNav: { padding: "7px 12px", cursor: "pointer", background: "#f8f9fa", border: "1px solid #ddd", borderRadius: "4px", fontSize: "12px" },
  card: { background: "#fff", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", marginBottom: 20 },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "15px" },
  inputBox: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '11px', fontWeight: 'bold' },
  input: { padding: "8px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "13px" },
  inputSearch: { flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ddd" },
  toolbar: { display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "15px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px", textAlign: "left", fontSize: "12px", borderBottom: "2px solid #ddd" },
  td: { padding: "12px", fontSize: "12px", borderBottom: "1px solid #eee" },
  btnPrimary: { background: "#7b003f", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer" },
  btnCancel: { background: "#666", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", marginLeft: 5 },
  btnEdit: { background: "#007bff", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", marginRight: 5, fontSize: '11px' },
  btnDel: { background: "#dc3545", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize: '11px' },
  btnExcel: { background: "#157347", color: "#fff", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer", fontSize: '12px' },
  btnPDF: { background: "#d32f2f", color: "#fff", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer", fontSize: '12px' },
  btnLog: { background: "#333", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer" }
};