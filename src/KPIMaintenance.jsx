// src/KPIMaintenance.jsx
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function KPIMaintenance() {
  const navigate = useNavigate();
  const [pm, setPm] = useState([]);
  const [month, setMonth] = useState(`${new Date().getMonth()+1}`.padStart(2,"0"));
  const [year, setYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    return onValue(ref(database, "pmHistory"), snap => {
      const v = snap.val() || {};
      setPm(Object.values(v));
    });
  }, []);

  const filtered = pm.filter(i => {
    const d = new Date(i.tanggal);
    return (
      `${d.getMonth()+1}`.padStart(2,"0") === month &&
      d.getFullYear().toString() === year
    );
  });

  const total = filtered.length;
  const completed = filtered.filter(i => i.status === "Completed").length;

  const rate = total === 0 ? 0 : ((completed / total) * 100).toFixed(1);

  const overdue = filtered.filter(i => i.status === "Overdue").length;

  return (
    <div style={{ padding: 20 }}>
      <h2>🛠 KPI Preventive Maintenance</h2>
      <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>

      <div style={{ marginTop: 20 }}>
        <select value={month} onChange={e => setMonth(e.target.value)}>
          {["01","02","03","04","05","06","07","08","09","10","11","12"].map(m => (
            <option key={m}>{m}</option>
          ))}
        </select>

        <select value={year} onChange={e => setYear(e.target.value)}>
          {["2024","2025","2026"].map(y => (
            <option key={y}>{y}</option>
          ))}
        </select>
      </div>

      <table border="1" width="100%" cellPadding="6" style={{ marginTop: 20 }}>
        <tbody>
          <tr><td>Total PM</td><td>{total}</td></tr>
          <tr><td>PM Completed</td><td>{completed}</td></tr>
          <tr><td>Completion Rate</td><td>{rate}%</td></tr>
          <tr><td>PM Overdue</td><td>{overdue}</td></tr>
        </tbody>
      </table>
    </div>
  );
}
