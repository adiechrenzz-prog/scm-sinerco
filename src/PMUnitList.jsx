// src/PMUnitList.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "./firebase";
import { ref, onValue, set, update, remove } from "firebase/database";
import * as XLSX from "xlsx";

export default function PMUnitList() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);

  // simpan id lama kalau user ubah id saat edit (opsional)
  const oldIdRef = useRef("");

  const [form, setForm] = useState({
    id: "",
    nama: "",
    merk: "",
    tahun: "",
    lokasi: "",
    interval: "",
    pic: "",
    status: "OK",
    ket: "",
  });

  // ========== load data ==========
  useEffect(() => {
    const r = ref(database, "pmUnits");
    return onValue(r, (snap) => {
      const val = snap.val() || {};
      // pastikan semua entry punya field default agar aman
      const arr = Object.values(val).map((i) => ({
        id: i.id || "",
        nama: i.nama || "",
        merk: i.merk || "",
        tahun: i.tahun || "",
        lokasi: i.lokasi || "",
        interval: i.interval || "",
        pic: i.pic || "",
        status: i.status || "OK",
        ket: i.ket || "",
      }));
      setData(arr);
    });
  }, []);

  // ========== handlers ==========
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({
      id: "",
      nama: "",
      merk: "",
      tahun: "",
      lokasi: "",
      interval: "",
      pic: "",
      status: "OK",
      ket: "",
    });
    setEditMode(false);
    oldIdRef.current = "";
  };

  // ========== save (support edit id change) ==========
  const saveData = () => {
    if (!form.id || !form.nama) {
      alert("No. Unit & Nama Unit wajib diisi");
      return;
    }

    const payload = { ...form };

    if (editMode) {
      const oldId = oldIdRef.current;
      // jika id berubah -> hapus data lama
      if (oldId && oldId !== form.id) {
        remove(ref(database, "pmUnits/" + oldId));
      }
      set(ref(database, "pmUnits/" + form.id), payload);
    } else {
      set(ref(database, "pmUnits/" + form.id), payload);
    }

    resetForm();
  };

  const editData = (item) => {
    oldIdRef.current = item.id || "";
    setForm({
      id: item.id || "",
      nama: item.nama || "",
      merk: item.merk || "",
      tahun: item.tahun || "",
      lokasi: item.lokasi || "",
      interval: item.interval || "",
      pic: item.pic || "",
      status: item.status || "OK",
      ket: item.ket || "",
    });
    setEditMode(true);
  };

  const deleteData = (id) => {
    if (window.confirm("Hapus unit ini?")) {
      remove(ref(database, "pmUnits/" + id));
    }
  };

  // ========== filter/search (safe) ==========
  const s = search.toLowerCase();
  const filtered = data.filter(
    (d) =>
      (d.id || "").toLowerCase().includes(s) ||
      (d.nama || "").toLowerCase().includes(s) ||
      (d.lokasi || "").toLowerCase().includes(s)
  );

  // ========== export excel ==========
  const exportExcel = () => {
    const rows = filtered.map((i) => ({
      "No Unit": i.id || "",
      "Nama Unit": i.nama || "",
      Merk: i.merk || "",
      Tahun: i.tahun || "",
      Lokasi: i.lokasi || "",
      "Interval PM": i.interval || "",
      PIC: i.pic || "",
      Status: i.status || "",
      Keterangan: i.ket || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PM Units");
    XLSX.writeFile(wb, "pm_units.xlsx");
  };

  // ========== export pdf (simple) ==========
  const exportPDF = () => {
    const rows = filtered
      .map(
        (i) =>
          `${i.id} | ${i.nama} | ${i.merk} | ${i.tahun} | ${i.lokasi} | ${i.interval} | ${i.pic} | ${i.status} | ${i.ket}`
      )
      .join("\n");
    const blob = new Blob([rows], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pm_units.txt"; // plain text; bisa ganti .pdf di server-side printing
    a.click();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🛠️ PM Unit Master</h2>

      {/* NAV */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>

        <button onClick={() => navigate("/pm-schedule")}>📅 PMSchedule</button>
        <button onClick={() => navigate("/pm-history")}>📚 PMHistory</button>
        <button onClick={() => navigate("/pm-checklist")}>✅ PMChecklist</button>
        <button onClick={() => navigate("/pm-reminder")}>⏰ PMReminder</button>

        <button onClick={exportExcel}>⬇ Export Excel</button>
        <button onClick={exportPDF}>📄 Export PDF</button>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Cari No.Unit / Nama / Lokasi"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "40%", marginBottom: 12 }}
      />

      {/* FORM */}
      <fieldset style={{ marginBottom: 12 }}>
        <legend>{editMode ? "✏ Edit PM Unit" : "➕ Tambah PM Unit"}</legend>

        <input
          name="id"
          placeholder="No. Unit (PM-001)"
          value={form.id}
          onChange={handleChange}
        />

        <input name="nama" placeholder="Nama Unit / Alat" value={form.nama} onChange={handleChange} />

        <input name="merk" placeholder="Merk" value={form.merk} onChange={handleChange} />

        <input name="tahun" placeholder="Tahun" value={form.tahun} onChange={handleChange} />

        <input name="lokasi" placeholder="Lokasi" value={form.lokasi} onChange={handleChange} />

        <input name="interval" placeholder="Interval PM (e.g. 1 month / 3 months)" value={form.interval} onChange={handleChange} />

        <input name="pic" placeholder="PIC" value={form.pic} onChange={handleChange} />

        <select name="status" value={form.status} onChange={handleChange}>
          <option value="OK">OK</option>
          <option value="Due">Due</option>
          <option value="Overdue">Overdue</option>
        </select>

        <br />

        <textarea name="ket" placeholder="Keterangan" value={form.ket} onChange={handleChange} style={{ width: "100%", marginTop: 8 }} />

        <div style={{ marginTop: 8 }}>
          <button onClick={saveData}>{editMode ? "Update" : "Simpan"}</button>
          {editMode && <button onClick={resetForm} style={{ marginLeft: 8 }}>Batal</button>}
        </div>
      </fieldset>

      {/* TABLE */}
      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>No. Unit</th>
            <th>Nama Unit</th>
            <th>Merk</th>
            <th>Tahun</th>
            <th>Lokasi</th>
            <th>Interval</th>
            <th>PIC</th>
            <th>Status</th>
            <th>Keterangan</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan="10" align="center">Belum ada data</td>
            </tr>
          )}

          {filtered.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.nama}</td>
              <td>{u.merk}</td>
              <td>{u.tahun}</td>
              <td>{u.lokasi}</td>
              <td>{u.interval}</td>
              <td>{u.pic}</td>
              <td style={{ fontWeight: "bold" }}>{u.status}</td>
              <td>{u.ket}</td>

              <td>
                <button onClick={() => editData(u)}>Edit</button>{" "}
                <button onClick={() => deleteData(u.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
