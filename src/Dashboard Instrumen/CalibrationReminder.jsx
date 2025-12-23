import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { database, auth } from "../firebase";
import { ref, onValue } from "firebase/database";
import { signOut } from "firebase/auth";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function CalibrationReminder() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  // ========================= 1. LOAD DATA =========================
  useEffect(() => {
    const r = ref(database, "instrumentList");
    return onValue(r, (snap) => {
      const val = snap.val() || {};
      const arr = Object.keys(val).map((key) => ({
        id: key,
        ...val[key],
      }));
      setData(arr);
    });
  }, []);

  // ========================= 2. LOGIC STATUS =========================
  const getStatusInfo = (nextCal) => {
    if (!nextCal) return { label: "NO DATE", color: "#666" };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const next = new Date(nextCal);
    const diffTime = next - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: "OVERDUE", color: "#dc3545", days: diffDays };
    if (diffDays <= 30) return { label: "DUE SOON", color: "#fd7e14", days: diffDays };
    return { label: "OK", color: "#198754", days: diffDays };
  };

  // Filter Search
  const filteredData = data.filter(d => 
    d.instrument?.toLowerCase().includes(search.toLowerCase()) ||
    d.id?.toLowerCase().includes(search.toLowerCase())
  );

  // ========================= 3. EXPORT =========================
  const exportExcel = () => {
    const rows = filteredData.map((d) => {
      const status = getStatusInfo(d.nextCal);
      return {
        "No Unit": d.id,
        Instrument: d.instrument,
        "Last Cal": d.lastCal,
        "Next Due": d.nextCal,
        Status: status.label,
        "Remaining Days": status.days || 0
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reminder");
    XLSX.writeFile(wb, "Calibration_Reminder.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Calibration Deadline Reminder", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["No Unit", "Instrument", "Next Due", "Status"]],
      body: filteredData.map((d) => [
        d.id, 
        d.instrument, 
        d.nextCal, 
        getStatusInfo(d.nextCal).label
      ]),
    });
    doc.save("Calibration_Reminder.pdf");
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={{ color: "#7b003f", margin: 0 }}>⏰ Calibration Reminder</h2>
        <button style={styles.btnLog} onClick={() => { signOut(auth); navigate("/login"); }}>Logout</button>
      </div>

      {/* NAVIGASI LENGKAP - TOMBOL KE SEMUA MENU */}
      <div style={styles.fullNavBar}>
        <div style={styles.navGroup}>
          <span style={styles.navLabel}>CALIBRATION MENU</span>
          <div style={styles.btnRow}>
            <button style={styles.btnNav} onClick={() => navigate("/dashboard")}>🏠 Dashboard</button>
            <button style={styles.btnNav} onClick={() => navigate("/instrument-list")}>🛠 List Instrument</button>
            <button style={styles.btnNav} onClick={() => navigate("/calibration-history")}>📘 History</button>
            <button style={styles.btnNav} onClick={() => navigate("/calibration-schedule")}>📅 Schedule</button>
            <button style={{...styles.btnNav, background: "#7b003f", color: "#fff"}}>⏰ Reminder</button>
            <button style={styles.btnNav} onClick={() => navigate("/calibration-certificate")}>📄 Certificate</button>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div style={styles.toolbar}>
        <input 
          style={styles.inputSearch} 
          placeholder="🔍 Cari No Unit / Nama Alat..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
        <div style={{ display: 'flex', gap: 5 }}>
          <button style={styles.btnExcel} onClick={exportExcel}>Export Excel</button>
          <button style={styles.btnPDF} onClick={exportPDF}>Export PDF</button>
        </div>
      </div>

      {/* TABLE CARD */}
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr style={{ background: "#f2f2f2" }}>
              <th style={styles.th}>No Unit</th>
              <th style={styles.th}>Instrument Name</th>
              <th style={styles.th}>Last Calibration</th>
              <th style={styles.th}>Next Due Date</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr><td colSpan="5" style={{textAlign:'center', padding: 20}}>Tidak ada data.</td></tr>
            ) : (
              filteredData.map((d) => {
                const status = getStatusInfo(d.nextCal);
                return (
                  <tr key={d.id}>
                    <td style={styles.td}><b>{d.id}</b></td>
                    <td style={styles.td}>{d.instrument}</td>
                    <td style={styles.td}>{d.lastCal || "-"}</td>
                    <td style={styles.td}>{d.nextCal || "-"}</td>
                    <td style={styles.td}>
                      <span style={{
                        backgroundColor: status.color,
                        color: "#fff",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: "bold",
                        display: "inline-block",
                        minWidth: "80px",
                        textAlign: "center"
                      }}>
                        {status.label} {status.days !== undefined ? `(${status.days} d)` : ""}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
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
  card: { background: "#fff", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", marginBottom: 20, overflowX: "auto" },
  inputSearch: { flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ddd" },
  toolbar: { display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "15px", alignItems: "center" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px", textAlign: "left", fontSize: "12px", borderBottom: "2px solid #ddd" },
  td: { padding: "12px", fontSize: "12px", borderBottom: "1px solid #eee" },
  btnExcel: { background: "#157347", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "5px", cursor: "pointer", fontSize: "12px" },
  btnPDF: { background: "#d32f2f", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "5px", cursor: "pointer", fontSize: "12px" },
  btnLog: { background: "#333", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer" },
};