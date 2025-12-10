// src/CalibrationSchedule.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "./firebase";
import { ref, onValue, set, update, remove } from "firebase/database";

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
    name: "",
    serial: "",
    lastCal: "",
    interval: "",
    nextCal: "",
  });

  // ======================
  // LOAD INSTRUMENT LIST ✅ (PATH & FIELD SESUAI)
  // ======================
  useEffect(() => {
    const r = ref(database, "instrumentList");
    return onValue(r, (snap) => {
      const val = snap.val() || {};
      setInstrumentList(Object.values(val));
    });
  }, []);

  // ======================
  // LOAD CALIBRATION SCHEDULE
  // ======================
  useEffect(() => {
    const r = ref(database, "calibrationSchedule");
    return onValue(r, (snap) => {
      const val = snap.val() || {};
      const arr = Object.keys(val).map((id) => ({
        _id: id,
        ...val[id],
      }));
      setScheduleList(arr);
    });
  }, []);

  // ======================
  // HANDLE FORM
  // ======================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ======================
  // PILIH INSTRUMENT ✅
  // ======================
  const selectInstrument = (e) => {
    const id = e.target.value;
    const ins = instrumentList.find((i) => i.id === id);
    if (!ins) return;

    setForm({
      instrumentId: ins.id,
      name: ins.name,
      serial: ins.serial,
      lastCal: ins.lastCal || "",
      interval: "",
      nextCal: "",
    });
  };

  // ======================
  // HITUNG NEXT CAL ✅
  // ======================
  const calculateNextCal = (lastCal, interval) => {
    if (!lastCal || !interval) return "";
    const d = new Date(lastCal);
    d.setMonth(d.getMonth() + Number(interval));
    return d.toISOString().split("T")[0];
  };

  // ======================
  // SAVE / UPDATE
  // ======================
  const saveSchedule = () => {
    if (!form.instrumentId || !form.lastCal || !form.interval) {
      alert("Instrument, Last Calibration, dan Interval wajib diisi");
      return;
    }

    const payload = {
      instrumentId: form.instrumentId,
      name: form.name,
      serial: form.serial,
      lastCal: form.lastCal,
      interval: form.interval,
      nextCal: calculateNextCal(form.lastCal, form.interval),
    };

    if (editId) {
      update(ref(database, "calibrationSchedule/" + editId), payload);
    } else {
      set(
        ref(database, "calibrationSchedule/" + Date.now()),
        payload
      );
    }

    resetForm();
  };

  // ======================
  // EDIT
  // ======================
  const editSchedule = (row) => {
    setEditId(row._id);
    setForm(row);
  };

  // ======================
  // DELETE
  // ======================
  const deleteSchedule = (id) => {
    if (window.confirm("Hapus schedule ini?")) {
      remove(ref(database, "calibrationSchedule/" + id));
    }
  };

  const resetForm = () => {
    setEditId(null);
    setForm({
      instrumentId: "",
      name: "",
      serial: "",
      lastCal: "",
      interval: "",
      nextCal: "",
    });
  };

  const getStatus = (nextCal) => {
    if (!nextCal) return "-";
    return new Date(nextCal) < new Date()
      ? "OVERDUE"
      : "OK";
  };

  // ======================
  // RENDER
  // ======================
  return (
    <div style={{ padding: 20 }}>
      <h2>📅 Calibration Schedule</h2>

      {/* MENU */}
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => navigate("/dashboard")}>
          Dashboard
        </button>{" "}
        <button onClick={() => navigate("/instrument-list")}>
          Instrument List
        </button>
      </div>

      {/* FORM */}
      <fieldset style={{ marginBottom: 16 }}>
        <legend>Set Calibration Interval</legend>

        <select
          value={form.instrumentId}
          onChange={selectInstrument}
        >
          <option value="">-- Pilih Instrument --</option>
          {instrumentList.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name} ({i.serial})
            </option>
          ))}
        </select>{" "}

        <input value={form.serial} readOnly />{" "}

        <input
          type="date"
          name="lastCal"
          value={form.lastCal}
          onChange={handleChange}
        />{" "}

        <input
          type="number"
          name="interval"
          placeholder="Interval (bulan)"
          value={form.interval}
          onChange={handleChange}
          style={{ width: 140 }}
        />{" "}

        <button onClick={saveSchedule}>
          {editId ? "Update Schedule" : "Save Schedule"}
        </button>
      </fieldset>

      {/* TABLE */}
      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Instrument</th>
            <th>Serial</th>
            <th>Last</th>
            <th>Interval</th>
            <th>Next</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {scheduleList.length === 0 && (
            <tr>
              <td colSpan="7" align="center">
                Belum ada schedule
              </td>
            </tr>
          )}

          {scheduleList.map((s) => (
            <tr key={s._id}>
              <td>{s.name}</td>
              <td>{s.serial}</td>
              <td>{s.lastCal}</td>
              <td>{s.interval}</td>
              <td>{s.nextCal}</td>
              <td
                style={{
                  color:
                    getStatus(s.nextCal) === "OVERDUE"
                      ? "red"
                      : "green",
                  fontWeight: "bold",
                }}
              >
                {getStatus(s.nextCal)}
              </td>
              <td>
                <button onClick={() => editSchedule(s)}>
                  Edit
                </button>{" "}
                <button
                  onClick={() => deleteSchedule(s._id)}
                >
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
