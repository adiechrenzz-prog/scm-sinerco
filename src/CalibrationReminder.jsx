// src/CalibrationReminder.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "./firebase";
import { ref, onValue } from "firebase/database";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function CalibrationReminder() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  // ======================
  // LOAD DATA DARI calibrationSchedule
  // ======================
  useEffect(() => {
    const r = ref(database, "calibrationSchedule");
    return onValue(r, (snap) => {
      const val = snap.val() || {};
      const arr = Object.keys(val).map((id) => ({
        id,
        ...val[id],
      }));
      setData(arr);
    });
  }, []);

  // ======================
  // STATUS REMINDER
  // ======================
  const getStatus = (nextCal) => {
    if (!nextCal) return "-";
    const today = new Date();
    const next = new Date(nextCal);

    if (next < today) return "OVERDUE";

    // opsional: warning kalau kurang dari 30 hari
    const diffDays = Math.ceil(
      (next - today) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 30) return "DUE SOON";

    return "OK";
  };

  // ======================
  // EXPORT EXCEL
  // ======================
  const exportExcel = () => {
    if (!data.length) return;

    const rows = data.map((d) => ({
      Instrument: d.name,
      Serial: d.serial,
      "Last Calibration": d.lastCal,
      "Next Due": d.nextCal,
      Status: getStatus(d.nextCal),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Calibration Reminder");
    XLSX.writeFile(wb, "Calibration_Reminder.xlsx");
  };

  // ======================
  // EXPORT PDF
  // ======================
  const exportPDF = () => {
    if (!data.length) return;

    const doc = new jsPDF();
    doc.text("Calibration Reminder", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [["Instrument", "Serial", "Last Cal", "Next Due", "Status"]],
      body: data.map((d) => [
        d.name,
        d.serial,
        d.lastCal,
        d.nextCal,
        getStatus(d.nextCal),
      ]),
    });

    doc.save("Calibration_Reminder.pdf");
  };

  // ======================
  // LOGOUT
  // ======================
  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>⏰ Calibration Reminder</h2>

      {/* MENU */}
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => navigate("/dashboard")}>Dashboard</button>{" "}
        <button onClick={exportExcel} disabled={!data.length}>
          Export Excel
        </button>{" "}
        <button onClick={exportPDF} disabled={!data.length}>
          Export PDF
        </button>{" "}
        <button onClick={logout}>Logout</button>
      </div>

      {/* TABEL REMINDER */}
      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Instrument</th>
            <th>Last Calibration</th>
            <th>Next Due</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan="4" align="center">
                Tidak ada data reminder kalibrasi.
              </td>
            </tr>
          )}

          {data.map((d) => (
            <tr key={d.id}>
              <td>{d.name}</td>
              <td>{d.lastCal}</td>
              <td>{d.nextCal}</td>
              <td
                style={{
                  color:
                    getStatus(d.nextCal) === "OVERDUE"
                      ? "red"
                      : getStatus(d.nextCal) === "DUE SOON"
                      ? "orange"
                      : "green",
                  fontWeight: "bold",
                }}
              >
                {getStatus(d.nextCal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
