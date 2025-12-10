// src/InstrumentList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "./firebase";
import { ref, onValue, set, update, remove } from "firebase/database";

export default function InstrumentList() {
  const navigate = useNavigate();

  // ======================
  // STATE
  // ======================
  const [data, setData] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    id: "",
    name: "",
    serial: "",
    range: "",
    location: "",
    lastCal: "",
    nextCal: "",
  });

  // ======================
  // LOAD DATA FROM FIREBASE
  // ======================
  useEffect(() => {
    const r = ref(database, "instrumentList");
    return onValue(r, (snap) => {
      const val = snap.val() || {};
      setData(Object.values(val));
    });
  }, []);

  // ======================
  // HANDLER
  // ======================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      id: "",
      name: "",
      serial: "",
      range: "",
      location: "",
      lastCal: "",
      nextCal: "",
    });
    setEditMode(false);
  };

  // ======================
  // SAVE / UPDATE
  // ======================
  const saveData = () => {
    if (!form.id || !form.name) {
      alert("ID & Nama Instrument wajib diisi");
      return;
    }

    const payload = {
      ...form,
      status: "OK",
    };

    if (editMode) {
      update(ref(database, "instrumentList/" + form.id), payload);
    } else {
      set(ref(database, "instrumentList/" + form.id), payload);
    }

    resetForm();
  };

  // ======================
  // EDIT
  // ======================
  const editData = (item) => {
    setForm(item);
    setEditMode(true);
  };

  // ======================
  // DELETE
  // ======================
  const deleteData = (id) => {
    if (window.confirm("Hapus instrument ini?")) {
      remove(ref(database, "instrumentList/" + id));
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🔧 Instrument Master List</h2>

      {/* MENU */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <button onClick={() => navigate("/dashboard")}>
          ⬅️ Dashboard
        </button>

           {/* ✅ FIX: KE /instrument */}
        <button onClick={() => navigate("/Calibration-History")}>
          Calibration History
           </button>

            {/* ✅ FIX: KE /instrument */}
        <button onClick={() => navigate("/Calibration-Certificate")}>
          Calibration Certificate
           </button>

            {/* ✅ FIX: KE /instrument */}
        <button onClick={() => navigate("/Calibration-Reminder")}>
          Calibration Reminder
           </button>


        <button
          onClick={() => navigate("/calibration-schedule")}
          style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          📅 Calibration Schedule
        </button>
      </div>

      
        

      {/* FORM */}
      <fieldset style={{ marginBottom: 16 }}>
        <legend>
          {editMode ? "✏️ Edit Instrument" : "➕ Tambah Instrument"}
        </legend>

        <input
          name="id"
          placeholder="ID (INS-001)"
          value={form.id}
          onChange={handleChange}
          disabled={editMode}
        />
        <input
          name="name"
          placeholder="Nama Instrument"
          value={form.name}
          onChange={handleChange}
        />
        <input
          name="serial"
          placeholder="Serial Number"
          value={form.serial}
          onChange={handleChange}
        />
        <input
          name="range"
          placeholder="Range"
          value={form.range}
          onChange={handleChange}
        />
        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
        />
        <input
          type="date"
          name="lastCal"
          value={form.lastCal}
          onChange={handleChange}
        />
        <input
          type="date"
          name="nextCal"
          value={form.nextCal}
          onChange={handleChange}
        />

        <br />
        <button onClick={saveData}>
          {editMode ? "Update" : "Simpan"}
        </button>

        {editMode && (
          <button onClick={resetForm} style={{ marginLeft: 6 }}>
            Batal
          </button>
        )}
      </fieldset>

      {/* TABLE */}
      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>ID</th>
            <th>Instrument</th>
            <th>Serial</th>
            <th>Range</th>
            <th>Location</th>
            <th>Last Cal</th>
            <th>Next Cal</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan="9" align="center">
                Belum ada data
              </td>
            </tr>
          )}

          {data.map((i) => (
            <tr key={i.id}>
              <td>{i.id}</td>
              <td>{i.name}</td>
              <td>{i.serial}</td>
              <td>{i.range}</td>
              <td>{i.location}</td>
              <td>{i.lastCal}</td>
              <td>{i.nextCal}</td>
              <td
                style={{
                  color: "green",
                  fontWeight: "bold",
                }}
              >
                {i.status}
              </td>
              <td>
                <button onClick={() => editData(i)}>Edit</button>{" "}
                <button onClick={() => deleteData(i.id)}>
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 10, color: "#666" }}>
        ✅ Data tersimpan di Firebase Realtime Database
      </p>
    </div>
  );
}
