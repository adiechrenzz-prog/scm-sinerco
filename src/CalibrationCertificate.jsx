// src/CalibrationCertificate.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "./firebase";
import { ref, onValue, set, update, remove } from "firebase/database";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function CalibrationCertificate() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    instrumentName: "",
    certificateNumber: "",
    calibrationDate: "",
    validUntil: "",
  });

  // LOAD DATA
  useEffect(() => {
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

  // FORM CHANGE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ADD
  const addCertificate = () => {
    if (!form.instrumentName) return alert("Instrument wajib diisi");

    const id = Date.now();
    set(ref(database, "calibrationCertificates/" + id), form);
    resetForm();
  };

  // START EDIT
  const startEdit = (item) => {
    setEditId(item.id);
    setForm({
      instrumentName: item.instrumentName,
      certificateNumber: item.certificateNumber,
      calibrationDate: item.calibrationDate,
      validUntil: item.validUntil,
    });
  };

  // SAVE EDIT
  const saveEdit = () => {
    update(ref(database, "calibrationCertificates/" + editId), form);
    setEditId(null);
    resetForm();
  };

  // DELETE
  const deleteCert = (id) => {
    if (window.confirm("Hapus sertifikat ini?")) {
      remove(ref(database, "calibrationCertificates/" + id));
    }
  };

  const resetForm = () => {
    setForm({
      instrumentName: "",
      certificateNumber: "",
      calibrationDate: "",
      validUntil: "",
    });
  };

  // EXPORT EXCEL
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Calibration Certificate");
    XLSX.writeFile(wb, "Calibration_Certificate.xlsx");
  };

  // EXPORT PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Calibration Certificate", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["Instrument", "Certificate No", "Calibration Date", "Valid Until"]],
      body: data.map((d) => [
        d.instrumentName,
        d.certificateNumber,
        d.calibrationDate,
        d.validUntil,
      ]),
    });
    doc.save("Calibration_Certificate.pdf");
  };

  // LOGOUT
  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📄 Calibration Certificate</h2>

      {/* MENU */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => navigate("/dashboard")}>Dashboard</button>{" "}
        <button onClick={exportExcel} disabled={!data.length}>
          Export Excel
        </button>{" "}
        <button onClick={exportPDF} disabled={!data.length}>
          Export PDF
        </button>{" "}
        <button onClick={logout}>Logout</button>
      </div>

      {/* FORM */}
      <div style={{ marginBottom: 15 }}>
        <input
          name="instrumentName"
          placeholder="Instrument"
          value={form.instrumentName}
          onChange={handleChange}
        />{" "}
        <input
          name="certificateNumber"
          placeholder="Certificate No"
          value={form.certificateNumber}
          onChange={handleChange}
        />{" "}
        <input
          type="date"
          name="calibrationDate"
          value={form.calibrationDate}
          onChange={handleChange}
        />{" "}
        <input
          type="date"
          name="validUntil"
          value={form.validUntil}
          onChange={handleChange}
        />{" "}
        {editId ? (
          <button onClick={saveEdit}>💾 Update</button>
        ) : (
          <button onClick={addCertificate}>➕ Tambah</button>
        )}
      </div>

      {/* TABLE */}
      <table border="1" cellPadding="8" width="100%">
        <thead>
          <tr>
            <th>Instrument</th>
            <th>Certificate No</th>
            <th>Calibration Date</th>
            <th>Valid Until</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.id}>
              <td>{d.instrumentName}</td>
              <td>{d.certificateNumber}</td>
              <td>{d.calibrationDate}</td>
              <td>{d.validUntil}</td>
              <td>
                <button onClick={() => startEdit(d)}>✏ Edit</button>{" "}
                <button onClick={() => deleteCert(d.id)}>🗑 Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
