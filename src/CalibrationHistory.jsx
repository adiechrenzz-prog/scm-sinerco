// src/CalibrationHistory.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "./firebase";
import { ref, onValue, set, update, remove } from "firebase/database";

export default function CalibrationHistory() {
  const navigate = useNavigate();

  // ======================
  // STATE
  // ======================
  const [history, setHistory] = useState([]);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    instrument: "",
    serial: "",
    date: "",
    result: "",
    technician: "",
  });

  // ======================
  // LOAD HISTORY
  // ======================
  useEffect(() => {
    const r = ref(database, "calibrationHistory");
    return onValue(r, (snap) => {
      const val = snap.val() || {};
      const arr = Object.keys(val).map((id) => ({
        id,
        ...val[id],
      }));
      setHistory(arr);
    });
  }, []);

  // ======================
  // FORM HANDLER
  // ======================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setEditId(null);
    setForm({
      instrument: "",
      serial: "",
      date: "",
      result: "",
      technician: "",
    });
  };

  // ======================
  // SAVE / UPDATE
  // ======================
  const saveHistory = () => {
    if (
      !form.instrument ||
      !form.date ||
      !form.result ||
      !form.technician
    ) {
      alert("Lengkapi semua data history");
      return;
    }

    const payload = { ...form };

    if (editId) {
      update(ref(database, "calibrationHistory/" + editId), payload);
    } else {
      set(ref(database, "calibrationHistory/" + Date.now()), payload);
    }

    resetForm();
  };

  // ======================
  // EDIT
  // ======================
  const editHistory = (item) => {
    setEditId(item.id);
    setForm({
      instrument: item.instrument,
      serial: item.serial,
      date: item.date,
      result: item.result,
      technician: item.technician,
    });
  };

  // ======================
  // DELETE
  // ======================
  const deleteHistory = (id) => {
    if (window.confirm("Hapus history ini?")) {
      remove(ref(database, "calibrationHistory/" + id));
    }
  };

  // ======================
  // RENDER
  // ======================
  return (
    <div style={{ padding: 20 }}>
      <h2>📘 Calibration History</h2>

      <button onClick={() => navigate("/instrument-list")}>
        ⬅️ Back
      </button>

      {/* FORM */}
      <fieldset style={{ margin: "16px 0" }}>
        <legend>
          {editId
            ? "✏️ Edit History Kalibrasi"
            : "➕ Tambah History Kalibrasi"}
        </legend>

        <input
          name="instrument"
          placeholder="Nama Instrument"
          value={form.instrument}
          onChange={handleChange}
        />{" "}

        <input
          name="serial"
          placeholder="Serial Number"
          value={form.serial}
          onChange={handleChange}
        />{" "}

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
        />{" "}

        <input
          name="result"
          placeholder="Result (OK / FAIL)"
          value={form.result}
          onChange={handleChange}
        />{" "}

        <input
          name="technician"
          placeholder="Technician"
          value={form.technician}
          onChange={handleChange}
        />{" "}

        <button onClick={saveHistory}>
          {editId ? "Update" : "Simpan"}
        </button>

        {editId && (
          <button
            onClick={resetForm}
            style={{ marginLeft: 6 }}
          >
            Batal
          </button>
        )}
      </fieldset>

      {/* TABLE */}
      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Instrument</th>
            <th>Serial</th>
            <th>Date</th>
            <th>Result</th>
            <th>Technician</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {history.length === 0 && (
            <tr>
              <td colSpan="6" align="center">
                Belum ada history
              </td>
            </tr>
          )}

          {history.map((h) => (
            <tr key={h.id}>
              <td>{h.instrument}</td>
              <td>{h.serial}</td>
              <td>{h.date}</td>
              <td
                style={{
                  color:
                    h.result === "OK" ? "green" : "red",
                  fontWeight: "bold",
                }}
              >
                {h.result}
              </td>
              <td>{h.technician}</td>
              <td>
                <button onClick={() => editHistory(h)}>
                  Edit
                </button>{" "}
                <button onClick={() => deleteHistory(h.id)}>
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
