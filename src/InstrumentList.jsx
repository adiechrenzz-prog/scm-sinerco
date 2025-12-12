// src/InstrumentList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "./firebase";
import { ref, onValue, set, update, remove } from "firebase/database";
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

  // LOAD DATA
  useEffect(() => {
    const r = ref(database, "instrumentList");
    return onValue(r, (snap) => {
      const val = snap.val() || {};
      setData(Object.values(val));
    });
  }, []);

  // HANDLE INPUT
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({
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
    setEditMode(false);
  };

  // SAVE / UPDATE
  const saveData = () => {
    if (!form.id || !form.instrument) {
      alert("No Unit & Nama Instrument wajib diisi!");
      return;
    }

    const payload = { ...form };

    set(ref(database, "instrumentList/" + form.id), payload);

    resetForm();
  };

  // EDIT
  const editData = (item) => {
    setForm(item);
    setEditMode(true);
  };

  // DELETE
  const deleteData = (id) => {
    if (window.confirm("Hapus instrument ini?")) {
      remove(ref(database, "instrumentList/" + id));
    }
  };

  // FILTER
  const filtered = data.filter(
    (i) =>
      i.id.toLowerCase().includes(search.toLowerCase()) ||
      i.instrument.toLowerCase().includes(search.toLowerCase()) ||
      i.location.toLowerCase().includes(search.toLowerCase())
  );

  // =======================
  // IMPORT EXCEL
  // =======================
  const importExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const bytes = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(bytes, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      rows.forEach((row) => {
        if (!row.id) return;

        const payload = {
          id: row.id?.toString().trim(),
          instrument: row.instrument || "",
          serial: row.serial || "",
          range: row.range || "",
          merk: row.merk || "",
          location: row.location || "",
          pihakKalibrasi: row.pihakKalibrasi || "",
          lastCal: row.lastCal || "",
          nextCal: row.nextCal || "",
          certificate: row.certificate || "",
          status: row.status || "OK",
        };

        set(ref(database, "instrumentList/" + payload.id), payload);
      });

      alert("✔ Import Excel berhasil!");
      e.target.value = "";
    };

    reader.readAsArrayBuffer(file);
  };

  // EXPORT EXCEL
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Instrument List");
    XLSX.writeFile(wb, "Instrument_List.xlsx");
  };

  // EXPORT PDF
  const exportPDF = () => {
    const doc = new jsPDF("p", "pt", "a4");

    doc.text("Instrument Master List", 40, 40);

    const tableData = filtered.map((i) => [
      i.id,
      i.instrument,
      i.serial,
      i.range,
      i.merk,
      i.location,
      i.pihakKalibrasi,
      i.lastCal,
      i.nextCal,
      i.certificate,
      i.status,
    ]);

    doc.autoTable({
      startY: 60,
      head: [
        [
          "No Unit",
          "Instrument",
          "Serial",
          "Range",
          "Merk",
          "Location",
          "Pihak Kalibrasi",
          "Last Cal",
          "Next Cal",
          "Certificate",
          "Status",
        ],
      ],
      body: tableData,
      theme: "grid",
    });

    doc.save("Instrument_List.pdf");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🔧 Instrument Master List</h2>

      {/* MENU */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>
        <button onClick={() => navigate("/calibration-history")}>📘 Calibration History</button>
        <button onClick={() => navigate("/calibration-certificate")}>📄 Certificate</button>
        <button onClick={() => navigate("/calibration-reminder")}>⏰ Reminder</button>
        <button onClick={() => navigate("/calibration-schedule")}>📅 Schedule</button>

        <button onClick={exportExcel}>⬇ Excel</button>
        <button onClick={exportPDF}>⬇ PDF</button>

        {/* IMPORT EXCEL */}
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={importExcel}
          style={{ marginLeft: 10 }}
        />
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search No Unit / Instrument / Location"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "40%", marginBottom: 10 }}
      />

      {/* FORM */}
      <fieldset style={{ marginBottom: 16 }}>
        <legend>{editMode ? "✏ Edit Instrument" : "➕ Tambah Instrument"}</legend>

        <input name="id" placeholder="No Unit" value={form.id} onChange={handleChange} />
        <input name="instrument" placeholder="Instrument" value={form.instrument} onChange={handleChange} />
        <input name="serial" placeholder="Serial Number" value={form.serial} onChange={handleChange} />
        <input name="range" placeholder="Range" value={form.range} onChange={handleChange} />
        <input name="merk" placeholder="Merk" value={form.merk} onChange={handleChange} />
        <input name="location" placeholder="Location" value={form.location} onChange={handleChange} />
        <input name="pihakKalibrasi" placeholder="Pihak Kalibrasi" value={form.pihakKalibrasi} onChange={handleChange} />
        <input type="date" name="lastCal" value={form.lastCal} onChange={handleChange} />
        <input type="date" name="nextCal" value={form.nextCal} onChange={handleChange} />
        <input name="certificate" placeholder="Certificate" value={form.certificate} onChange={handleChange} />

        <br />
        <button onClick={saveData}>{editMode ? "Update" : "Simpan"}</button>
        {editMode && <button onClick={resetForm} style={{ marginLeft: 6 }}>Batal</button>}
      </fieldset>

      {/* TABLE */}
      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>No Unit</th>
            <th>Instrument</th>
            <th>Serial</th>
            <th>Range</th>
            <th>Merk</th>
            <th>Location</th>
            <th>Pihak Kalibrasi</th>
            <th>Last Cal</th>
            <th>Next Cal</th>
            <th>Certificate</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((i) => (
            <tr key={i.id}>
              <td>{i.id}</td>
              <td>{i.instrument}</td>
              <td>{i.serial}</td>
              <td>{i.range}</td>
              <td>{i.merk}</td>
              <td>{i.location}</td>
              <td>{i.pihakKalibrasi}</td>
              <td>{i.lastCal}</td>
              <td>{i.nextCal}</td>
              <td>{i.certificate}</td>
              <td style={{ fontWeight: "bold" }}>{i.status}</td>

              <td>
                <button onClick={() => editData(i)}>Edit</button>{" "}
                <button onClick={() => deleteData(i.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 10, color: "#666" }}>
        ✔ Data tersimpan di Firebase
      </p>
    </div>
  );
}
