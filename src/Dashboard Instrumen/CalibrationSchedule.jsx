import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { database, auth } from "../firebase";
import { ref, onValue, set, update, remove } from "firebase/database";
import { signOut } from "firebase/auth";

export default function CalibrationSchedule() {
  const navigate = useNavigate();

  // ======================
  // STATE
  // ======================
  const [instrumentList, setInstrumentList] = useState([]);
  const [scheduleList, setScheduleList] = useState([]);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    instrumentId: "",
    instrumentName: "",
    serial: "",
    lastCal: "",
    interval: "",
    nextCal: "",
  });

  // ======================
  // LOAD DATA
  // ======================
  useEffect(() => {
    // Load Master Instrument
    const instRef = ref(database, "instrumentList");
    onValue(instRef, (snap) => {
      const val = snap.val() || {};
      const list = Object.keys(val).map(key => ({
        id: key,
        ...val[key]
      }));
      setInstrumentList(list);
    });

    // Load Schedule
    const schedRef = ref(database, "calibrationSchedule");
    onValue(schedRef, (snap) => {
      const val = snap.val() || {};
      const arr = Object.keys(val).map((id) => ({
        _id: id,
        ...val[id],
      }));
      setScheduleList(arr);
    });
  }, []);

  // ======================
  // HANDLERS
  // ======================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const newForm = { ...prev, [name]: value };
      if (name === "lastCal" || name === "interval") {
        newForm.nextCal = calculateNextCal(newForm.lastCal, newForm.interval);
      }
      return newForm;
    });
  };

  const selectInstrument = (e) => {
    const id = e.target.value;
    const ins = instrumentList.find((i) => i.id === id);
    if (!ins) return resetForm();

    setForm({
      instrumentId: ins.id,
      instrumentName: ins.instrument,
      serial: ins.serial || "",
      lastCal: ins.lastCal || "",
      interval: "",
      nextCal: "",
    });
  };

  const calculateNextCal = (lastCal, interval) => {
    if (!lastCal || !interval) return "";
    const d = new Date(lastCal);
    d.setMonth(d.getMonth() + Number(interval));
    return d.toISOString().split("T")[0];
  };

  const saveSchedule = () => {
    if (!form.instrumentId || !form.lastCal || !form.interval) {
      alert("Pilih Instrument, Isi Last Calibration, dan Interval!");
      return;
    }

    const payload = { ...form };

    if (editId) {
      update(ref(database, "calibrationSchedule/" + editId), payload)
        .then(() => alert("✔ Schedule Updated"));
    } else {
      set(ref(database, "calibrationSchedule/" + Date.now()), payload)
        .then(() => alert("✔ Schedule Saved"));
    }
    resetForm();
  };

  const editSchedule = (item) => {
    setEditId(item._id);
    setForm({
      instrumentId: item.instrumentId,
      instrumentName: item.instrumentName,
      serial: item.serial,
      lastCal: item.lastCal,
      interval: item.interval,
      nextCal: item.nextCal,
    });
  };

  const deleteSchedule = (id) => {
    if (window.confirm("Hapus schedule ini?")) {
      remove(ref(database, "calibrationSchedule/" + id));
    }
  };

  const resetForm = () => {
    setEditId(null);
    setForm({
      instrumentId: "",
      instrumentName: "",
      serial: "",
      lastCal: "",
      interval: "",
      nextCal: "",
    });
  };

  const getStatus = (nextCal) => {
    if (!nextCal) return "-";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(nextCal) < today ? "OVERDUE" : "OK";
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={{ color: "#7b003f", margin: 0 }}>📅 Calibration Schedule</h2>
        <button style={styles.btnLog} onClick={() => { signOut(auth); navigate("/login"); }}>Logout</button>
      </div>

      {/* NAVIGASI LENGKAP */}
      <div style={styles.fullNavBar}>
        <div style={styles.navGroup}>
          <span style={styles.navLabel}>CALIBRATION MENU</span>
          <div style={styles.btnRow}>
            <button style={styles.btnNav} onClick={() => navigate("/dashboard")}>🏠 Dashboard</button>
            <button style={styles.btnNav} onClick={() => navigate("/instrument-list")}>🛠 List Instrument</button>
            <button style={styles.btnNav} onClick={() => navigate("/calibration-history")}>📘 History</button>
            <button style={{...styles.btnNav, background: "#7b003f", color: "#fff"}}>📅 Schedule</button>
            <button style={styles.btnNav} onClick={() => navigate("/calibration-reminder")}>⏰ Reminder</button>
            <button style={styles.btnNav} onClick={() => navigate("/calibration-certificate")}>📄 Certificate</button>
          </div>
        </div>
      </div>

      {/* FORM CARD */}
      <div style={styles.card}>
        <h4 style={{ marginTop: 0 }}>{editId ? "✏ Edit Schedule" : "➕ Set Calibration Interval"}</h4>
        <div style={styles.formGrid}>
          <div style={styles.inputBox}>
            <label style={styles.label}>Pilih Instrument:</label>
            <select value={form.instrumentId} onChange={selectInstrument} style={styles.input} disabled={editId}>
              <option value="">-- Pilih --</option>
              {instrumentList.map((i) => (
                <option key={i.id} value={i.id}>{i.id} - {i.instrument}</option>
              ))}
            </select>
          </div>

          <div style={styles.inputBox}>
            <label style={styles.label}>Last Calibration:</label>
            <input type="date" name="lastCal" value={form.lastCal} onChange={handleChange} style={styles.input} />
          </div>

          <div style={styles.inputBox}>
            <label style={styles.label}>Interval (Bulan):</label>
            <input type="number" name="interval" placeholder="Contoh: 12" value={form.interval} onChange={handleChange} style={styles.input} />
          </div>

          <div style={styles.inputBox}>
            <label style={styles.label}>Next Due Date (Auto):</label>
            <input value={form.nextCal} readOnly style={{...styles.input, background: '#eee'}} />
          </div>
        </div>
        <div style={{ marginTop: 15 }}>
          <button style={styles.btnPrimary} onClick={saveSchedule}>
            {editId ? "Update Schedule" : "Save Schedule"}
          </button>
          {editId && <button style={styles.btnSec} onClick={resetForm}>Batal</button>}
        </div>
      </div>

      {/* TABLE */}
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr style={{ background: "#f2f2f2" }}>
              <th style={styles.th}>Instrument</th>
              <th style={styles.th}>Serial</th>
              <th style={styles.th}>Last Cal</th>
              <th style={styles.th}>Interval</th>
              <th style={styles.th}>Next Due</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {scheduleList.length === 0 ? (
              <tr><td colSpan="7" style={{textAlign:'center', padding:20}}>Belum ada schedule.</td></tr>
            ) : (
              scheduleList.map((s) => (
                <tr key={s._id}>
                  <td style={styles.td}>{s.instrumentName}</td>
                  <td style={styles.td}>{s.serial}</td>
                  <td style={styles.td}>{s.lastCal}</td>
                  <td style={styles.td}>{s.interval} Mo</td>
                  <td style={styles.td}><b>{s.nextCal}</b></td>
                  <td style={{
                    ...styles.td, 
                    fontWeight: 'bold', 
                    color: getStatus(s.nextCal) === "OVERDUE" ? "red" : "green"
                  }}>
                    {getStatus(s.nextCal)}
                  </td>
                  <td style={styles.td}>
                    <button style={styles.btnEdit} onClick={() => editSchedule(s)}>Edit</button>
                    <button style={styles.btnDel} onClick={() => deleteSchedule(s._id)}>Hapus</button>
                  </td>
                </tr>
              ))
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
  card: { background: "#fff", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", marginBottom: 20, overflowX: 'auto' },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "15px" },
  inputBox: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '11px', fontWeight: 'bold' },
  input: { padding: "8px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "13px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px", textAlign: "left", fontSize: "12px", borderBottom: "2px solid #ddd" },
  td: { padding: "12px", fontSize: "12px", borderBottom: "1px solid #eee" },
  btnPrimary: { background: "#7b003f", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer" },
  btnSec: { background: "#666", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", marginLeft: 5 },
  btnEdit: { background: "#007bff", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", marginRight: 5, fontSize: '11px' },
  btnDel: { background: "#dc3545", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize: '11px' },
  btnLog: { background: "#333", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer" }
};