// src/PSVList.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "./firebase";
import { ref, onValue, set, update, remove } from "firebase/database";
import * as XLSX from "xlsx";

export default function PSVList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  const [search, setSearch] = useState("");

  const [editMode, setEditMode] = useState(false);

  // Untuk simpan ID lama sebelum diedit
  const oldIdRef = useRef("");

  // ============================
  // FORM FIELD
  // ============================
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

  // LOAD DATA
  useEffect(() => {
    const r = ref(database, "psvList");
    return onValue(r, (snap) => {
      const val = snap.val() || {};
      setData(Object.values(val));
    });
  }, []);

  // ON CHANGE
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // RESET
  const resetForm = () => {
    setForm({
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

    setEditMode(false);
    oldIdRef.current = "";
  };

  // ============================
  // SAVE (FIX NO UNIT BISA EDIT)
  // ============================
  const saveData = () => {
    if (!form.id || !form.alat) {
      alert("⚠ No. Unit & Nama Alat wajib diisi!");
      return;
    }

    const payload = { ...form };

    // Jika sedang edit
    if (editMode) {
      const oldId = oldIdRef.current;

      // Jika ID diganti → hapus yang lama dulu
      if (oldId && form.id !== oldId) {
        remove(ref(database, "psvList/" + oldId));
      }

      // Simpan yang baru
      set(ref(database, "psvList/" + form.id), payload);
    } else {
      // Simpan baru
      set(ref(database, "psvList/" + form.id), payload);
    }

    resetForm();
  };

  // ============================
  // EDIT (simpan ID lama)
  // ============================
  const editData = (item) => {
    oldIdRef.current = item.id; // simpan ID lama

    setForm({
      id: item.id,
      alat: item.alat,
      merk: item.merk,
      sn: item.sn,
      location: item.location,
      setPressure: item.setPressure,
      pihak: item.pihak,
      lastCoi: item.lastCoi,
      nextCoi: item.nextCoi,
      certificate: item.certificate,
      status: item.status,
    });

    setEditMode(true);
  };

  // DELETE
  const deleteData = (id) => {
    if (window.confirm("Hapus data PSV ini?")) {
      remove(ref(database, "psvList/" + id));
    }
  };

  // ============================
  // FILTER SEARCH
  // ============================
  const filtered = data.filter(
    (i) =>
      i.id.toLowerCase().includes(search.toLowerCase()) ||
      i.location.toLowerCase().includes(search.toLowerCase()) ||
      i.sn.toLowerCase().includes(search.toLowerCase())
  );

  // ============================
  // EXPORT EXCEL
  // ============================
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PSVList");
    XLSX.writeFile(wb, "psv_list.xlsx");
  };

  // ============================
  // EXPORT PDF (simple)
  // ============================
  const exportPDF = () => {
    const rows = data
      .map(
        (i) =>
          `${i.id} | ${i.alat} | ${i.merk} | ${i.sn} | ${i.location} | ${i.setPressure} | ${i.pihak} | ${i.lastCoi} | ${i.nextCoi} | ${i.certificate} | ${i.status}`
      )
      .join("\n");

    const blob = new Blob([rows], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "psv_list.pdf";
    a.click();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🛢 PSV Asset Register</h2>

      {/* NAVIGATION */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>

        <button onClick={() => navigate("/psv-serial")}>🔢 PSV Serial Number</button>
        <button onClick={() => navigate("/psv-location")}>📍 PSV Location</button>
        <button onClick={() => navigate("/psv-set-pressure")}>⚙ PSV Set Pressure</button>
        <button onClick={() => navigate("/psv-certificate")}>📄 PSV Certificate</button>
        <button onClick={() => navigate("/psv-status")}>📊 PSV Status</button>

        <button onClick={exportExcel}>⬇ Export Excel</button>
        <button onClick={exportPDF}>🖨 Export PDF</button>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search No Unit / Location / SN Number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "40%", marginBottom: 12 }}
      />

      {/* FORM */}
      <fieldset>
        <legend>{editMode ? "✏ Edit PSV" : "➕ Tambah PSV"}</legend>

        <input
          name="id"
          placeholder="No. Unit"
          value={form.id}
          onChange={handleChange}
        />

        <input name="alat" placeholder="Nama Alat" value={form.alat} onChange={handleChange} />
        <input name="merk" placeholder="Merk" value={form.merk} onChange={handleChange} />
        <input name="sn" placeholder="SN Number" value={form.sn} onChange={handleChange} />
        <input name="location" placeholder="Location" value={form.location} onChange={handleChange} />
        <input name="setPressure" placeholder="Set Pressure" value={form.setPressure} onChange={handleChange} />
        <input name="pihak" placeholder="Pihak COI / POP Test" value={form.pihak} onChange={handleChange} />

        <input type="date" name="lastCoi" value={form.lastCoi} onChange={handleChange} />
        <input type="date" name="nextCoi" value={form.nextCoi} onChange={handleChange} />

        <input name="certificate" placeholder="Certificate No" value={form.certificate} onChange={handleChange} />

        <select name="status" value={form.status} onChange={handleChange}>
          <option value="OK">OK</option>
          <option value="Due">Due</option>
          <option value="Overdue">Overdue</option>
        </select>

        <br />

        <button onClick={saveData}>{editMode ? "Update" : "Simpan"}</button>
        {editMode && <button onClick={resetForm}>Batal</button>}
      </fieldset>

      {/* TABLE */}
      <table border="1" width="100%" cellPadding="6" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>No Unit</th>
            <th>Alat</th>
            <th>Merk</th>
            <th>SN</th>
            <th>Location</th>
            <th>Set Pressure</th>
            <th>Pihak COI/POP</th>
            <th>Last COI</th>
            <th>Next COI</th>
            <th>Certificate</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((i) => (
            <tr key={i.id}>
              <td>{i.id}</td>
              <td>{i.alat}</td>
              <td>{i.merk}</td>
              <td>{i.sn}</td>
              <td>{i.location}</td>
              <td>{i.setPressure}</td>
              <td>{i.pihak}</td>
              <td>{i.lastCoi}</td>
              <td>{i.nextCoi}</td>
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
        ✔ Data tersimpan ke Firebase Realtime Database
      </p>
    </div>
  );
}
